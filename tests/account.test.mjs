// Customer accounts: sign-in links (one use, 15 minutes, rate-limited, one answer for every
// address), the signed session cookie, and the dashboard data built from Whop purchases.
// Run from the repo root: node --test tests/account.test.mjs
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import worker from "../gdrock-worker.js";

const SECRET = "ws_testsecret";
const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

function kv() {
  const m = new Map();
  return {
    m,
    async get(k, type) { if (!m.has(k)) return null; const v = m.get(k); return type === "arrayBuffer" ? new TextEncoder().encode(v).buffer : v; },
    async put(k, v) { m.set(k, typeof v === "string" ? v : String(v)); },
    async delete(k) { m.delete(k); },
    async list({ prefix = "" } = {}) { return { keys: [...m.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }; },
  };
}
const env = (extra = {}) => ({ WHOP_WEBHOOK_SECRET: SECRET, ACCOUNT_SECRET: "acct-secret", DOWNLOAD_SECRET: "dl", SUPABASE_URL: "https://sb.example",
  SUPABASE_ANON_KEY: "anon", TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1", ZEPTO_TOKEN: "z", WHOP_API_KEY: "wk", DEEP_SCAN: kv(), ...extra });

function record(sites = {}) {
  const calls = { emails: [], telegram: [], leads: [], checkouts: [] };
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.startsWith("https://sb.example/rest/v1/sites")) {
      if (init.method === "POST") { const b = JSON.parse(init.body); sites[b.site_id] = b; return new Response(null, { status: 201 }); }
      if (init.method === "PATCH") return Response.json([]);
      const id = decodeURIComponent((url.match(/site_id=eq\.([^&]+)/) || [])[1] || "");
      return Response.json(sites[id] ? [{ site_id: id, access_code: sites[id].access_code, plan: sites[id].plan, active: sites[id].active }] : []);
    }
    if (url.startsWith("https://sb.example/rest/v1/leads")) { calls.leads.push(JSON.parse(init.body)); return new Response(null, { status: 201 }); }
    if (url.startsWith("https://api.telegram.org/")) { calls.telegram.push(JSON.parse(init.body).text); return Response.json({ ok: true }); }
    if (url.startsWith("https://api.zeptomail.com/")) { const b = JSON.parse(init.body); calls.emails.push({ to: b.to[0].email_address.address, subject: b.subject, html: b.htmlbody }); return Response.json({}); }
    if (url.startsWith("https://api.whop.com/api/v1/checkout_configurations")) { calls.checkouts.push(JSON.parse(init.body)); return Response.json({ purchase_url: "/checkout/abc" }); }
    return Response.json({});
  };
  return calls;
}

const ctx = { waitUntil() {} };
const ORIGIN = "https://www.gdrock.com";
const call = (e, path, { method = "POST", body, cookie, origin = ORIGIN, ip = "9.9.9.9" } = {}) => worker.fetch(new Request("https://cdn.gdrock.com" + path, {
  method, body: body ? JSON.stringify(body) : undefined,
  headers: { "Content-Type": "application/json", "CF-Connecting-IP": ip, ...(origin ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}) } }), e, ctx);
const linkToken = (html) => (html.match(/account\?t=([A-Za-z0-9_-]+)/) || [])[1];
async function signIn(e, calls, email = "owner@shopmail.co") {
  await call(e, "/api/account/start", { body: { email } });
  const token = linkToken(calls.emails.at(-1).html);
  const res = await call(e, "/api/account/verify", { body: { token } });
  return (res.headers.get("Set-Cookie") || "").split(";")[0];
}

function signed(body) {
  const raw = JSON.stringify(body), id = "msg_" + Math.random().toString(36).slice(2), ts = String(Math.floor(Date.now() / 1000));
  const sig = createHmac("sha256", SECRET).update(`${id}.${ts}.${raw}`).digest("base64");
  return new Request("https://cdn.gdrock.com/api/whop-webhook", { method: "POST", body: raw,
    headers: { "Content-Type": "application/json", "webhook-id": id, "webhook-timestamp": ts, "webhook-signature": `v1,${sig}` } });
}
const hook = (e, body) => worker.fetch(signed(body), e, ctx);
const payment = (plan, email, extra = {}) => ({ type: "payment.succeeded", data: { id: "pay_" + plan, total: 29, currency: "eur",
  membership: { id: "mem_" + plan, status: "active" }, plan: { id: plan }, product: { id: "prod_1", title: "x" }, user: { id: "u1", email }, metadata: null, ...extra } });

test("a sign-in link is emailed, stored only as a hash, and the answer is the same for every address", async () => {
  const e = env(), calls = record();
  const res = await call(e, "/api/account/start", { body: { email: " Owner@ShopMail.co " } });
  assert.equal(res.status, 200);
  const out = await res.json();
  assert.match(out.message, /owner@shopmail\.co/);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), ORIGIN);
  assert.equal(res.headers.get("Access-Control-Allow-Credentials"), "true");
  assert.equal(calls.emails.length, 1);
  assert.equal(calls.emails[0].to, "owner@shopmail.co");
  assert.match(calls.emails[0].subject, /sign-in link/);
  const token = linkToken(calls.emails[0].html);
  assert.ok(token && token.length >= 40);
  const keys = [...e.DEEP_SCAN.m.keys()].filter((k) => k.startsWith("acct:otl:"));
  assert.equal(keys.length, 1);
  assert.ok(!keys[0].includes(token), "the token itself is never a KV key");
  const other = await (await call(e, "/api/account/start", { body: { email: "nobody@else.co" } })).json();
  assert.equal(other.message.replace("nobody@else.co", "X"), out.message.replace("owner@shopmail.co", "X"));
});

test("sign-in requests: four emails an hour per address (same answer after), ten per connection", async () => {
  const e = env(), calls = record();
  for (let i = 0; i < 6; i++) assert.equal((await call(e, "/api/account/start", { body: { email: "a@shopmail.co" } })).status, 200);
  assert.equal(calls.emails.length, 4);
  for (let i = 0; i < 4; i++) await call(e, "/api/account/start", { body: { email: `b${i}@shopmail.co` } });
  const blocked = await call(e, "/api/account/start", { body: { email: "c@shopmail.co" } });
  assert.equal(blocked.status, 429);
  assert.equal((await call(e, "/api/account/start", { body: { email: "c@shopmail.co" }, ip: "8.8.8.8" })).status, 200);
});

test("only gdrock.com pages can ask for a link or sign in", async () => {
  const e = env(); record();
  assert.equal((await call(e, "/api/account/start", { body: { email: "a@shopmail.co" }, origin: "https://evil.example" })).status, 403);
  assert.equal((await call(e, "/api/account/start", { body: { email: "a@shopmail.co" }, origin: null })).status, 403);
  assert.equal((await call(e, "/api/account/start", { body: { email: "not an email" } })).status, 400);
  const pre = await call(e, "/api/account/me", { method: "OPTIONS", origin: "https://gdrock.com" });
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get("Access-Control-Allow-Origin"), "https://gdrock.com");
});

test("a link signs in once: HttpOnly session cookie for 90 days, a new account becomes a lead", async () => {
  const e = env(), calls = record();
  await call(e, "/api/account/start", { body: { email: "owner@shopmail.co", next: "pack" } });
  const token = linkToken(calls.emails[0].html);
  const res = await call(e, "/api/account/verify", { body: { token } });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, email: "owner@shopmail.co", next: "pack" });
  const c = res.headers.get("Set-Cookie");
  assert.match(c, /^__Host-gdr_s=v1\./);
  assert.match(c, /HttpOnly/); assert.match(c, /Secure/); assert.match(c, /SameSite=Lax/); assert.match(c, /Path=\//);
  assert.match(c, /Max-Age=7776000/);
  assert.equal(calls.leads.length, 1);
  assert.equal(calls.leads[0].source, "account");
  assert.ok(calls.telegram.some((t) => /New GDRock account: owner@shopmail\.co/.test(t)));
  const again = await call(e, "/api/account/verify", { body: { token } });
  assert.equal(again.status, 400);
  assert.match((await again.json()).error, /expired or was already used/);
  // A second sign-in later is not a new lead.
  await signIn(e, calls);
  assert.equal(calls.leads.length, 1);
});

test("the dashboard needs a valid, untampered, unexpired session", async () => {
  const e = env(), calls = record();
  assert.equal((await call(e, "/api/account/me", { method: "GET" })).status, 401);
  const cookie = await signIn(e, calls);
  const me = await call(e, "/api/account/me", { method: "GET", cookie });
  assert.equal(me.status, 200);
  const v = await me.json();
  assert.equal(v.email, "owner@shopmail.co");
  assert.equal(v.corePack, false);
  assert.deepEqual(v.sites, []);
  const [name, val] = cookie.split("=");
  const parts = val.split(".");
  const forged = `${name}=v1.${Buffer.from("rich@buyer.co").toString("base64url")}.${parts[2]}.${parts[3]}`;
  assert.equal((await call(e, "/api/account/me", { method: "GET", cookie: forged })).status, 401);
  e.ACCOUNT_SECRET = "rotated";
  assert.equal((await call(e, "/api/account/me", { method: "GET", cookie })).status, 401);
  const out = await call(e, "/api/account/signout", { body: {} });
  assert.match(out.headers.get("Set-Cookie"), /Max-Age=0/);
});

test("Core Pack bought: the account unlocks it; a refund locks it again", async () => {
  const e = env(), calls = record();
  const cookie = await signIn(e, calls);
  await hook(e, payment("plan_gWq2g08EUZLAg", "Owner@ShopMail.co"));
  let v = await (await call(e, "/api/account/me", { method: "GET", cookie })).json();
  assert.equal(v.corePack, true);
  assert.equal(v.plans[0].label, "Core Pack");
  await hook(e, { type: "refund.created", data: { id: "ref_1", membership: { id: "mem_plan_gWq2g08EUZLAg" }, user: { email: "owner@shopmail.co" } } });
  v = await (await call(e, "/api/account/me", { method: "GET", cookie })).json();
  assert.equal(v.corePack, false);
  assert.deepEqual(v.plans, []);
});

test("bought from the account but paid with another email: the purchase still shows in the account", async () => {
  const e = env(), calls = record();
  const cookie = await signIn(e, calls);
  const co = await (await call(e, "/api/account/checkout", { body: { plan: "core" }, cookie })).json();
  assert.equal(co.url, "https://whop.com/checkout/abc");
  assert.equal(calls.checkouts[0].metadata.gdrock_account, "owner@shopmail.co");
  assert.equal(calls.checkouts[0].plan_id, "plan_gWq2g08EUZLAg");
  assert.match(calls.checkouts[0].redirect_url, /gdrock\.com\/account\?bought=core/);
  await hook(e, payment("plan_gWq2g08EUZLAg", "paypal-me@other.co", { metadata: { gdrock_account: "owner@shopmail.co", gdrock_plan: "core" } }));
  const v = await (await call(e, "/api/account/me", { method: "GET", cookie })).json();
  assert.equal(v.corePack, true);
  assert.equal(v.plans[0].paidWith, "paypal-me@other.co");
  assert.equal((await call(e, "/api/account/checkout", { body: { plan: "agency" }, cookie })).status, 400);
  assert.equal((await call(e, "/api/account/checkout", { body: { plan: "core" } })).status, 401);
});

test("Care bought on Whop: the dashboard shows the free site, and adding it there provisions it", async () => {
  const e = env(), sites = {}, calls = record(sites);
  const cookie = await signIn(e, calls);
  await hook(e, payment("plan_Hzt8oE2YfKseZ", "owner@shopmail.co"));
  let v = await (await call(e, "/api/account/me", { method: "GET", cookie })).json();
  assert.equal(v.corePack, true, "Care includes the Core Pack");
  assert.deepEqual(v.waiting, [{ plan: "care", label: "Care", free: 1 }]);
  const res = await (await call(e, "/api/account/activate", { body: { website_url: "https://www.myshop.co/" }, cookie })).json();
  assert.match(res.message, /myshop\.co is active/);
  assert.equal(res.view.sites[0].site, "myshop.co");
  assert.match(res.view.sites[0].code, /^GDR-/);
  assert.deepEqual(res.view.waiting, []);
  assert.ok(calls.emails.some((m) => /access code/.test(m.subject)));
});

test("a setup purchase shows as Done-For-You; a Core Pack alone can't activate a banner site", async () => {
  const e = env(), calls = record();
  const cookie = await signIn(e, calls);
  await hook(e, payment("plan_rDl4G6eAcftqC", "owner@shopmail.co", { metadata: { website_url: "myshop.co" } }));
  await hook(e, payment("plan_gWq2g08EUZLAg", "owner@shopmail.co"));
  const v = await (await call(e, "/api/account/me", { method: "GET", cookie })).json();
  assert.deepEqual(v.setups.map((s) => [s.label, s.site]), [["Essential Setup", "myshop.co"]]);
  const res = await (await call(e, "/api/account/activate", { body: { website_url: "myshop.co" }, cookie })).json();
  assert.match(res.message, /no Care or Portfolio plan/);
  assert.ok(!calls.emails.some((m) => /no free site/.test(m.subject)));
});

test("buyer emails point to the account", async () => {
  const e = env(), calls = record();
  await hook(e, payment("plan_gWq2g08EUZLAg", "owner@shopmail.co"));
  assert.match(calls.emails[0].html, /gdrock\.com\/account/);
});

// -- The Core Pack inside the account ---------------------------------------------------------
const packGet = (e, path, cookie) => worker.fetch(new Request("https://cdn.gdrock.com" + path, {
  headers: { Origin: ORIGIN, ...(cookie ? { Cookie: cookie } : {}) } }), e, ctx);
const dlToken = (email) => createHmac("sha256", "dl").update("corepack:" + email).digest("base64url").slice(0, 32);
function withAssets(e) {
  e.DEEP_SCAN.m.set("asset:core-pack.zip", "PAIDZIP");
  for (const n of ["01.pdf", "02.docx", "03-preview.pdf", "04-preview.pdf", "05-preview.pdf"]) e.DEEP_SCAN.m.set("asset:free:" + n, "FREE " + n);
  return e;
}

test("free parts need an account; only the listed free files are served", async () => {
  const e = withAssets(env()), calls = record();
  assert.equal((await packGet(e, "/api/pack/free/01.pdf")).status, 401);
  const cookie = await signIn(e, calls);
  const r = await packGet(e, "/api/pack/free/01.pdf", cookie);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("Content-Type"), "application/pdf");
  assert.equal(r.headers.get("Access-Control-Allow-Credentials"), "true");
  assert.equal(await r.text(), "FREE 01.pdf");
  assert.equal((await packGet(e, "/api/pack/free/02.docx", cookie)).status, 200);
  for (const bad of ["core-pack.zip", "..%2Fcore-pack.zip", "03.pdf", "gdrock-consent.js"]) assert.equal((await packGet(e, "/api/pack/free/" + bad, cookie)).status, 404, bad);
});

test("the full zip only goes to an account that owns the Core Pack", async () => {
  const e = withAssets(env()), calls = record();
  assert.equal((await packGet(e, "/api/pack/zip")).status, 401);
  const cookie = await signIn(e, calls);
  assert.equal((await packGet(e, "/api/pack/zip", cookie)).status, 403);
  await hook(e, payment("plan_gWq2g08EUZLAg", "owner@shopmail.co"));
  const r = await packGet(e, "/api/pack/zip", cookie);
  assert.equal(r.status, 200);
  assert.equal(await r.text(), "PAIDZIP");
});

test("old signed links keep working, unlock the account of that email, and stop after a refund", async () => {
  const e = withAssets(env()), calls = record();
  const link = (email) => `/dl/core-pack?e=${encodeURIComponent(email)}&t=${dlToken(email)}`;
  // A buyer from before accounts: no purchase on file, link still valid.
  assert.equal((await packGet(e, link("early@shopmail.co"))).status, 200);
  const cookie = await signIn(e, calls, "early@shopmail.co");
  assert.equal((await (await call(e, "/api/account/me", { method: "GET", cookie })).json()).corePack, true);
  // A refunded buyer: the link stops.
  await hook(e, payment("plan_gWq2g08EUZLAg", "owner@shopmail.co"));
  assert.equal((await packGet(e, link("owner@shopmail.co"))).status, 200);
  await hook(e, { type: "payment.refunded", data: { id: "pay_x", membership: { id: "mem_plan_gWq2g08EUZLAg" } } });
  assert.equal((await packGet(e, link("owner@shopmail.co"))).status, 403);
  assert.equal((await packGet(e, "/dl/core-pack?e=owner@shopmail.co&t=wrong")).status, 403);
});

test("unlocking from the Core Pack page comes back to it", async () => {
  const e = env(), calls = record();
  const cookie = await signIn(e, calls);
  await call(e, "/api/account/checkout", { body: { plan: "core", back: "pack" }, cookie });
  assert.match(calls.checkouts[0].redirect_url, /gdrock\.com\/pack\.html\?bought=core$/);
});

// -- Care, 3 months free, for Core Pack buyers -------------------------------------------------
const CARE3 = "plan_YmrCzfSK7bj1c";
const trialPay = (email, mid = "mem_trial", extra = {}) => ({ type: "membership.activated", data: { id: mid, plan: { id: CARE3 }, product: { title: "Care" },
  user: { email }, metadata: { gdrock_plan: "care3", gdrock_account: email }, ...extra } });
const me = async (e, cookie) => (await call(e, "/api/account/me", { method: "GET", cookie })).json();

test("the free Care months: only for Core Pack buyers, through the account, once per email", async () => {
  const e = env(), calls = record();
  const cookie = await signIn(e, calls);
  assert.equal((await me(e, cookie)).careOffer.eligible, false, "no Core Pack, no offer");
  assert.equal((await call(e, "/api/account/care-offer", { body: {}, cookie })).status, 403);
  await hook(e, payment("plan_gWq2g08EUZLAg", "owner@shopmail.co"));
  assert.equal((await me(e, cookie)).careOffer.eligible, true);
  const co = await (await call(e, "/api/account/care-offer", { body: {}, cookie })).json();
  assert.equal(co.url, "https://whop.com/checkout/abc");
  const sent = calls.checkouts.at(-1);
  assert.equal(sent.plan_id, CARE3);
  assert.equal(sent.metadata.gdrock_plan, "care3");
  assert.equal(sent.metadata.gdrock_account, "owner@shopmail.co");
  await hook(e, trialPay("owner@shopmail.co"));
  const t = JSON.parse(e.DEEP_SCAN.m.get("care:trial:mem_trial"));
  const days = (Date.parse(t.chargeAt) - Date.parse(t.start)) / 86400000;
  assert.ok(days > 89.9 && days < 90.1, "charge 90 days on");
  assert.equal(t.reminded, false);
  const v = await me(e, cookie);
  assert.equal(v.careOffer.eligible, false);
  assert.equal(v.careOffer.claimed, true);
  assert.deepEqual(v.waiting, [{ plan: "care3", label: "Care (3 months free)", free: 1 }]);
  assert.equal((await call(e, "/api/account/care-offer", { body: {}, cookie })).status, 403);
  assert.ok(!calls.telegram.some((m) => /Check this free Care trial/.test(m)));
  // Whop sends a second event for the same membership: the trial record isn't restarted.
  await hook(e, trialPay("owner@shopmail.co"));
  assert.equal(JSON.parse(e.DEEP_SCAN.m.get("care:trial:mem_trial")).start, t.start);
});

test("a Care or Portfolio customer gets no free months; a trial with no Core Pack alerts the owner", async () => {
  const e = env(), calls = record();
  const cookie = await signIn(e, calls);
  await hook(e, payment("plan_gWq2g08EUZLAg", "owner@shopmail.co"));
  await hook(e, payment("plan_Hzt8oE2YfKseZ", "owner@shopmail.co"));
  assert.equal((await me(e, cookie)).careOffer.eligible, false);
  await hook(e, trialPay("stranger@shopmail.co", "mem_x"));
  assert.ok(calls.telegram.some((m) => /Check this free Care trial: stranger@shopmail\.co/.test(m)));
});

test("the reminder goes out once, about a week before the first charge; a cancelled trial gets none", async () => {
  const e = env(), calls = record();
  const day = 86400000, put = (mid, inDays, extra = {}) => e.DEEP_SCAN.m.set("care:trial:" + mid, JSON.stringify({ email: mid + "@shopmail.co", account: "",
    start: new Date().toISOString(), chargeAt: new Date(Date.now() + inDays * day).toISOString(), reminded: false, cancelled: false, ...extra }));
  put("soon", 6.5); put("later", 20); put("past", -5); put("gone", 5);
  await hook(e, { type: "membership.cancelled", data: { id: "gone", membership: { id: "gone" } } });
  for (let run = 0; run < 2; run++) { const jobs = []; await worker.scheduled({}, e, { waitUntil: (p) => jobs.push(p) }); await Promise.all(jobs); }
  const reminders = calls.emails.filter((m) => /Your free Care months end on/.test(m.subject));
  assert.deepEqual(reminders.map((m) => m.to), ["soon@shopmail.co"]);
  assert.match(reminders[0].html, /€15 a month/);
  assert.match(reminders[0].html, /Cancel on Whop before/);
  assert.equal(JSON.parse(e.DEEP_SCAN.m.get("care:trial:soon")).reminded, true);
  assert.equal(JSON.parse(e.DEEP_SCAN.m.get("care:trial:gone")).cancelled, true);
});

test("the Core Pack email offers the free Care months, pointing at the account", async () => {
  const e = env(), calls = record();
  await hook(e, payment("plan_gWq2g08EUZLAg", "owner@shopmail.co"));
  assert.match(calls.emails[0].html, /Three months of Care, free/);
  assert.match(calls.emails[0].html, /week before the first charge/);
});

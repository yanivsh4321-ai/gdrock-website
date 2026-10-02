// Whop sales, end to end inside the Worker: a purchase made through gdrock.com provisions at once;
// one made on Whop itself waits in KV for /api/whop-activate; setups get a booking email; the
// Core Pack link only works for the email it was made for; cancellations find activated sites.
// Run from the repo root: node --test tests/whop-sales.test.mjs
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

function env(extra = {}) {
  return { WHOP_WEBHOOK_SECRET: SECRET, SUPABASE_URL: "https://sb.example", SUPABASE_ANON_KEY: "anon",
    TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1", ZEPTO_TOKEN: "z", DEEP_SCAN: kv(), ...extra };
}

// Records every outbound call; `sites` is the fake Supabase sites table.
function record(sites = {}) {
  const calls = { upserts: [], patches: [], telegram: [], emails: [] };
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.startsWith("https://sb.example/rest/v1/sites")) {
      if (init.method === "POST") { const b = JSON.parse(init.body); sites[b.site_id] = b; calls.upserts.push(b); return new Response(null, { status: 201 }); }
      if (init.method === "PATCH") { calls.patches.push({ url, body: JSON.parse(init.body) }); return Response.json([]); }
      const id = decodeURIComponent((url.match(/site_id=eq\.([^&]+)/) || [])[1] || "");
      return Response.json(sites[id] ? [{ site_id: id, access_code: sites[id].access_code }] : []);
    }
    if (url.startsWith("https://api.telegram.org/")) { calls.telegram.push(JSON.parse(init.body).text); return Response.json({ ok: true }); }
    if (url.startsWith("https://api.zeptomail.com/")) { const b = JSON.parse(init.body); calls.emails.push({ to: b.to[0].email_address.address, subject: b.subject, html: b.htmlbody }); return Response.json({}); }
    return Response.json({});
  };
  return calls;
}

function signed(body) {
  const raw = JSON.stringify(body), id = "msg_" + Math.random().toString(36).slice(2), ts = String(Math.floor(Date.now() / 1000));
  const sig = createHmac("sha256", SECRET).update(`${id}.${ts}.${raw}`).digest("base64");
  return new Request("https://cdn.gdrock.com/api/whop-webhook", { method: "POST", body: raw,
    headers: { "Content-Type": "application/json", "webhook-id": id, "webhook-timestamp": ts, "webhook-signature": `v1,${sig}` } });
}
const ctx = { waitUntil() {} };
const hook = (e, body) => worker.fetch(signed(body), e, ctx);
const activate = (e, email, site, ip = "1.2.3.4") => worker.fetch(new Request("https://cdn.gdrock.com/api/whop-activate", {
  method: "POST", body: JSON.stringify({ email, website_url: site }), headers: { "Content-Type": "application/json", "CF-Connecting-IP": ip } }), e, ctx);

// Shaped like Whop's v1 payment object: membership, plan, product, user, total, currency.
const payment = (plan, extra = {}) => ({ type: "payment.succeeded", data: { id: "pay_1", total: 15, currency: "eur",
  membership: { id: "mem_1", status: "active" }, plan: { id: plan }, product: { id: "prod_1", title: "Care" },
  user: { id: "user_1", email: "Owner@Shopmail.co" }, metadata: null, ...extra } });

test("bought through gdrock.com: the site is provisioned at once and remembered for later revokes", async () => {
  const e = env(), calls = record();
  const res = await hook(e, payment("plan_Hzt8oE2YfKseZ", { metadata: { website_url: "https://www.myshop.co/", gdrock_plan: "care" } }));
  assert.equal((await res.json()).provisioned, "myshop.co");
  assert.equal(calls.upserts.length, 1);
  assert.equal(calls.upserts[0].plan, "care");
  assert.equal(calls.emails.length, 1);
  assert.match(calls.emails[0].subject, /access code/);
  assert.match(e.DEEP_SCAN.m.get("whop:mem:mem_1"), /owner@shopmail\.co/);
});

test("bought on Whop itself: no site yet, so the buyer gets an activation link and the owner a note", async () => {
  const e = env(), calls = record();
  const res = await hook(e, payment("plan_Hzt8oE2YfKseZ"));
  assert.equal((await res.json()).pending_activation, "owner@shopmail.co");
  assert.equal(calls.upserts.length, 0);
  assert.equal(calls.emails.length, 1);
  assert.match(calls.emails[0].html, /activate\.html\?email=owner%40shopmail\.co/);
  assert.match(calls.telegram[0], /New Whop sale: Care · 15 EUR/);
  const rec = JSON.parse(e.DEEP_SCAN.m.get("whop:buyer:owner@shopmail.co"));
  assert.deepEqual([rec.purchases.length, rec.purchases[0].limit, rec.purchases[0].plan], [1, 1, "care"]);
});

test("Whop's second event for the same purchase sends nothing new", async () => {
  const e = env(), calls = record();
  await hook(e, payment("plan_Hzt8oE2YfKseZ"));
  await hook(e, { type: "membership.activated", data: { id: "mem_1", plan: { id: "plan_Hzt8oE2YfKseZ" }, user: { email: "owner@shopmail.co" } } });
  assert.equal(calls.emails.length, 1);
  assert.equal(calls.telegram.length, 1);
});

test("activation provisions the site, emails the code to the buyer, and fills the one slot", async () => {
  const e = env(), sites = {}, calls = record(sites);
  await hook(e, payment("plan_Hzt8oE2YfKseZ"));
  const res = await activate(e, "owner@shopmail.co", "https://shop-one.co/collections");
  assert.match((await res.json()).message, /on its way/);
  assert.equal(calls.upserts.length, 1);
  assert.equal(calls.upserts[0].site_id, "shop-one.co");
  assert.equal(calls.emails.at(-1).to, "owner@shopmail.co");
  assert.match(calls.emails.at(-1).html, new RegExp(sites["shop-one.co"].access_code));
  // Care covers one site: a second one is refused, and the buyer is told why by email.
  await activate(e, "owner@shopmail.co", "shop-two.co");
  assert.equal(calls.upserts.length, 1);
  assert.match(calls.emails.at(-1).subject, /no free site left/);
});

test("activating the same site again re-sends its code instead of minting a new one", async () => {
  const e = env(), sites = {}, calls = record(sites);
  await hook(e, payment("plan_Hzt8oE2YfKseZ"));
  await activate(e, "owner@shopmail.co", "shop-one.co");
  const code = sites["shop-one.co"].access_code;
  await activate(e, "owner@shopmail.co", "shop-one.co");
  assert.equal(calls.upserts.length, 1);
  assert.match(calls.emails.at(-1).html, new RegExp(code));
});

test("the activation page answers the same whether or not the email bought anything", async () => {
  const e = env(), calls = record();
  const a = await (await activate(e, "nobody@shopmail.co", "shop-one.co")).json();
  assert.match(a.message, /If nobody@shopmail\.co has a GDRock purchase waiting/);
  assert.equal(calls.upserts.length + calls.emails.length, 0);
});

test("a site that already exists is never overwritten from the public form", async () => {
  const e = env(), sites = { "taken.co": { site_id: "taken.co", access_code: "GDR-AAAA-BBBB" } }, calls = record(sites);
  await hook(e, payment("plan_Hzt8oE2YfKseZ"));
  await activate(e, "owner@shopmail.co", "taken.co");
  assert.equal(calls.upserts.length, 0);
  assert.match(calls.telegram.at(-1), /needs a look/);
});

test("Portfolio 50 bought on Whop covers fifty sites and is stored as the agency plan", async () => {
  const e = env(), calls = record();
  await hook(e, payment("plan_ovQfuAhjkvcFn", { total: 499, product: { id: "prod_9", title: "Portfolio: up to 50 sites" } }));
  await activate(e, "owner@shopmail.co", "client-a.co");
  await activate(e, "owner@shopmail.co", "client-b.co");
  assert.deepEqual(calls.upserts.map((u) => [u.site_id, u.plan]), [["client-a.co", "agency"], ["client-b.co", "agency"]]);
  assert.match(calls.emails[0].html, /up to 50 sites/);
});

test("a setup purchase gets a booking email and one owner alert, never an access code", async () => {
  const e = env(), calls = record();
  await hook(e, payment("plan_rDl4G6eAcftqC", { total: 249, product: { id: "prod_2", title: "We install it: Essential Setup" } }));
  await hook(e, { type: "membership.activated", data: { id: "mem_1", plan: { id: "plan_rDl4G6eAcftqC" }, user: { email: "owner@shopmail.co" } } });
  assert.equal(calls.upserts.length, 0);
  assert.equal(calls.emails.length, 1);
  assert.match(calls.emails[0].html, /cal\.eu\/gdrock\/15min/);
  assert.equal(calls.telegram.length, 1);
  assert.match(calls.telegram[0], /New setup sale: Essential Setup · 249 EUR/);
});

test("a plan the Worker doesn't know is reported, not guessed", async () => {
  const e = env(), calls = record();
  const res = await hook(e, payment("plan_brandnew", { product: { id: "prod_x", title: "Something New" } }));
  assert.equal((await res.json()).note, "unknown plan");
  assert.equal(calls.upserts.length + calls.emails.length, 0);
  assert.match(calls.telegram[0], /doesn't know: Something New/);
});

test("cancelling a Whop-bought plan switches off the sites activated for it", async () => {
  const e = env(), calls = record();
  await hook(e, payment("plan_Hzt8oE2YfKseZ"));
  await activate(e, "owner@shopmail.co", "shop-one.co");
  const res = await hook(e, { type: "membership.deactivated", data: { id: "mem_1", user: { email: "owner@shopmail.co" } } });
  assert.deepEqual((await res.json()).revoked, ["shop-one.co"]);
  assert.deepEqual(calls.patches.at(-1).body, { active: false });
  assert.match(calls.patches.at(-1).url, /site_id=eq\.shop-one\.co/);
  // A cancelled purchase has no slot left to activate with.
  await activate(e, "owner@shopmail.co", "shop-new.co");
  assert.equal(calls.upserts.length, 1);
});

test("a monthly renewal of an activated Whop purchase keeps its sites on, with no new emails", async () => {
  const e = env(), calls = record();
  await hook(e, payment("plan_Hzt8oE2YfKseZ"));
  await activate(e, "owner@shopmail.co", "shop-one.co");
  const before = calls.emails.length;
  const res = await hook(e, payment("plan_Hzt8oE2YfKseZ", { id: "pay_2", billing_reason: "subscription_cycle" }));
  assert.deepEqual((await res.json()).renewed, ["shop-one.co"]);
  assert.equal(calls.emails.length, before);
  assert.deepEqual(calls.patches.at(-1).body, { active: true });
});

test("Core Pack: files only, one email with a download link that works only for that email", async () => {
  const e = env(), calls = record();
  e.DEEP_SCAN.m.set("asset:core-pack.zip", "PK-fake-zip");
  // Bought through gdrock.com (site in metadata) or on Whop: either way no hosted access, just the files.
  await hook(e, payment("plan_gWq2g08EUZLAg", { total: 29, product: { id: "prod_3", title: "Core Pack" }, metadata: { website_url: "myshop.co", gdrock_plan: "core" } }));
  await hook(e, { type: "membership.activated", data: { id: "mem_1", plan: { id: "plan_gWq2g08EUZLAg" }, user: { email: "owner@shopmail.co" } } });
  assert.equal(calls.upserts.length, 0);
  assert.equal(calls.emails.length, 1);
  assert.match(calls.emails[0].subject, /Core Pack: download inside/);
  assert.match(calls.telegram[0], /New Whop sale: Core Pack · 29 EUR/);
  const link = (calls.emails[0].html.match(/https:\/\/cdn\.gdrock\.com\/dl\/core-pack\?[^"]+/) || [])[0];
  assert.ok(link, "download link in the email");
  const ok = await worker.fetch(new Request(link.replace(/&amp;/g, "&")), e, ctx);
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("Content-Type"), "application/zip");
  const forged = await worker.fetch(new Request(link.replace(/&amp;/g, "&").replace("owner%40shopmail.co", "thief%40shopmail.co")), e, ctx);
  assert.equal(forged.status, 403);
});

test("reserved test addresses (Whop's dashboard test events) are never emailed", async () => {
  const e = env(), calls = record();
  await hook(e, payment("plan_Hzt8oE2YfKseZ", { user: { email: "test@example.com" } }));
  assert.equal(calls.emails.length, 0);
  assert.equal(calls.telegram.length, 1);
});

test("the activation form rate-limits one connection to ten tries an hour", async () => {
  const e = env(); record();
  for (let i = 0; i < 10; i++) await activate(e, `x${i}@shopmail.co`, "shop-one.co", "9.9.9.9");
  const res = await activate(e, "x@shopmail.co", "shop-one.co", "9.9.9.9");
  assert.equal(res.status, 429);
});

test("bad input on the activation form gets a plain error", async () => {
  const e = env(); record();
  assert.equal((await activate(e, "not-an-email", "shop.co")).status, 400);
  assert.equal((await activate(e, "a@shopmail.co", "localhost")).status, 400);
});

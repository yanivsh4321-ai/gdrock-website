// Deep check: /api/deep-scan queues a job (KV), the runner on the German VPS takes it with its token, runs the
// before-consent rig and posts the result back, and the Worker emails it. Before KV is bound, a request is kept as a
// lead so nobody who asked is lost. Run from the repo root: node --test tests/
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import worker from "../gdrock-worker.js";

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

function fakeKV() {
  const m = new Map(), ttl = new Map();
  return {
    m, ttl,
    async get(k) { return m.has(k) ? m.get(k) : null; },
    async put(k, v, o = {}) { m.set(k, String(v)); ttl.set(k, o.expirationTtl); },
    async delete(k) { m.delete(k); ttl.delete(k); },
    async list({ prefix = "", limit = 1000 } = {}) { return { keys: [...m.keys()].filter((k) => k.startsWith(prefix)).sort().slice(0, limit).map((name) => ({ name })) }; },
  };
}
function capture() {
  const telegram = [], emails = [], supabase = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.startsWith("https://api.telegram.org/")) { telegram.push(JSON.parse(init.body)); return Response.json({ ok: true }); }
    if (url.startsWith("https://api.zeptomail.com/")) { emails.push(JSON.parse(init.body)); return Response.json({ ok: true }); }
    if (url.startsWith("https://db.example/")) { supabase.push({ url, body: JSON.parse(init.body || "null") }); return new Response(null, { status: 201 }); }
    throw new Error("unexpected fetch " + url);
  };
  return { telegram, emails, supabase };
}
const TOKEN = "runner-secret-token";
const envWith = (kv) => ({ DEEP_SCAN: kv, DEEP_SCAN_RUNNER_TOKEN: TOKEN, TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1", ZEPTO_TOKEN: "z" });
async function call(path, { method = "GET", body, ip, auth, env }) {
  const headers = { "Content-Type": "application/json", ...(ip ? { "CF-Connecting-IP": ip } : {}), ...(auth ? { Authorization: auth } : {}) };
  const pending = [];
  const res = await worker.fetch(new Request("https://cdn.gdrock.com" + path, { method, headers, body: body ? JSON.stringify(body) : undefined }), env, { waitUntil: (p) => pending.push(p) });
  await Promise.all(pending);
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}
const request = (env, body, ip = "198.51.100.40") => call("/api/deep-scan", { method: "POST", body, ip, env });

// What verify_deep_runner.js posts back, from a real rig summary (shortened).
const RIG_RESULT = (id) => ({
  id, ok: true, domain: "shop.example", verdict: "VERIFIED", score: 55, runs: 2,
  safeClaim: "Meta Pixel and Pinterest Tag sent data before any consent in both runs.",
  deductions: [{ points: 30, short: "Tracking before consent", detail: "Meta Pixel, Pinterest Tag" }, { points: 15, short: "Tracking cookies", detail: "_fbp, _pin_unauth" }],
  network: { country: "DE", source: "Cloudflare trace" }, visitor: { language: "German", timezone: "Europe/Berlin" },
  card: { headline: { line1: "Tracking before consent.", line2: "Two things to fix.", line2Color: "red" },
    rows: [{ ok: true, title: "Cookie banner appears on the first visit", sub: "Cookiebot with “Deny”." }, { ok: false, title: "Trackers wait for consent", sub: "Meta Pixel fired <script>." }],
    timelineLabel: "WHAT SENT DATA BEFORE ANY CLICK", timelineFoot: "9 tracking requests on the first visit alone",
    timeline: [{ at: "+0.41s", name: "Meta Pixel", note: null }, { at: "+1.20s", name: "Pinterest Tag", note: "second page" }] },
  report: "GDRock consent check\nshop.example\nVERIFIED 55/100\n",
  card_png: Buffer.from("fake-png").toString("base64"),
});

test("without the queue bound: the request is kept as a lead, the owner is told to run it by hand, the visitor is told the truth", async () => {
  const c = capture();
  const r = await request({ SUPABASE_URL: "https://db.example", SUPABASE_ANON_KEY: "a", TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1" }, { url: "https://www.shop.example/de", email: "owner@shop.example" }, "198.51.100.41");
  assert.equal(r.status, 200);
  assert.equal(r.body.queued, false);
  assert.match(r.body.message, /by hand/);
  assert.equal(c.supabase[0].body.source, "deep_scan");
  assert.equal(c.supabase[0].body.website_url, "shop.example");
  assert.match(c.telegram[0].text, /run it by hand[\s\S]*shop\.example[\s\S]*verify_consent\.js https:\/\/shop\.example --geo=de/);
});

test("a bad email or address is refused", async () => {
  capture();
  const env = envWith(fakeKV());
  assert.equal((await request(env, { url: "shop.example", email: "nope" }, "198.51.100.42")).status, 400);
  assert.equal((await request(env, { url: "not a site", email: "a@b.example" }, "198.51.100.43")).status, 400);
});

test("queue -> runner -> result -> email, end to end", async () => {
  const c = capture();
  const kv = fakeKV(), env = envWith(kv);
  // The runner has checked in (an empty poll), so the visitor is promised the fast path.
  assert.equal((await call("/api/deep-scan/next", { env, auth: "Bearer " + TOKEN })).status, 204);
  const q = await request(env, { url: "shop.example", email: "owner@shop.example", optin: true }, "198.51.100.44");
  assert.equal(q.status, 200);
  assert.equal(q.body.queued, true);
  assert.equal(q.body.position, 1);
  assert.match(q.body.message, /server in Germany/);
  assert.match(c.telegram[0].text, /deep check queued[\s\S]*shop\.example/);

  // The same person asking again for the same site gets the job already queued.
  const again = await request(env, { url: "https://shop.example/", email: "Owner@Shop.example" }, "198.51.100.45");
  assert.equal(again.body.duplicate, true);
  assert.equal(again.body.id, q.body.id);

  // The runner needs its token.
  assert.equal((await call("/api/deep-scan/next", { env })).status, 401);
  assert.equal((await call("/api/deep-scan/next", { env, auth: "Bearer wrong" })).status, 401);
  const job = await call("/api/deep-scan/next", { env, auth: "Bearer " + TOKEN });
  assert.deepEqual(job.body, { id: q.body.id, url: "https://shop.example", domain: "shop.example" });
  assert.equal((await call("/api/deep-scan/next", { env, auth: "Bearer " + TOKEN })).status, 204); // nothing else waiting
  const running = await call("/api/deep-scan/status?id=" + q.body.id, { env });
  assert.equal(running.body.status, "running");
  assert.equal(JSON.stringify(running.body).includes("owner@shop.example"), false); // status never shows the email

  assert.equal((await call("/api/deep-scan/result", { method: "POST", env, body: RIG_RESULT(q.body.id) })).status, 401);
  const done = await call("/api/deep-scan/result", { method: "POST", env, auth: "Bearer " + TOKEN, body: RIG_RESULT(q.body.id) });
  assert.equal(done.body.status, "done");
  const mail = c.emails.find((e) => e.to[0].email_address.address === "owner@shop.example");
  assert.equal(mail.subject, "Your GDRock deep check for shop.example: 55/100");
  assert.match(mail.htmlbody, /Chrome on a server in Germany \(the connection was seen as DE\)/);
  assert.match(mail.htmlbody, /the cookie banner never clicked/);
  assert.match(mail.htmlbody, /Tracking before consent/);
  assert.match(mail.htmlbody, /Meta Pixel fired &lt;script&gt;/); // escaped
  assert.match(mail.htmlbody, /WHAT SENT DATA BEFORE ANY CLICK/);
  assert.match(mail.htmlbody, /\+0\.41s ?<\/td><td[^>]*>Meta Pixel/);
  assert.match(mail.htmlbody, /Pinterest Tag<span[^>]*> · second page/);
  assert.match(mail.htmlbody, /9 tracking requests on the first visit alone/);
  assert.deepEqual(mail.attachments.map((a) => a.name), ["shop.example_GDRock-deep-check.png", "shop.example_report.txt"]);
  assert.equal(Buffer.from(mail.attachments[1].content, "base64").toString("utf8"), RIG_RESULT(q.body.id).report);
  assert.match(c.telegram.at(-1).text, /deep check finished[\s\S]*55\/100/);
  const status = await call("/api/deep-scan/status?id=" + q.body.id, { env });
  assert.deepEqual([status.body.status, status.body.score], ["done", 55]);
  // Everything expires: requesters' emails are not kept beyond 14 days.
  assert.ok([...kv.ttl.values()].every((t) => typeof t === "number" && t <= 14 * 86400));
});

test("an inconclusive run claims nothing: no score, the reason, an offer to look by hand", async () => {
  const c = capture();
  const env = envWith(fakeKV());
  const q = await request(env, { url: "blocked.example", email: "a@blocked.example" }, "198.51.100.46");
  await call("/api/deep-scan/next", { env, auth: "Bearer " + TOKEN });
  await call("/api/deep-scan/result", { method: "POST", env, auth: "Bearer " + TOKEN,
    body: { id: q.body.id, ok: true, verdict: "INCONCLUSIVE", score: null, problem: "The site showed a bot check (Cloudflare) to the browser." } });
  const mail = c.emails.find((e) => e.to[0].email_address.address === "a@blocked.example");
  assert.equal(mail.subject, "Your GDRock deep check for blocked.example: not conclusive");
  assert.doesNotMatch(mail.htmlbody, /\/100/);
  assert.match(mail.htmlbody, /nothing is claimed about your site/);
  assert.match(mail.htmlbody, /bot check \(Cloudflare\)/);
});

test("limits: 3 deep checks per email per day, 3 per connection per hour", async () => {
  capture();
  const env = envWith(fakeKV());
  for (let i = 0; i < 3; i++) assert.equal((await request(env, { url: `site${i}.example`, email: "busy@shop.example" }, "198.51.100." + (50 + i))).status, 200);
  const fourth = await request(env, { url: "site9.example", email: "busy@shop.example" }, "198.51.100.60");
  assert.equal(fourth.status, 429);
  for (let i = 0; i < 3; i++) await request(env, { url: `ip${i}.example`, email: `p${i}@shop.example` }, "198.51.100.70");
  assert.equal((await request(env, { url: "ip9.example", email: "p9@shop.example" }, "198.51.100.70")).status, 429);
});

// --- Runner presence and cheap polling --------------------------------------

test("with no runner checking in, the visitor is told it runs by hand within a working day, and the owner is told to start it", async () => {
  const c = capture();
  const env = envWith(fakeKV());
  const q = await request(env, { url: "shop.example", email: "owner@shop.example" }, "198.51.100.80");
  assert.equal(q.body.queued, true);
  assert.equal(q.body.runner_online, false);
  assert.match(q.body.message, /offline right now[\s\S]*within one working day/);
  assert.doesNotMatch(q.body.message, /15 minutes/);
  assert.match(c.telegram[0].text, /RUNNER OFFLINE[\s\S]*verify_consent\.js https:\/\/shop\.example --geo=de/);
  // The job still waits in the queue for the runner.
  const job = await call("/api/deep-scan/next", { env, auth: "Bearer " + TOKEN });
  assert.equal(job.body.id, q.body.id);
});

test("an idle poll reads one flag and never lists the queue; a full sweep does", async () => {
  capture();
  const kv = fakeKV(), env = envWith(kv);
  let lists = 0;
  const realList = kv.list;
  kv.list = async (o) => { lists++; return realList(o); };
  for (let i = 0; i < 5; i++) assert.equal((await call("/api/deep-scan/next", { env, auth: "Bearer " + TOKEN })).status, 204);
  assert.equal(lists, 0);
  assert.equal((await call("/api/deep-scan/next?full=1", { env, auth: "Bearer " + TOKEN })).status, 204);
  assert.equal(lists, 1);
});

test("the runner heartbeat is written at most every five minutes, with an expiry", async () => {
  capture();
  const kv = fakeKV(), env = envWith(kv);
  let beats = 0;
  const realPut = kv.put;
  kv.put = async (k, v, o) => { if (k === "runner:seen") beats++; return realPut(k, v, o); };
  for (let i = 0; i < 4; i++) await call("/api/deep-scan/next", { env, auth: "Bearer " + TOKEN });
  assert.equal(beats, 1);
  assert.equal(kv.ttl.get("runner:seen"), 15 * 60);
});

test("a job queued without its flag (lost in a race) still runs on the next full sweep", async () => {
  capture();
  const kv = fakeKV(), env = envWith(kv);
  const q = await request(env, { url: "late.example", email: "a@late.example" }, "198.51.100.81");
  await kv.delete("q:any");
  assert.equal((await call("/api/deep-scan/next", { env, auth: "Bearer " + TOKEN })).status, 204);
  const job = await call("/api/deep-scan/next?full=1", { env, auth: "Bearer " + TOKEN });
  assert.equal(job.body.id, q.body.id);
});

test("the flag is cleared once the queue is empty and the flag is over two minutes old, not before", async () => {
  capture();
  const kv = fakeKV(), env = envWith(kv);
  await kv.put("q:any", String(Date.now()));
  await call("/api/deep-scan/next", { env, auth: "Bearer " + TOKEN });
  assert.notEqual(await kv.get("q:any"), null); // fresh: a new key may not have reached this location yet
  await kv.put("q:any", String(Date.now() - 3 * 60 * 1000));
  await call("/api/deep-scan/next", { env, auth: "Bearer " + TOKEN });
  assert.equal(await kv.get("q:any"), null);
});

test("the ad or link a visitor came from rides along to the owner's alert, cleaned", async () => {
  const kv = fakeKV(), c = capture(), env = envWith(kv);
  const res = await call("/api/deep-scan", { method: "POST", body: { url: "shop.example", email: "a@shop.example", src: "meta/gdr-a/card<script>" }, ip: "5.5.5.5", env });
  assert.equal(res.status, 200);
  assert.match(c.telegram[0].text, /Came from: meta\/gdr-a\/cardscript/);
});

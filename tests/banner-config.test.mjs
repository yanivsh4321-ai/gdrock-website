// Banner config: what /customize saves is what the live banner gets, validated, and a banner save never wipes the
// hosted privacy policy stored in the same config. Also: /gdrock.js is the blocker first, the banner second.
// Run from the repo root: node --test tests/
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import worker from "../gdrock-worker.js";

const ENV = { SUPABASE_URL: "https://db.example", SUPABASE_ANON_KEY: "anon" };
const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

// A fake Supabase holding one site row; PATCH bodies are recorded.
function fakeDb(row) {
  const patches = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.startsWith(ENV.SUPABASE_URL + "/rest/v1/sites")) {
      if ((init.method || "GET") === "PATCH") { patches.push(JSON.parse(init.body)); return new Response(null, { status: 204 }); }
      return Response.json(row ? [row] : []);
    }
    throw new Error("unexpected fetch " + url);
  };
  return patches;
}
const call = (path, init) => worker.fetch(new Request("https://cdn.gdrock.com" + path, init), ENV, { waitUntil() {} });

test("GET /api/banner-config returns every look setting the editor saves, and never the access code", async () => {
  fakeDb({ site_id: "shop.example", plan: "care", access_code: "GDR-AAAA-BBBB", allowed_domains: null,
    config: { accent: "#123456", bg: "#ffffff", fg: "#111111", border: "#dddddd", btntext: "#ffffff", radius: 12, btnRadius: 6,
      titleSize: 18, bodySize: 14, logoSize: 30, maxWidth: 600, padding: 20, gap: 12, position: "left", blur: false, showBorder: true,
      animate: false, theme: "light", accessCode: "GDR-AAAA-BBBB", policy: { company_name: "Shop" } } });
  const cfg = await (await call("/api/banner-config/shop.example")).json();
  for (const [k, v] of Object.entries({ accentBtn: "#123456", bg: "#ffffff", fg: "#111111", border: "#dddddd", btntext: "#ffffff", radius: 12, btnRadius: 6,
    titleSize: 18, bodySize: 14, logoSize: 30, maxWidth: 600, padding: 20, gap: 12, position: "left", blur: false, showBorder: true, animate: false, theme: "light" })) {
    assert.deepEqual(cfg[k], v, k);
  }
  assert.equal(JSON.stringify(cfg).includes("GDR-AAAA-BBBB"), false);
  assert.equal("policy" in cfg, false);
});

test("bad values from the editor are dropped or clamped, never passed to the banner", async () => {
  fakeDb({ site_id: "shop.example", access_code: "C", config: { accent: "red; background:url(x)", bg: "#12", radius: 999, titleSize: -4,
    position: "top", theme: "neon", blur: "yes", customLogoB64: "javascript:alert(1)", policyUrl: "javascript:alert(1)" } });
  const cfg = await (await call("/api/banner-config/shop.example")).json();
  assert.equal(cfg.accentBtn, "#2563eb"); // invalid colour -> default
  assert.equal("bg" in cfg, false);
  assert.equal(cfg.radius, 32);
  assert.equal(cfg.titleSize, 13);
  assert.equal("position" in cfg, false);
  assert.equal(cfg.theme, "auto");
  assert.equal("blur" in cfg, false);
  assert.equal("customLogoB64" in cfg, false);
  assert.equal("policyUrl" in cfg, false);
});

test("saving the banner look keeps the hosted privacy policy in the same config", async () => {
  const patches = fakeDb({ access_code: "GDR-AAAA-BBBB", config: { accent: "#000000", policy: { company_name: "Shop", contact_email: "a@b.example" } } });
  const r = await call("/api/banner-config/save", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ site_id: "shop.example", accessCode: "gdr-aaaa-bbbb", accent: "#2563eb", position: "right", btnRadius: 8, bogus: "x" }) });
  assert.equal((await r.json()).ok, true);
  const saved = patches[0].config;
  assert.deepEqual(saved.policy, { company_name: "Shop", contact_email: "a@b.example" });
  assert.equal(saved.accent, "#2563eb");
  assert.equal(saved.position, "right");
  assert.equal(saved.btnRadius, 8);
  assert.equal("bogus" in saved, false);
});

test("a wrong access code saves nothing", async () => {
  const patches = fakeDb({ access_code: "GDR-AAAA-BBBB", config: {} });
  const r = await call("/api/banner-config/save", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ site_id: "shop.example", accessCode: "GDR-WRONG", accent: "#000000" }) });
  assert.equal(r.status, 403);
  assert.equal(patches.length, 0);
});

test("/gdrock.js is the blocker first and the banner second, both ES5 builds", async () => {
  const t = await (await call("/gdrock.js")).text();
  const [blocker, banner] = t.split("\n;\n");
  assert.match(blocker, /^\/\*! GDRock Consent Blocker v2\.1\.0/);
  assert.match(banner, /^\/\*! GDRock Cookie Banner v2\.0\.0/);
  assert.match(banner, /data-api/);
  assert.doesNotMatch(t, /[^\x00-\x7f]/); // ASCII only: translations travel as \u escapes
});

test("the access-code email tells buyers to put the tag first in <head>, without async", async () => {
  const sent = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.startsWith("https://api.zeptomail.com/")) { sent.push(JSON.parse(init.body)); return Response.json({ ok: true }); }
    if (url.includes("/rest/v1/sites")) return (init.method || "GET") === "GET" ? Response.json([]) : new Response(null, { status: 201 });
    return Response.json({ ok: true });
  };
  // Drive it through a signed Whop webhook, the only path that sends it.
  const secret = "whsec_dGVzdHNlY3JldA==";
  const body = JSON.stringify({ type: "payment.succeeded", data: { user: { email: "buyer@shopmail.co" }, metadata: { website_url: "shop.example", gdrock_plan: "care" } } });
  const id = "msg_1", ts = String(Math.floor(Date.now() / 1000));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = Buffer.from(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${body}`))).toString("base64");
  await worker.fetch(new Request("https://cdn.gdrock.com/api/whop-webhook", { method: "POST", body,
    headers: { "webhook-id": id, "webhook-timestamp": ts, "webhook-signature": "v1," + sig } }),
    { ...ENV, WHOP_WEBHOOK_SECRET: secret, ZEPTO_TOKEN: "z" }, { waitUntil() {} });
  const mail = sent.find((m) => m.to[0].email_address.address === "buyer@shopmail.co");
  assert.ok(mail);
  assert.match(mail.htmlbody, /first thing inside &lt;head&gt;/);
  assert.doesNotMatch(mail.htmlbody, /script async/);
});

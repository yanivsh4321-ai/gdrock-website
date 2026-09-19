// Whop webhook: signed events switch a site's banner on and off; unsigned ones are refused;
// a revoke that can't be matched to a website alerts the owner instead of passing silently.
// Run from the repo root: node --test tests/whop-webhook.test.mjs
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import worker from "../gdrock-worker.js";

const SECRET = "ws_testsecret";
const ENV = { WHOP_WEBHOOK_SECRET: SECRET, SUPABASE_URL: "https://sb.example", SUPABASE_ANON_KEY: "anon", TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1" };
const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

// Signed the way Whop documents it: HMAC-SHA256 over "id.timestamp.body", keyed with the secret as issued.
function signed(body, { secret = SECRET } = {}) {
  const raw = JSON.stringify(body), id = "msg_1", ts = String(Math.floor(Date.now() / 1000));
  const sig = createHmac("sha256", secret).update(`${id}.${ts}.${raw}`).digest("base64");
  return new Request("https://cdn.gdrock.com/api/whop-webhook", {
    method: "POST", body: raw,
    headers: { "Content-Type": "application/json", "webhook-id": id, "webhook-timestamp": ts, "webhook-signature": `v1,${sig}` },
  });
}

function record() {
  const calls = { patches: [], telegram: [] };
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.startsWith("https://sb.example/rest/v1/sites") && init.method === "PATCH") calls.patches.push({ url, body: JSON.parse(init.body) });
    if (url.startsWith("https://api.telegram.org/")) calls.telegram.push(JSON.parse(init.body));
    return Response.json([]);
  };
  return calls;
}

for (const event of ["membership.deactivated", "refund.created", "membership.went_invalid"]) {
  test(`${event} switches the site's banner off`, async () => {
    const calls = record();
    const res = await worker.fetch(signed({ type: event, data: { metadata: { website_url: "https://www.shop.example/", email: "a@shop.example" } } }), ENV, { waitUntil() {} });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).revoked, "shop.example");
    assert.equal(calls.patches.length, 1);
    assert.deepEqual(calls.patches[0].body, { active: false });
  });
}

test("a revoke with no website alerts the owner on Telegram", async () => {
  const calls = record();
  const res = await worker.fetch(signed({ type: "membership.deactivated", data: { user: { email: "b@shop.example" } } }), ENV, { waitUntil() {} });
  assert.equal(res.status, 200);
  assert.equal(calls.patches.length, 0);
  assert.equal(calls.telegram.length, 1);
  assert.match(calls.telegram[0].text, /membership\.deactivated could not be matched.*\n.*b@shop\.example/);
});

test("a webhook signed with the wrong secret is refused", async () => {
  const calls = record();
  const res = await worker.fetch(signed({ type: "membership.deactivated", data: { metadata: { website_url: "shop.example" } } }, { secret: "ws_wrong" }), ENV, { waitUntil() {} });
  assert.equal(res.status, 401);
  assert.equal(calls.patches.length, 0);
});

test("with no WHOP_WEBHOOK_SECRET set, every webhook is refused (fails closed)", async () => {
  record();
  const env = { ...ENV, WHOP_WEBHOOK_SECRET: undefined };
  const res = await worker.fetch(signed({ type: "payment.succeeded", data: {} }), env, { waitUntil() {} });
  assert.equal(res.status, 401);
});

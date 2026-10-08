// GDRock funnel counter: POST /api/hit stores one anonymous key per step,
// GET /api/hit/count sums them per source for the owner.
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../gdrock-worker.js";

function fakeKV() {
  const m = new Map();
  return {
    m,
    async get(k) { return m.has(k) ? m.get(k) : null; },
    async put(k, v, o = {}) { m.set(k, { v: String(v), ttl: o.expirationTtl }); },
    async delete(k) { m.delete(k); },
    async list({ prefix = "", limit = 1000 } = {}) { return { keys: [...m.keys()].filter((k) => k.startsWith(prefix)).sort().slice(0, limit).map((name) => ({ name })), list_complete: true }; },
  };
}
const TOKEN = "runner-secret-token";
async function call(env, path, { method = "GET", body, auth, contentType = "text/plain" } = {}) {
  const pending = [];
  const headers = { "Content-Type": contentType, ...(auth ? { Authorization: auth } : {}) };
  const res = await worker.fetch(new Request("https://cdn.gdrock.com" + path, { method, headers, body }), env, { waitUntil: (p) => pending.push(p) });
  await Promise.all(pending);
  return { status: res.status, body: await res.json().catch(() => null) };
}
const day = new Date().toISOString().slice(0, 10);

test("a beacon becomes one anonymous key that expires, and bad events are refused", async () => {
  const kv = fakeKV(); const env = { DEEP_SCAN: kv, DEEP_SCAN_RUNNER_TOKEN: TOKEN };
  const r = await call(env, "/api/hit", { method: "POST", body: JSON.stringify({ e: "load", src: "meta/gdr-a/a1" }) });
  assert.equal(r.status, 200);
  const keys = [...kv.m.keys()];
  assert.equal(keys.length, 1);
  assert.match(keys[0], new RegExp(`^hit:${day}:load:meta/gdr-a/a1:[0-9a-f-]{36}$`));
  assert.equal(kv.m.get(keys[0]).ttl, 60 * 86400);
  assert.equal(kv.m.get(keys[0]).v, "1");
  assert.equal((await call(env, "/api/hit", { method: "POST", body: JSON.stringify({ e: "click", src: "meta" }) })).status, 400);
  for (const e of ["stay", "scroll", "scan", "focus", "submit"]) assert.equal((await call(env, "/api/hit", { method: "POST", body: JSON.stringify({ e, src: "meta" }) })).status, 200);
  assert.equal((await call(env, "/api/hit", { method: "POST", body: "not json" })).status, 400);
  assert.equal(kv.m.size, 6);
});

test("the source is sanitised and defaults to direct", async () => {
  const kv = fakeKV(); const env = { DEEP_SCAN: kv, DEEP_SCAN_RUNNER_TOKEN: TOKEN };
  await call(env, "/api/hit", { method: "POST", body: JSON.stringify({ e: "focus", src: "<img onerror=x>meta:evil" }) });
  await call(env, "/api/hit", { method: "POST", body: JSON.stringify({ e: "focus" }) });
  const keys = [...kv.m.keys()].sort();
  assert.ok(keys.some((k) => k.startsWith(`hit:${day}:focus:direct:`)));
  assert.ok(keys.some((k) => k.startsWith(`hit:${day}:focus:imgonerrorxmetaevil:`)));
});

test("the count needs the runner token and sums per source and step", async () => {
  const kv = fakeKV(); const env = { DEEP_SCAN: kv, DEEP_SCAN_RUNNER_TOKEN: TOKEN };
  for (const [e, src] of [["load", "meta/gdr-a/a1"], ["load", "meta/gdr-a/a1"], ["scan", "meta/gdr-a/a1"], ["load", "check-de"], ["submit", "check-de"]]) {
    await call(env, "/api/hit", { method: "POST", body: JSON.stringify({ e, src }) });
  }
  assert.equal((await call(env, `/api/hit/count?day=${day}`)).status, 401);
  const r = await call(env, `/api/hit/count?day=${day}`, { auth: `Bearer ${TOKEN}` });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { day, counts: { "meta/gdr-a/a1": { load: 2, scan: 1 }, "check-de": { load: 1, submit: 1 } } });
  assert.deepEqual((await call(env, "/api/hit/count?day=2020-01-01", { auth: `Bearer ${TOKEN}` })).body, { day: "2020-01-01", counts: {} });
});

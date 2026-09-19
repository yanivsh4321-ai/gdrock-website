// The public scanner's second reads (the site's own stylesheets, the privacy policy page), the 10-minute cache,
// the per-IP rate limit and the owner-alert flood cap. Same honesty rules as scanner-gtm.test.mjs: every finding
// carries evidence, a miss is never scored, and nothing claims what a source read can't see.
// Run from the repo root: node --test tests/
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import worker from "../gdrock-worker.js";

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; delete globalThis.caches; });

const HOME = (head = "", body = "") => `<!doctype html><html><head><title>Shop</title>${head}</head><body>
<h1>Vapor Shop</h1><p>E-liquids and devices shipped across Germany. Free delivery from 40 euro, returns within 14 days.</p>
<a href="/datenschutz">Datenschutzerklärung</a> <a href="/impressum">Impressum</a>${body}</body></html>`;

// A German policy that covers all six points, and one that covers only some.
const FULL_POLICY = `<html><body><h1>Datenschutzerklärung</h1>
<h2>Verantwortlicher</h2><p>Verantwortlich im Sinne der DSGVO ist die Vapor Shop GmbH, Musterstraße 1, 40721 Hilden. E-Mail: datenschutz@vapor-shop.example</p>
<h2>Rechtsgrundlagen</h2><p>Wir verarbeiten Ihre Daten auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertrag) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).</p>
<h2>Empfänger</h2><p>Wir setzen Auftragsverarbeiter ein, etwa unseren Hosting-Dienstleister und den Versanddienstleister.</p>
<h2>Speicherdauer</h2><p>Bestelldaten werden gemäß den gesetzlichen Aufbewahrungsfristen zehn Jahre aufbewahrt und danach gelöscht.</p>
<h2>Ihre Rechte</h2><p>Sie haben ein Recht auf Auskunft, ein Recht auf Berichtigung, ein Recht auf Löschung und ein Widerspruchsrecht.</p>
<h2>Beschwerde</h2><p>Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren.</p>
${"<p>Weitere Hinweise zum Umgang mit Ihren Daten in unserem Shop.</p>".repeat(8)}</body></html>`;
const PARTIAL_POLICY = `<html><body><h1>Privacy policy</h1><p>We are Vapor Shop GmbH. Contact us at hello@vapor-shop.example. We are the controller of your data.</p>
<p>We use service providers to ship your orders and host this shop. ${"We care about your privacy and handle your information carefully. ".repeat(12)}</p></body></html>`;

// Serves `routes` by path (exact first, then prefix), records every URL fetched, and captures alerts.
function stub(routes) {
  const fetched = [], telegram = [], emails = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    fetched.push(url);
    if (url.startsWith("https://api.telegram.org/")) { telegram.push(JSON.parse(init.body)); return Response.json({ ok: true }); }
    if (url.startsWith("https://api.zeptomail.com/")) { emails.push(JSON.parse(init.body)); return Response.json({ ok: true }); }
    const u = new URL(url);
    const r = routes[u.pathname] ?? routes[u.origin + u.pathname];
    if (r === undefined) return new Response("not found", { status: 404 });
    if (typeof r === "number") return new Response("", { status: r });
    return new Response(r.body ?? r, { status: 200, headers: { "Content-Type": r.type || (u.pathname.endsWith(".css") ? "text/css" : "text/html") } });
  };
  return { fetched, telegram, emails };
}
async function scan(url, { ip, email, env = {} } = {}) {
  const req = new Request("https://cdn.gdrock.com/api/scan", { method: "POST", headers: { "Content-Type": "application/json", ...(ip ? { "CF-Connecting-IP": ip } : {}) },
    body: JSON.stringify({ url, ...(email ? { email } : {}) }) });
  const pending = [];
  const res = await worker.fetch(req, env, { waitUntil: (p) => pending.push(p) });
  await Promise.all(pending);
  return { status: res.status, body: await res.json() };
}
const fontIssue = (r) => r.issues.find((i) => /Google Fonts|Adobe Fonts/.test(i.text));

// --- Stylesheets ---------------------------------------------------------------

test("Google Fonts pulled in by @import from the site's own stylesheet: -10, with the stylesheet and the @import as evidence", async () => {
  const s = stub({ "/": HOME('<link rel="stylesheet" href="/theme/a1b2/css/all.css">'), "/theme/a1b2/css/all.css": { body: '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;700");\nbody{font-family:Inter}', type: "text/css" }, "/datenschutz": FULL_POLICY });
  const { body } = await scan("https://vapor-shop.example");
  assert.equal(body.score, 90);
  const f = fontIssue(body);
  assert.match(f.text, /imported by the site's own stylesheet/);
  assert.match(f.evidence, /https:\/\/vapor-shop\.example\/theme\/a1b2\/css\/all\.css: @import url\("https:\/\/fonts\.googleapis\.com\/css2\?family=Inter/);
  assert.equal(f.confidence, "observed");
  assert.deepEqual(body.stylesheets_read, ["https://vapor-shop.example/theme/a1b2/css/all.css"]);
  assert.ok(body.limits[0].includes("one of the site's own stylesheets"));
  assert.ok(s.fetched.includes("https://vapor-shop.example/theme/a1b2/css/all.css"));
});

test("fonts.gstatic.com in an @font-face url() of a stylesheet counts too", async () => {
  stub({ "/": HOME('<link rel=stylesheet href="/main.css">'), "/main.css": { body: "@font-face{font-family:X;src:url(https://fonts.gstatic.com/s/x/v1/x.woff2) format('woff2')}", type: "text/css" }, "/datenschutz": FULL_POLICY });
  const { body } = await scan("https://gstatic-shop.example");
  assert.equal(body.score, 90);
  assert.match(fontIssue(body).evidence, /fonts\.gstatic\.com/);
});

test("Adobe Fonts imported by an inline <style> block is found without any extra request", async () => {
  const s = stub({ "/": HOME('<style>@import url("https://use.typekit.net/abc1234.css");</style>'), "/datenschutz": FULL_POLICY });
  const { body } = await scan("https://typekit-shop.example");
  assert.match(fontIssue(body).text, /Adobe Fonts/);
  assert.match(fontIssue(body).evidence, /^inline <style> in the homepage: @import url\("https:\/\/use\.typekit\.net\/abc1234\.css"\)/);
  assert.equal(s.fetched.filter((u) => u.endsWith(".css")).length, 0);
});

test("a font linked in the HTML and imported by CSS is one finding, one deduction", async () => {
  stub({ "/": HOME('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter"><link rel="stylesheet" href="/s.css">'), "/s.css": { body: '@import "https://fonts.googleapis.com/css2?family=Lora";', type: "text/css" }, "/datenschutz": FULL_POLICY });
  const { body } = await scan("https://both-shop.example");
  assert.equal(body.score, 90);
  assert.equal(body.deductions.filter((d) => d.rule === "third_party_fonts").length, 1);
});

test("stylesheets on other sites are not read, and at most three of the site's own are", async () => {
  const links = ['<link rel="stylesheet" href="https://cdn.other-vendor.example/widget.css">']
    .concat([1, 2, 3, 4, 5].map((n) => `<link rel="stylesheet" href="/s${n}.css">`)).join("");
  const routes = { "/": HOME(links), "/datenschutz": FULL_POLICY };
  for (const n of [1, 2, 3, 4, 5]) routes["/s" + n + ".css"] = { body: "body{margin:0}", type: "text/css" };
  const s = stub(routes);
  const { body } = await scan("https://many-sheets.example");
  assert.equal(s.fetched.filter((u) => /\/s\d\.css$/.test(u)).length, 3);
  assert.equal(s.fetched.some((u) => u.includes("other-vendor")), false);
  assert.equal(body.stylesheets_read.length, 3);
  assert.equal(body.score, 100);
});

test("a stylesheet that won't load is not a finding", async () => {
  stub({ "/": HOME('<link rel="stylesheet" href="/broken.css">'), "/broken.css": 500, "/datenschutz": FULL_POLICY });
  const { body } = await scan("https://broken-css.example");
  assert.equal(body.score, 100);
  assert.equal(fontIssue(body), undefined);
  assert.deepEqual(body.stylesheets_read, []);
});

// --- Privacy policy --------------------------------------------------------------

test("a policy that covers all six points is credited, with evidence, in German", async () => {
  stub({ "/": HOME(), "/datenschutz": FULL_POLICY });
  const { body } = await scan("https://full-policy.example");
  assert.equal(body.privacy_policy.status, "read");
  assert.equal(body.privacy_policy.url, "https://full-policy.example/datenschutz");
  assert.ok(body.privacy_policy.checks.every((c) => c.found), JSON.stringify(body.privacy_policy.checks.filter((c) => !c.found)));
  const good = body.issues.find((i) => /^The privacy policy we read covers/.test(i.text));
  assert.ok(good && good.severity === "good" && good.evidence.startsWith("https://full-policy.example/datenschutz"));
  assert.equal(body.issues.some((i) => /Not found in the policy text we read/.test(i.text)), false);
  assert.ok(body.limits[0].includes("the privacy policy page it links to"));
});

test("what the policy doesn't mention is said as 'not found in the policy text we read', and never scored", async () => {
  stub({ "/": HOME().replace("/datenschutz", "/privacy"), "/privacy": PARTIAL_POLICY });
  const { body } = await scan("https://partial-policy.example");
  const miss = body.issues.find((i) => /^Not found in the policy text we read: /.test(i.text));
  assert.ok(miss);
  assert.equal(miss.severity, "warning");
  assert.equal(miss.confidence, "inferred");
  assert.match(miss.text, /legal basis/);
  assert.match(miss.text, /how long data is kept/);
  assert.match(miss.text, /supervisory authority/);
  assert.match(miss.text, /check those parts of the policy by hand/);
  assert.doesNotMatch(miss.text, /\bno (retention|legal basis)\b|does not (say|mention|have)/i); // absence is never a claim about the site
  assert.equal(body.score, 100); // no deduction
  const found = body.privacy_policy.checks.filter((c) => c.found).map((c) => c.key).sort();
  assert.deepEqual(found, ["controller", "processors"]);
});

test("rights listed as verbs in one sentence still count (gdrock.com's own policy wording)", async () => {
  const policy = `<html><body><h2>7. Your GDPR Rights</h2><p>Under the GDPR, you have the right to access, rectify, erase, restrict, or port your personal data, and to object to processing. To exercise any of these rights, contact us.</p>${"<p>More about how we handle data.</p>".repeat(20)}</body></html>`;
  stub({ "/": HOME().replace("/datenschutz", "/privacy"), "/privacy": policy });
  const { body } = await scan("https://verb-rights.example");
  assert.equal(body.privacy_policy.checks.find((c) => c.key === "rights").found, true);
});

test("the word 'access' alone is not a rights section", async () => {
  const policy = `<html><body><p>By accessing this site you agree to our terms. We restrict access to staff.</p>${"<p>More about how we handle data.</p>".repeat(20)}</body></html>`;
  stub({ "/": HOME().replace("/datenschutz", "/privacy"), "/privacy": policy });
  const { body } = await scan("https://no-rights.example");
  assert.equal(body.privacy_policy.checks.find((c) => c.key === "rights").found, false);
});

test("a policy page built by JavaScript: said it couldn't be checked, no claims about its contents", async () => {
  stub({ "/": HOME(), "/datenschutz": '<html><body><div id="app"></div><script src="/policy.js"></script></body></html>' });
  const { body } = await scan("https://js-policy.example");
  const w = body.issues.find((i) => /privacy policy link was found/.test(i.text));
  assert.match(w.text, /too little text to check \(it may be built by JavaScript\)/);
  assert.equal(body.privacy_policy.status, "too_little_text");
  assert.equal(body.score, 100);
});

test("a cookie notice is not taken for the privacy policy", async () => {
  const s = stub({ "/": HOME().replace('<a href="/datenschutz">Datenschutzerklärung</a>', '<a href="/cookie-policy">Cookie policy</a> <a href="/privacy">Privacy</a>'), "/privacy": FULL_POLICY, "/cookie-policy": "cookies" });
  await scan("https://cookie-link.example");
  assert.ok(s.fetched.includes("https://cookie-link.example/privacy"));
  assert.equal(s.fetched.includes("https://cookie-link.example/cookie-policy"), false);
});

// --- Cache, rate limit, alerts -----------------------------------------------------

function fakeCaches() {
  const store = new Map();
  globalThis.caches = { default: {
    match: async (req) => { const r = store.get(req.url); return r ? r.clone() : undefined; },
    put: async (req, res) => { store.set(req.url, res.clone()); },
  } };
  return store;
}
const ALERT_ENV = { TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1", ZEPTO_TOKEN: "z" };

test("the same domain within 10 minutes comes from the cache: one fetch of the site, one owner alert", async () => {
  fakeCaches();
  const s = stub({ "/": HOME(), "/datenschutz": FULL_POLICY });
  const a = await scan("https://cached.example", { ip: "198.51.100.1", env: ALERT_ENV });
  const b = await scan("https://www.cached.example/", { ip: "198.51.100.2", env: ALERT_ENV });
  assert.equal(a.body.cached, undefined);
  assert.equal(b.body.cached, true);
  assert.equal(b.body.score, a.body.score);
  assert.equal(s.fetched.filter((u) => u === "https://cached.example").length, 1);
  assert.equal(s.telegram.length, 1);
});

test("a cached result still emails the report to a visitor who asks, and that request alerts the owner", async () => {
  fakeCaches();
  const s = stub({ "/": HOME(), "/datenschutz": FULL_POLICY });
  await scan("https://cached-report.example", { ip: "198.51.100.3", env: ALERT_ENV });
  await scan("https://cached-report.example", { ip: "198.51.100.3", email: "owner@shop.example", env: ALERT_ENV });
  assert.equal(s.telegram.length, 2);
  assert.match(s.telegram[1].text, /from the 10-minute cache/);
  assert.ok(s.emails.some((e) => e.to[0].email_address.address === "owner@shop.example"));
});

test("more than 20 real scans in 10 minutes from one IP: 429, no scan, no alert", async () => {
  const routes = { "/": HOME(), "/datenschutz": FULL_POLICY };
  const s = stub(routes);
  for (let i = 0; i < 20; i++) assert.equal((await scan(`https://rl-${i}.example`, { ip: "203.0.113.9" })).status, 200);
  const before = s.fetched.length;
  const r = await scan("https://rl-final.example", { ip: "203.0.113.9", env: ALERT_ENV });
  assert.equal(r.status, 429);
  assert.equal(r.body.error, "rate_limited");
  assert.equal(s.fetched.length, before);
  assert.equal(s.telegram.length, 0);
  assert.equal((await scan("https://rl-other.example", { ip: "203.0.113.10" })).status, 200); // other visitors unaffected
});

test("a bot can't flood Telegram: after 5 alerts from one IP they are held back, and the next one says how many", async () => {
  const s = stub({ "/": HOME(), "/datenschutz": FULL_POLICY });
  for (let i = 0; i < 8; i++) await scan(`https://flood-${i}.example`, { ip: "192.0.2.77", env: ALERT_ENV });
  assert.equal(s.telegram.length, 5);
  await scan("https://after-flood.example", { ip: "192.0.2.78", env: ALERT_ENV });
  assert.equal(s.telegram.length, 6);
  assert.match(s.telegram[5].text, /3 alerts held back during a burst/);
});

test("an address that isn't a domain is refused before anything is fetched", async () => {
  const s = stub({});
  const r = await scan("javascript:alert(1)");
  assert.equal(r.status, 400);
  assert.equal(s.fetched.length, 0);
});

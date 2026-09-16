// GDPR scanner: Google Tag Manager container flagging, GA4 / Meta Pixel regression checks, and the AI-report fallback.
// Run from the repo root: node --test tests/scanner-gtm.test.mjs
// Drives the real POST /api/scan handler with fetch stubbed: no network, LLM, Supabase or email calls.
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import worker from "../gdrock-worker.js";

const GTM_NOTICE_RE = /^Google Tag Manager container detected\b/;

// Each form a GTM container takes in real page source. None of these pages contain GA4 or Meta code.
const GTM_INSTALLS = {
  "<script src> from googletagmanager.com": `<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-TEST123"></script>`,
  // Google's standard snippet builds the gtm.js URL in inline JS, so there is no src attribute.
  "Google's standard inline snippet": `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TEST123');</script>`,
  // Head loader injected by other JS; only Google's noscript fallback is in the HTML.
  "noscript iframe only": `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TEST123" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`,
  "first-party / server-side gtm.js loader": `<script async src="https://sst.test-shop.example/gtm.js?id=GTM-TEST123"></script>`,
  "custom loader that still pushes gtm.start": `<script>window.dataLayer=window.dataLayer||[];dataLayer.push({"gtm.start":new Date().getTime(),event:"gtm.js"});loadTags("https://load.sst.test-shop.example/x7k2.js");</script>`,
};

const GA4_INSTALLS = {
  "gtag.js loader + config": `<script async src="https://www.googletagmanager.com/gtag/js?id=G-TEST12345"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-TEST12345');</script>`,
  "gtag.js loader only": `<script async src="https://www.googletagmanager.com/gtag/js?id=G-TEST12345"></script>`,
  "inline gtag config only": `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-TEST12345');</script>`,
};

const META_PIXEL = `<script async src="https://connect.facebook.net/en_US/fbevents.js"></script>
<script>fbq('init','000000000000000');fbq('track','PageView');</script>`;

// Homepage with no consent platform, enough visible text to pass the "readable content" check, and
// privacy/terms links, so tracker findings are the only thing that differs between tests.
const page = (snippet) => `<!doctype html><html><head><title>Test Shop</title></head><body>${snippet}
<h1>Test Shop</h1><p>Handmade ceramics shipped across the EU. Free returns within 30 days on every order.</p>
<a href="/policies/privacy-policy">Privacy policy</a> <a href="/policies/terms-of-service">Terms of service</a>
</body></html>`;

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

// Scans `snippet` through the worker. With env.ANTHROPIC_API_KEY set, the LLM call answers with `llm` (or, when
// `llmStatus` is not 200, returns `llm` as the API error body) and its prompt is captured; otherwise the
// deterministic signalScan fallback builds the report.
async function scan(snippet, { env = {}, llm, llmStatus = 200 } = {}) {
  let prompt = null;
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.startsWith("https://api.anthropic.com/")) {
      prompt = JSON.parse(init.body).messages[0].content;
      if (llmStatus !== 200) return Response.json(llm, { status: llmStatus });
      return Response.json({ content: [{ type: "text", text: JSON.stringify(llm) }] });
    }
    return new Response(page(snippet), { status: 200, headers: { "Content-Type": "text/html" } });
  };
  const res = await worker.fetch(new Request("https://cdn.gdrock.com/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://test-shop.example" }),
  }), env);
  assert.equal(res.status, 200);
  return { report: await res.json(), prompt };
}

// The fallback report lists every detected tracker in its "Trackers detected (...)" finding.
function detectedTrackers(report) {
  for (const { text } of report.issues) {
    const m = /^Trackers detected \((.+?)\) with no recognised consent platform/.exec(text);
    if (m) return m[1].split(", ");
  }
  return [];
}

const gtmNotices = (report) => report.issues.filter((i) => GTM_NOTICE_RE.test(i.text));

for (const [install, snippet] of Object.entries(GTM_INSTALLS)) {
  test(`GTM container is flagged on its own: ${install}`, async () => {
    const { report } = await scan(snippet);
    const trackers = detectedTrackers(report);
    assert.deepEqual(trackers, ["Google Tag Manager"]); // and not mislabelled as GA4
    const notices = gtmNotices(report);
    assert.equal(notices.length, 1);
    assert.equal(notices[0].severity, "warning");
  });
}

test("GA4 and GTM on the same page are both reported, with one GTM caveat", async () => {
  const { report } = await scan(GA4_INSTALLS["gtag.js loader + config"] + GTM_INSTALLS["Google's standard inline snippet"]);
  assert.deepEqual(detectedTrackers(report), ["Google Analytics/GA4", "Google Tag Manager"]);
  assert.equal(gtmNotices(report).length, 1);
});

test("GTM caveat is also added when the LLM writes the report", async () => {
  const llm = { score: 72, is_real_site: true, summary: "stub", issues: [{ severity: "good", text: "Privacy policy link is present." }] };
  const { report, prompt } = await scan(GTM_INSTALLS["<script src> from googletagmanager.com"], { env: { ANTHROPIC_API_KEY: "test-key" }, llm });
  assert.equal(report.score, 72); // the LLM result was used, not the signal fallback
  assert.match(prompt, /Active Cookies\/Trackers Detected: Google Tag Manager$/m);
  assert.equal(report.issues.length, 2);
  assert.match(report.issues[1].text, GTM_NOTICE_RE);
});

test("an AI API error falls back to the rule-based report and logs why, never the key", async (t) => {
  const logged = [];
  t.mock.method(console, "error", (...args) => { logged.push(args.join(" ")); });
  const apiError = { type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } };
  const { report } = await scan(GTM_INSTALLS["<script src> from googletagmanager.com"], { env: { ANTHROPIC_API_KEY: "sk-ant-test-key" }, llm: apiError, llmStatus: 401 });
  assert.match(report.summary, /^Automated signal scan/);
  assert.equal(gtmNotices(report).length, 1); // the GTM caveat survives the fallback
  assert.equal(logged.length, 1);
  assert.match(logged[0], /Anthropic API 401 authentication_error: invalid x-api-key/);
  assert.doesNotMatch(logged[0], /sk-ant-test-key/);
});

// Regression: detection on pages without GTM is unchanged.
for (const [install, snippet] of Object.entries(GA4_INSTALLS)) {
  test(`regression: GA4 is still detected, with no GTM flag: ${install}`, async () => {
    const { report } = await scan(snippet);
    assert.deepEqual(detectedTrackers(report), ["Google Analytics/GA4"]);
    assert.equal(gtmNotices(report).length, 0);
  });
}

test("regression: Meta Pixel is still detected, with no GTM flag", async () => {
  const { report } = await scan(META_PIXEL);
  assert.deepEqual(detectedTrackers(report), ["Meta Pixel"]);
  assert.equal(gtmNotices(report).length, 0);
});

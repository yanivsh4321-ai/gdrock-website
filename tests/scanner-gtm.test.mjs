// GDPR scanner: what a source scan may and may not claim, the deterministic score, consent-tool detection by
// loader signature, the AI's prose-only role, and the owner alert that fires for every scan.
// Run from the repo root: node --test tests/
// Drives the real POST /api/scan handler with fetch stubbed: no network, LLM, Supabase, Telegram or email calls.
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

const COOKIEBOT_LOADER = `<script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="00000000-0000-0000-0000-000000000000" type="text/javascript"></script>`;

// Homepage with no consent platform, enough visible text to pass the "readable content" check, and
// privacy/terms links, so the snippet is the only thing that differs between tests.
const page = (snippet, extra = "") => `<!doctype html><html><head><title>Test Shop</title></head><body>${snippet}
<h1>Test Shop</h1><p>Handmade ceramics shipped across the EU. Free returns within 30 days on every order.</p>
<a href="/policies/privacy-policy">Privacy policy</a> <a href="/policies/terms-of-service">Terms of service</a>${extra}
</body></html>`;

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

// Scans a page through the worker. With env.ANTHROPIC_API_KEY set, the LLM call answers with `llm` (or, when
// `llmStatus` is not 200, returns `llm` as the API error body). Telegram and email calls are recorded, never sent.
async function scan(snippet, { env = {}, llm, llmStatus = 200, html, siteStatus = 200, setCookie, body = {}, cf } = {}) {
  let prompt = null, llmHeaders = null;
  const telegram = [], emails = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.startsWith("https://api.anthropic.com/")) {
      prompt = JSON.parse(init.body).messages[0].content;
      llmHeaders = init.headers;
      if (llmStatus !== 200) return Response.json(llm, { status: llmStatus });
      return Response.json({ content: [{ type: "text", text: JSON.stringify(llm) }] });
    }
    if (url.startsWith("https://api.telegram.org/")) { telegram.push(JSON.parse(init.body)); return Response.json({ ok: true }); }
    if (url.startsWith("https://api.zeptomail.com/")) { emails.push(JSON.parse(init.body)); return Response.json({ ok: true }); }
    const headers = new Headers({ "Content-Type": "text/html" });
    if (setCookie) for (const c of setCookie) headers.append("Set-Cookie", c);
    return new Response(html ?? page(snippet), { status: siteStatus, headers });
  };
  const req = new Request("https://cdn.gdrock.com/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://test-shop.example", ...body }),
  });
  if (cf) Object.defineProperty(req, "cf", { value: cf });
  const pending = [];
  const ctx = { waitUntil: (p) => pending.push(p) };
  const res = await worker.fetch(req, env, ctx);
  await Promise.all(pending);
  assert.equal(res.status, 200);
  return { report: await res.json(), prompt, llmHeaders, telegram, emails };
}

const tagNames = (report) => report.tags_found.map((t) => t.name);
const toolNames = (report) => report.consent_tools.map((t) => t.name);
const gtmNotices = (report) => report.issues.filter((i) => GTM_NOTICE_RE.test(i.text));

// --- Tag detection (regression from the GTM work) --------------------------

for (const [install, snippet] of Object.entries(GTM_INSTALLS)) {
  test(`GTM container is flagged on its own: ${install}`, async () => {
    const { report } = await scan(snippet);
    assert.deepEqual(tagNames(report), ["Google Tag Manager"]); // and not mislabelled as GA4
    const notices = gtmNotices(report);
    assert.equal(notices.length, 1);
    assert.equal(notices[0].severity, "warning");
  });
}

test("GA4 and GTM on the same page are both reported, with one GTM caveat", async () => {
  const { report } = await scan(GA4_INSTALLS["gtag.js loader + config"] + GTM_INSTALLS["Google's standard inline snippet"]);
  assert.deepEqual(tagNames(report), ["Google Analytics 4", "Google Tag Manager"]);
  assert.equal(gtmNotices(report).length, 1);
});

for (const [install, snippet] of Object.entries(GA4_INSTALLS)) {
  test(`GA4 is detected, with no GTM flag: ${install}`, async () => {
    const { report } = await scan(snippet);
    assert.deepEqual(tagNames(report), ["Google Analytics 4"]);
    assert.equal(gtmNotices(report).length, 0);
  });
}

test("Meta Pixel is detected, with no GTM flag", async () => {
  const { report } = await scan(META_PIXEL);
  assert.deepEqual(tagNames(report), ["Meta Pixel"]);
  assert.equal(gtmNotices(report).length, 0);
});

test("a tracker named in prose or a link is not a tag on the page", async () => {
  const { report } = await scan(`<p>We removed Google Analytics and the Meta Pixel last year.</p><a href="https://www.google-analytics.com/">GA</a>`);
  assert.deepEqual(tagNames(report), []);
});

// --- Consent tools: loader signatures, not bare names ------------------------

test("bug fix: 'vs cookiebot / vs iubenda / vs termly' footer links are not installed consent tools", async () => {
  const footer = `<footer><a href="/vs-cookiebot.html">GDRock vs Cookiebot</a> <a href="/vs-iubenda.html">vs iubenda</a> <a href="/vs-termly.html">vs Termly</a> <a href="/blog/onetrust-review">OneTrust review</a></footer>`;
  const { report } = await scan(META_PIXEL + footer);
  assert.deepEqual(toolNames(report), []);
  // So the real finding is not hidden behind the comparison links:
  assert.ok(report.deductions.some((d) => d.rule === "trackers_no_consent_tool"));
});

test("a real Cookiebot loader is detected, with the loader URL as evidence", async () => {
  const { report } = await scan(COOKIEBOT_LOADER);
  assert.deepEqual(toolNames(report), ["Cookiebot"]);
  assert.match(report.consent_tools[0].evidence, /consent\.cookiebot\.com\/uc\.js/);
});

test("the GDRock loader is detected by its script URL", async () => {
  const { report } = await scan(`<script async src="https://cdn.gdrock.com/gdrock.js" data-site-id="test-shop.example"></script>`);
  assert.deepEqual(toolNames(report), ["GDRock"]);
});

test("tags marked for a consent tool to hold back are reported as gated, with no deduction", async () => {
  const gatedPixel = `<script type="text/plain" data-cookieconsent="marketing">fbq('init','000000000000000');</script>`;
  const { report } = await scan(COOKIEBOT_LOADER + gatedPixel);
  assert.deepEqual(tagNames(report), ["Meta Pixel"]);
  assert.equal(report.deductions.length, 0);
  assert.equal(report.score, 100);
});

// --- Honesty: nothing claimed that a source scan cannot observe ------------

test("no finding asserts timing, a rendered banner, or blocking behaviour", async () => {
  const { report } = await scan(META_PIXEL + GTM_INSTALLS["<script src> from googletagmanager.com"]);
  const claims = report.issues.map((i) => i.text).join("\n");
  assert.doesNotMatch(claims, /\bfires? before\b|\bbefore (?:any )?consent\b(?! a visitor)|banner (?:is shown|appears|never)/i);
  assert.ok(report.issues.every((i) => i.confidence === "observed" || i.confidence === "inferred"));
  assert.equal(report.scan_method, "source");
  assert.ok(report.limits.some((l) => /No JavaScript was executed/.test(l)));
});

test("no consent tool in the source is reported as not found, never as 'no banner'", async () => {
  const { report } = await scan("");
  const t = report.issues.find((i) => /No consent tool was found/.test(i.text));
  assert.ok(t);
  assert.match(t.text, /not proof there is no banner/);
});

test("a scan from outside Europe says so in its limits", async () => {
  const { report } = await scan("", { cf: { country: "IL", colo: "TLV" } });
  assert.equal(report.vantage.country, "IL");
  assert.equal(report.vantage.inEurope, false);
  assert.ok(report.limits.some((l) => /IL, outside the EU\/EEA\/UK/.test(l)));
});

test("a scan from Germany is recorded as inside Europe", async () => {
  const { report } = await scan("", { cf: { country: "DE", colo: "FRA" } });
  assert.equal(report.vantage.inEurope, true);
});

test("a page that will not load gets no score and no findings about the site", async () => {
  const { report } = await scan("", { siteStatus: 403, html: "Forbidden" });
  assert.equal(report.is_real_site, false);
  assert.equal(report.score, null);
});

// --- Observations that geography cannot undermine --------------------------

test("Google Fonts linked in the source is a -10 finding with the stylesheet URL as evidence", async () => {
  const { report } = await scan(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">`);
  assert.equal(report.score, 90);
  const f = report.issues.find((i) => /Google Fonts/.test(i.text));
  assert.match(f.evidence, /fonts\.googleapis\.com/);
  assert.match(f.text, /LG M/);
});

test("youtube-nocookie is not treated as a cookie-setting embed; youtube.com is", async () => {
  const nocookie = await scan(`<iframe src="https://www.youtube-nocookie.com/embed/abc"></iframe>`);
  assert.equal(nocookie.report.score, 100);
  const yt = await scan(`<iframe src="https://www.youtube.com/embed/abc"></iframe>`);
  assert.equal(yt.report.score, 90);
});

test("a tracking cookie set by the homepage response itself is a critical, observed finding", async () => {
  const { report } = await scan("", { setCookie: ["_ga=GA1.1.123; Path=/", "cart=abc; Path=/"] });
  assert.deepEqual(report.document_cookies, ["_ga", "cart"]);
  const f = report.issues.find((i) => /set a tracking cookie/.test(i.text));
  assert.equal(f.severity, "critical");
  assert.equal(report.score, 85);
});

test("Consent Mode declared 'granted' by default is a finding; 'denied' is credited", async () => {
  const granted = await scan(`<script>gtag('consent','default',{ad_storage:'granted',analytics_storage:'granted'});</script>`);
  assert.ok(granted.report.deductions.some((d) => d.rule === "consent_mode_granted"));
  const denied = await scan(`<script>gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});</script>`);
  assert.ok(denied.report.issues.some((i) => i.severity === "good" && /denied by default/.test(i.text)));
});

test("tags with a consent tool but no gating markup is a note to check, not a deduction", async () => {
  const { report } = await scan(COOKIEBOT_LOADER + META_PIXEL);
  assert.equal(report.score, 100);
  const note = report.issues.find((i) => /no tag in the source carries the markup/.test(i.text));
  assert.equal(note.severity, "warning");
  assert.equal(note.confidence, "inferred");
});

test("Shopware 6 is recognised from its theme hash path", async () => {
  const { report } = await scan(`<link rel="stylesheet" href="https://shop.example/theme/286038c012f85535f0eaca2bf349fe8b/css/all.css">`);
  assert.equal(report.platform.name, "Shopware");
});

test("platform is reported with its evidence", async () => {
  const { report } = await scan(`<script src="https://cdn.shopify.com/s/files/1/theme.js"></script>`);
  assert.equal(report.platform.name, "Shopify");
});

// --- Score: rules only; the AI writes prose ---------------------------------

test("the score is rule-based: the same page scores the same whatever the model says", async () => {
  const snippet = META_PIXEL;
  const base = await scan(snippet);
  const withLlm = await scan(snippet, { env: { ANTHROPIC_API_KEY: "k" }, llm: { score: 12, site_description: "A ceramics shop.", summary: "Meta Pixel was found in the homepage source." } });
  assert.equal(withLlm.report.score, base.report.score);
  assert.equal(withLlm.report.site_description, "A ceramics shop.");
  assert.match(withLlm.report.summary, /^Meta Pixel was found in the homepage source\./);
  assert.doesNotMatch(withLlm.prompt, /"score"\s*:/); // the model is never asked for a number
});

test("AI prose that claims timing or blocking is dropped, and the rule-written copy stands", async () => {
  const llm = { site_description: "A ceramics shop.", summary: "The Meta Pixel fires before consent on page load." };
  const { report } = await scan(META_PIXEL, { env: { ANTHROPIC_API_KEY: "k" }, llm });
  assert.match(report.summary, /^Read the homepage source of test-shop\.example\./);
});

test("an AI API error keeps the rule-written copy and logs why, never the key", async (t) => {
  const logged = [];
  t.mock.method(console, "error", (...args) => { logged.push(args.join(" ")); });
  const apiError = { type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } };
  const { report } = await scan(GTM_INSTALLS["<script src> from googletagmanager.com"], { env: { ANTHROPIC_API_KEY: "sk-ant-test-key" }, llm: apiError, llmStatus: 401 });
  assert.match(report.summary, /^Read the homepage source/);
  assert.equal(gtmNotices(report).length, 1);
  assert.equal(logged.length, 1);
  assert.match(logged[0], /Anthropic API 401 authentication_error: invalid x-api-key/);
  assert.doesNotMatch(logged[0], /sk-ant-test-key/);
});

test("the Anthropic workspace id is sent only when ANTHROPIC_WORKSPACE_ID is set", async () => {
  const llm = { site_description: "x", summary: "y" };
  const withId = await scan(META_PIXEL, { env: { ANTHROPIC_API_KEY: "k", ANTHROPIC_WORKSPACE_ID: "wrkspc_test" }, llm });
  assert.equal(withId.llmHeaders["anthropic-workspace-id"], "wrkspc_test");
  const withoutId = await scan(META_PIXEL, { env: { ANTHROPIC_API_KEY: "k" }, llm });
  assert.equal("anthropic-workspace-id" in withoutId.llmHeaders, false);
});

// --- Owner alerts: every scan, anonymous or not ------------------------------

const ALERT_ENV = { TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1", ZEPTO_TOKEN: "z" };

test("an anonymous scan alerts the owner on Telegram and by email", async () => {
  const { telegram, emails } = await scan(META_PIXEL, { env: ALERT_ENV, cf: { country: "DE", colo: "FRA" } });
  assert.equal(telegram.length, 1);
  assert.match(telegram[0].text, /Anonymous scan/);
  assert.match(telegram[0].text, /Site: test-shop\.example/);
  assert.match(telegram[0].text, /Visitor location: DE \/ FRA/);
  assert.equal(telegram[0].parse_mode, undefined); // plain text: underscores can't break it
  assert.equal(emails.length, 1);
  assert.equal(emails[0].to[0].email_address.address, "office@gdrock.com");
});

test("a scan with an email alerts once with the email and opt-in, and sends the visitor the report", async () => {
  const { telegram, emails } = await scan("", { env: ALERT_ENV, body: { email: "owner@shop.example", optin: true } });
  assert.equal(telegram.length, 1);
  assert.match(telegram[0].text, /Email: owner@shop\.example \(opted in/);
  const to = emails.map((e) => e.to[0].email_address.address).sort();
  assert.deepEqual(to, ["office@gdrock.com", "owner@shop.example"]);
});

test("a scan that fails to load still alerts the owner", async () => {
  const { telegram } = await scan("", { env: ALERT_ENV, siteStatus: 503, html: "down" });
  assert.equal(telegram.length, 1);
  assert.match(telegram[0].text, /Scan failed to load/);
});

test("OWNER_EMAIL redirects the owner alert", async () => {
  const { emails } = await scan("", { env: { ...ALERT_ENV, OWNER_EMAIL: "me@example.com" } });
  assert.equal(emails[0].to[0].email_address.address, "me@example.com");
});

test("scanner leads are not announced twice on Telegram", async () => {
  const telegram = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.startsWith("https://api.telegram.org/")) telegram.push(JSON.parse(init.body));
    return Response.json({ ok: true });
  };
  const lead = (source) => worker.fetch(new Request("https://cdn.gdrock.com/api/lead", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, email: "a@b.example", website_url: "https://x.example" }),
  }), ALERT_ENV, { waitUntil() {} });
  await lead("scanner");
  assert.equal(telegram.length, 0);
  await lead("dfy_booking");
  assert.equal(telegram.length, 1);
});

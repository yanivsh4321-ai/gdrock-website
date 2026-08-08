/**
 * GDRock Cloudflare Worker
 * Handles: gdrock.js, banner config, consent logging, lead capture, GDPR scan
 *
 * Deploy at: dash.cloudflare.com ? Workers & Pages ? Create Worker
 * Then add a Custom Domain: cdn.gdrock.com
 *
 * Environment variables (add in Worker Settings ? Variables):
 *   SUPABASE_URL          your Supabase project URL
 *   SUPABASE_ANON_KEY     your Supabase anon key
 *   TELEGRAM_BOT_TOKEN    from @BotFather on Telegram
 *   TELEGRAM_CHAT_ID      your Telegram user ID (from @userinfobot)
 *   ANTHROPIC_API_KEY     your Anthropic API key (for scanner)
 *   RESEND_API_KEY        (optional) resend.com for email alerts
 */

// -- Embedded script-blocking engine (gdrock-blocker.js v1.0.0, rig-verified 29/29) --
// Served BEFORE the banner inside /gdrock.js so interception patches run first.
const GDROCK_BLOCKER_JS = "/*!\n * GDRock Script-Blocking Engine v1.0.0 — cdn.gdrock.com\n * ======================================================\n * Automatic script interception + Google Consent Mode v2.\n *\n * MUST be the FIRST script in <head> — before GTM/gtag, before any pixel\n * loader, before gdrock.js (the banner UI):\n *\n *   <script src=\"https://cdn.gdrock.com/gdrock-blocker.js\" data-site-id=\"YOUR_ID\"></script>\n *\n * What it does\n *   1. Holds any script whose URL matches the tracker blocklist (Meta Pixel,\n *      TikTok, GA4/GTM, common ad tags) until the matching consent category\n *      is granted. Covers dynamically injected scripts (createElement /\n *      setAttribute / .src assignment) AND parser-inserted external scripts\n *      in the initial HTML (MutationObserver).\n *   2. Reactivates publisher-tagged inline scripts:\n *        <script type=\"text/plain\" data-gdrock-category=\"analytics\">…</script>\n *      (the only spec-guaranteed way to gate inline scripts that are already\n *      in the initial HTML — the parser executes those synchronously, before\n *      any observer microtask can run).\n *   3. Google Consent Mode v2: defaults ad_storage / analytics_storage /\n *      ad_user_data / ad_personalization to 'denied' (wait_for_update: 500),\n *      updates per category on consent.\n *   4. Public API for the banner UI:\n *        window.GDRock.consent.get()            -> current consent state\n *        window.GDRock.consent.set({analytics, marketing})\n *        window.GDRock.consent.onChange(fn)     -> unsubscribe fn\n *      Backward compatible: window.GDRock.consent() still returns the state\n *      (the old gdrock.js exposed consent as a function).\n *\n * Interop with the live gdrock.js banner (no banner change needed):\n *   - shares the same localStorage key: gdrock_consent_<siteId>\n *   - listens for the banner's \"gdrock:consent\" CustomEvent and releases\n *     scripts / updates Consent Mode when the user chooses.\n *   - merge-safe window.GDRock: a later `window.GDRock = {...}` assignment\n *     (the current banner does exactly that) merges into the namespace\n *     instead of clobbering consent.get/set.\n *\n * Categories: \"analytics\" | \"marketing\". \"necessary\" is always granted.\n *\n * Optional attributes on the engine's own <script> tag:\n *   data-site-id=\"X\"              site id (storage key suffix; matches banner)\n *   data-gdrock-advanced=\"true\"   Advanced Consent Mode: do NOT hard-block\n *                                 Google tags (gtag/GTM/ads) — let them load\n *                                 with denied defaults and send cookieless\n *                                 pings. Default is OFF (hard block = the\n *                                 \"nothing fires before consent\" guarantee\n *                                 GDRock's verify rig checks for).\n *\n * Known limitations (documented, by design — see vault notes):\n *   - Inline parser scripts that are NOT tagged text/plain cannot be blocked.\n *   - document.write()-injected scripts are not intercepted.\n *   - Inline event handlers (onclick=\"fbq(...)\") are not blocked; however the\n *     standard fbq/ttq/gtag stub snippets QUEUE such calls, and the queue\n *     flushes correctly when the real script is released after consent.\n *   - Consent revocation updates Consent Mode + storage but cannot unload an\n *     already-running tracker; a page reload is required (standard CMP\n *     behavior — the banner UI may choose to reload).\n */\n(function (window, document) {\n  \"use strict\";\n  if (window.__gdrockBlocker) return;\n  window.__gdrockBlocker = { version: \"1.0.0\" };\n\n  // ---------- config -------------------------------------------------------\n  var me = document.currentScript;\n  var SITE_ID =\n    (me && me.getAttribute(\"data-site-id\")) ||\n    (window.GDRockConfig && window.GDRockConfig.siteId) ||\n    \"\";\n  if (!SITE_ID) {\n    var idTag = document.querySelector(\"script[data-site-id]\");\n    if (idTag) SITE_ID = idTag.getAttribute(\"data-site-id\") || \"\";\n  }\n  // Same key as gdrock.js so banner + engine share one consent record.\n  var STORAGE_KEY = \"gdrock_consent_\" + (SITE_ID || \"default\");\n  var ADVANCED = !!(me && me.getAttribute(\"data-gdrock-advanced\") === \"true\");\n\n  // ---------- blocklist ----------------------------------------------------\n  // Kept in sync with verify_consent.js TRACKERS — the engine must block\n  // exactly what the rig detects. [urlSubstring, category, isGoogleTag]\n  var BLOCKLIST = [\n    // Google (exempted from hard-blocking in Advanced Consent Mode)\n    [\"googletagmanager.com\", \"analytics\", true],\n    [\"google-analytics.com\", \"analytics\", true],\n    [\"analytics.google.com\", \"analytics\", true],\n    [\"doubleclick.net\", \"marketing\", true],\n    [\"googleadservices.com\", \"marketing\", true],\n    [\"googlesyndication.com\", \"marketing\", true],\n    // Analytics / session recording\n    [\"hotjar.com\", \"analytics\", false],\n    [\"clarity.ms\", \"analytics\", false],\n    [\"mouseflow.com\", \"analytics\", false],\n    [\"fullstory.com\", \"analytics\", false],\n    // Ad / marketing pixels\n    [\"connect.facebook.net\", \"marketing\", false],\n    [\"facebook.com/tr\", \"marketing\", false],\n    [\"analytics.tiktok.com\", \"marketing\", false],\n    [\"static.klaviyo.com\", \"marketing\", false],\n    [\"klaviyo.com/onsite\", \"marketing\", false],\n    [\"px.ads.linkedin.com\", \"marketing\", false],\n    [\"snap.licdn.com\", \"marketing\", false],\n    [\"ct.pinterest.com\", \"marketing\", false],\n    [\"s.pinimg.com/ct\", \"marketing\", false],\n    [\"sc-static.net\", \"marketing\", false],\n    [\"tr.snapchat.com\", \"marketing\", false],\n    [\"static.ads-twitter.com\", \"marketing\", false],\n    [\"analytics.twitter.com\", \"marketing\", false],\n    [\"criteo.com\", \"marketing\", false],\n    [\"criteo.net\", \"marketing\", false],\n    [\"bat.bing.com\", \"marketing\", false],\n    [\"taboola.com\", \"marketing\", false],\n    [\"outbrain.com\", \"marketing\", false]\n  ];\n\n  function matchCategory(url) {\n    if (!url) return null;\n    var u = String(url).toLowerCase();\n    for (var i = 0; i < BLOCKLIST.length; i++) {\n      if (u.indexOf(BLOCKLIST[i][0]) !== -1) {\n        if (ADVANCED && BLOCKLIST[i][2]) return null; // consent mode governs\n        return BLOCKLIST[i][1];\n      }\n    }\n    return null;\n  }\n\n  // ---------- consent state ------------------------------------------------\n  function loadStored() {\n    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }\n  }\n  var state = loadStored(); // {analytics, marketing, accepted, timestamp} | null\n\n  function granted(cat) {\n    if (cat === \"necessary\") return true;\n    return !!(state && state[cat]);\n  }\n\n  // ---------- Google Consent Mode v2 ---------------------------------------\n  window.dataLayer = window.dataLayer || [];\n  function gtag() { window.dataLayer.push(arguments); }\n  if (typeof window.gtag !== \"function\") window.gtag = gtag;\n\n  gtag(\"consent\", \"default\", {\n    ad_storage: \"denied\",\n    analytics_storage: \"denied\",\n    ad_user_data: \"denied\",\n    ad_personalization: \"denied\",\n    wait_for_update: 500\n  });\n  gtag(\"set\", \"ads_data_redaction\", true);\n\n  function pushConsentUpdate(c) {\n    gtag(\"consent\", \"update\", {\n      analytics_storage: c.analytics ? \"granted\" : \"denied\",\n      ad_storage: c.marketing ? \"granted\" : \"denied\",\n      ad_user_data: c.marketing ? \"granted\" : \"denied\",\n      ad_personalization: c.marketing ? \"granted\" : \"denied\"\n    });\n    gtag(\"set\", \"ads_data_redaction\", !c.marketing);\n  }\n  if (state) pushConsentUpdate(state); // returning visitor: restore immediately\n\n  // ---------- held-script registry -----------------------------------------\n  var held = []; // {el, src, text, category}\n\n  function holdElement(el, url, cat) {\n    origSetAttribute.call(el, \"type\", \"text/plain\");\n    origSetAttribute.call(el, \"data-gdrock-held\", \"1\");\n    if (url) origSetAttribute.call(el, \"data-gdrock-src\", url);\n    origSetAttribute.call(el, \"data-gdrock-category\", cat);\n    held.push({ el: el, src: url || null, text: null, category: cat });\n  }\n\n  function activate(h) {\n    var el = h.el;\n    if (el.parentNode) {\n      // Connected placeholder: swap in a fresh, executable script in place\n      // (changing type back on the same node does not re-trigger execution).\n      var s = origCreateElement.call(document, \"script\");\n      for (var i = 0; i < el.attributes.length; i++) {\n        var a = el.attributes[i];\n        if (a.name === \"type\" || a.name === \"src\" || a.name.indexOf(\"data-gdrock-\") === 0) continue;\n        origSetAttribute.call(s, a.name, a.value);\n      }\n      if (h.src) {\n        // Preserve execution order among released scripts unless the\n        // original opted into async.\n        s.async = el.hasAttribute(\"async\");\n        origSetAttribute.call(s, \"src\", h.src);\n      } else if (h.text != null) {\n        s.text = h.text;\n      }\n      el.parentNode.insertBefore(s, el);\n      el.parentNode.removeChild(el);\n    } else if (h.src) {\n      // Created but never inserted by the site: restore quietly so it runs\n      // IF the site inserts it later — never self-insert on its behalf.\n      el.removeAttribute(\"type\");\n      el.removeAttribute(\"data-gdrock-held\");\n      el.removeAttribute(\"data-gdrock-src\");\n      el.removeAttribute(\"data-gdrock-category\");\n      try { delete el.src; } catch (e) {} // drop per-instance accessor\n      origSetAttribute.call(el, \"src\", h.src);\n    }\n  }\n\n  function release() {\n    var remaining = [];\n    for (var i = 0; i < held.length; i++) {\n      if (granted(held[i].category)) activate(held[i]);\n      else remaining.push(held[i]);\n    }\n    held = remaining;\n  }\n\n  // ---------- interception: dynamically created scripts --------------------\n  var origCreateElement = Document.prototype.createElement;\n  var origSetAttribute = Element.prototype.setAttribute;\n  var nativeSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, \"src\");\n\n  Document.prototype.createElement = function (name) {\n    var el = origCreateElement.apply(this, arguments);\n    if (el && el.nodeName === \"SCRIPT\") hookScript(el);\n    return el;\n  };\n\n  function hookScript(el) {\n    try {\n      Object.defineProperty(el, \"src\", {\n        configurable: true,\n        get: function () {\n          return el.getAttribute(\"data-gdrock-src\") || nativeSrc.get.call(el);\n        },\n        set: function (v) {\n          var cat = matchCategory(v);\n          if (cat && !granted(cat)) { holdElement(el, String(v), cat); return; }\n          nativeSrc.set.call(el, v);\n        }\n      });\n    } catch (e) { /* locked-down env: setAttribute + observer paths still cover */ }\n  }\n\n  Element.prototype.setAttribute = function (name, value) {\n    if (this.nodeName === \"SCRIPT\" && String(name).toLowerCase() === \"src\") {\n      var cat = matchCategory(value);\n      if (cat && !granted(cat)) { holdElement(this, String(value), cat); return; }\n    }\n    return origSetAttribute.apply(this, arguments);\n  };\n\n  // ---------- interception: parser-inserted / third-party-injected ---------\n  // External scripts only: their fetch yields a microtask gap the observer\n  // wins. Inline parser scripts execute synchronously before observers run —\n  // those must use the tagged text/plain path.\n  function inspectNode(node) {\n    if (node.nodeType !== 1 || node.nodeName !== \"SCRIPT\") return;\n    if (node.getAttribute(\"data-gdrock-held\")) return; // ours\n    var type = (node.getAttribute(\"type\") || \"\").toLowerCase();\n    if (type === \"text/plain\") { registerTagged(node); return; }\n    var url = node.getAttribute(\"src\");\n    var cat = matchCategory(url);\n    if (!cat || granted(cat)) return;\n    // Neutralize before evaluation: belt (type) + braces (remove from DOM),\n    // leaving an inert placeholder that preserves position + attributes.\n    origSetAttribute.call(node, \"type\", \"text/plain\");\n    var ph = origCreateElement.call(document, \"script\");\n    for (var i = 0; i < node.attributes.length; i++) {\n      var a = node.attributes[i];\n      if (a.name === \"src\" || a.name === \"type\") continue;\n      origSetAttribute.call(ph, a.name, a.value);\n    }\n    holdElement(ph, url, cat);\n    if (node.parentNode) {\n      node.parentNode.insertBefore(ph, node);\n      node.parentNode.removeChild(node);\n    }\n  }\n\n  // Publisher-tagged scripts: <script type=\"text/plain\"\n  //   data-gdrock-category=\"analytics|marketing\" [src=… | inline code]>\n  function registerTagged(node) {\n    if (node.getAttribute(\"data-gdrock-held\")) return;\n    var cat = node.getAttribute(\"data-gdrock-category\");\n    if (!cat && !node.getAttribute(\"data-gdrock-src\")) return; // unrelated text/plain\n    cat = cat === \"analytics\" ? \"analytics\" : \"marketing\"; // safe default\n    var url = node.getAttribute(\"data-gdrock-src\") || node.getAttribute(\"src\") || null;\n    origSetAttribute.call(node, \"data-gdrock-held\", \"1\");\n    origSetAttribute.call(node, \"data-gdrock-category\", cat);\n    var rec = { el: node, src: url, text: url ? null : node.text, category: cat };\n    if (granted(cat)) activate(rec);\n    else held.push(rec);\n  }\n\n  new MutationObserver(function (muts) {\n    for (var m = 0; m < muts.length; m++) {\n      var added = muts[m].addedNodes;\n      for (var n = 0; n < added.length; n++) inspectNode(added[n]);\n    }\n  }).observe(document.documentElement || document, { childList: true, subtree: true });\n\n  // Sweep anything already parsed before the engine ran (engine should be the\n  // first script, but don't depend on it), and re-sweep at DOMContentLoaded\n  // for tagged scripts in case the observer was attached late.\n  function sweepTagged() {\n    var list = document.querySelectorAll('script[type=\"text/plain\"]');\n    for (var i = 0; i < list.length; i++) registerTagged(list[i]);\n  }\n  sweepTagged();\n  if (document.readyState === \"loading\") {\n    document.addEventListener(\"DOMContentLoaded\", sweepTagged);\n  }\n\n  // ---------- public API ----------------------------------------------------\n  var listeners = [];\n  function fireChange(c) {\n    for (var i = 0; i < listeners.length; i++) {\n      try { listeners[i](get()); } catch (e) {}\n    }\n  }\n\n  function get() {\n    var c = state || {};\n    return {\n      necessary: true,\n      analytics: !!c.analytics,\n      marketing: !!c.marketing,\n      choiceMade: !!state,\n      timestamp: c.timestamp || null\n    };\n  }\n\n  var applying = false;\n  function set(v) {\n    v = v || {};\n    var next = {\n      analytics: \"analytics\" in v ? !!v.analytics : !!(state && state.analytics),\n      marketing: \"marketing\" in v ? !!v.marketing : !!(state && state.marketing)\n    };\n    next.accepted = next.analytics || next.marketing;\n    next.timestamp = new Date().toISOString();\n    state = next;\n    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) {}\n    pushConsentUpdate(next);\n    release();\n    fireChange(next);\n    // Notify the banner/site. NOTE: the engine does NOT POST to\n    // /api/consent — consent logging stays owned by the banner (gdrock.js\n    // saveConsent), out of this module's scope.\n    applying = true;\n    try { window.dispatchEvent(new CustomEvent(\"gdrock:consent\", { detail: next })); }\n    catch (e) {}\n    applying = false;\n    return get();\n  }\n\n  // The live gdrock.js banner dispatches this after saveConsent() — the\n  // engine reacts without any banner change.\n  window.addEventListener(\"gdrock:consent\", function (e) {\n    if (applying) return;\n    var d = (e && e.detail) || loadStored() || {};\n    state = {\n      analytics: !!d.analytics,\n      marketing: !!d.marketing,\n      accepted: !!d.analytics || !!d.marketing,\n      timestamp: d.timestamp || new Date().toISOString()\n    };\n    pushConsentUpdate(state);\n    release();\n    fireChange(state);\n  });\n\n  // Back-compat: old gdrock.js exposed GDRock.consent as a FUNCTION returning\n  // the stored record — keep it callable, with get/set/onChange attached.\n  function consentAPI() { return get(); }\n  consentAPI.get = get;\n  consentAPI.set = set;\n  consentAPI.onChange = function (fn) {\n    if (typeof fn === \"function\") listeners.push(fn);\n    return function () {\n      var i = listeners.indexOf(fn);\n      if (i !== -1) listeners.splice(i, 1);\n    };\n  };\n\n  var ns = (typeof window.GDRock === \"object\" && window.GDRock) || {};\n  ns.consent = consentAPI;\n  ns.blocker = {\n    version: \"1.0.0\",\n    // Agencies/tests can extend the blocklist before trackers load.\n    add: function (pattern, category) {\n      BLOCKLIST.push([String(pattern).toLowerCase(), category === \"analytics\" ? \"analytics\" : \"marketing\", false]);\n    },\n    held: function () {\n      var out = [];\n      for (var i = 0; i < held.length; i++) {\n        out.push({ src: held[i].src, category: held[i].category, inline: held[i].src == null });\n      }\n      return out;\n    }\n  };\n\n  // Merge-safe namespace: a later `window.GDRock = {...}` (the current banner\n  // does this) merges in instead of clobbering the consent API.\n  try {\n    Object.defineProperty(window, \"GDRock\", {\n      configurable: true,\n      get: function () { return ns; },\n      set: function (v) {\n        if (v && typeof v === \"object\") {\n          for (var k in v) { if (k !== \"consent\") ns[k] = v[k]; }\n        }\n      }\n    });\n  } catch (e) {\n    window.GDRock = ns;\n  }\n})(window, document);\n";

// -- Embedded GDRock banner script (base64 logo included) ---------
const GDROCK_JS = `/*!
 * GDRock Cookie Banner v1.3 � cdn.gdrock.com
 */
(function(){
"use strict";
var SCRIPT=document.currentScript||(function(){var s=document.getElementsByTagName("script");return s[s.length-1];})();
var SITE_ID=SCRIPT.getAttribute("data-site-id");
var API_BASE="https://cdn.gdrock.com";
var LANG=(SCRIPT.getAttribute("data-lang")||navigator.language||"en").slice(0,2);
var STORAGE_KEY="gdrock_consent_"+(SITE_ID||"default");
var LOGO_B64_LIGHT="data:image/png;base64,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";
var LOGO_B64_DARK="data:image/png;base64,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";
var LOGO_B64=LOGO_B64_DARK;
if(!SITE_ID){console.warn("[GDRock] Missing data-site-id");return;}
var I18N={
  en:{title:"We value your privacy",desc:"We use cookies to improve your experience, analyze traffic, and personalize content. You can accept all, reject non-essential, or customize your preferences.",accept:"Accept all",reject:"Reject all",customize:"Customize",save:"Save preferences",necessary:"Necessary",necessaryDesc:"Required for the site to work. Always on.",analytics:"Analytics",analyticsDesc:"Helps us understand how visitors use our site.",marketing:"Marketing",marketingDesc:"Used to deliver relevant ads and measure campaigns.",poweredBy:"Powered by GDRock � GDPR Compliance"},
  he:{title:"אנחנו מכבדים את הפרטיות שלך",desc:"אנחנו משתמשים בעוגיות לשיפור החוויה, ניתוח תנועה והתאמה אישית.",accept:"אישור הכל",reject:"דחה הכל",customize:"התאמה אישית",save:"שמור העדפות",necessary:"הכרחי",necessaryDesc:"נדרש לתפקוד האתר.",analytics:"אנליטיקה",analyticsDesc:"מסייע להבין איך משתמשים באתר.",marketing:"שיווק",marketingDesc:"מודעות רלוונטיות.",poweredBy:"מופעל ע״י GDRock"},
  es:{title:"Valoramos tu privacidad",desc:"Usamos cookies para mejorar tu experiencia.",accept:"Aceptar todo",reject:"Rechazar",customize:"Personalizar",save:"Guardar",necessary:"Necesarias",necessaryDesc:"Requeridas.",analytics:"Anal�ticas",analyticsDesc:"Uso del sitio.",marketing:"Marketing",marketingDesc:"Anuncios relevantes.",poweredBy:"Powered by GDRock"}
};
var T=I18N[LANG]||I18N.en;
function loadConsent(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY));}catch(e){return null;}}
function saveConsent(c){c.timestamp=new Date().toISOString();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(c));}catch(e){}sendConsent(c);window.dispatchEvent(new CustomEvent("gdrock:consent",{detail:c}));}
function sendConsent(c){try{fetch(API_BASE+"/api/consent",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({site_id:SITE_ID,accepted:c.accepted,analytics:c.analytics,marketing:c.marketing}),keepalive:true}).catch(function(){});}catch(e){}}
var CSS=".gdrock-root,.gdrock-root *{box-sizing:border-box;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}"+
".gdrock-banner{position:fixed;left:16px;right:16px;bottom:16px;max-width:540px;margin:0 auto;background:var(--gdr-bg,#0a1628);color:var(--gdr-fg,#f4f6fb);border:1px solid var(--gdr-border,rgba(176,188,212,.18));border-radius:var(--gdr-radius,16px);box-shadow:0 18px 50px rgba(3,12,30,.45);padding:22px;z-index:2147483647;transform:translateY(140%);opacity:0;transition:transform .4s cubic-bezier(.2,.9,.3,1.2),opacity .25s;max-height:calc(100vh - 32px);overflow-y:auto}"+
".gdrock-banner.in{transform:translateY(0);opacity:1}"+
".gdrock-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}"+
".gdrock-logo-img{width:var(--gdr-logo-size,32px);height:var(--gdr-logo-size,32px);object-fit:contain;flex-shrink:0;border-radius:6px}"+
".gdrock-title{font-size:var(--gdr-title-size,16px);font-weight:700;margin:0;font-family:'Syne',sans-serif;letter-spacing:-.01em}"+
".gdrock-desc{font-size:13px;line-height:1.55;margin:0 0 16px;color:var(--gdr-muted,#b0bcd4)}"+
".gdrock-row{display:flex;gap:8px;flex-wrap:wrap}"+
".gdrock-btn{flex:1;min-width:110px;min-height:44px;border:0;border-radius:10px;padding:12px 14px;font-size:13px;font-weight:600;cursor:pointer;transition:transform .1s,box-shadow .2s;font-family:inherit}"+
".gdrock-btn:active{transform:scale(.97)}"+
".gdrock-btn-primary{background:var(--gdr-accent,linear-gradient(135deg,#3b82f6,#2563eb));color:#fff;box-shadow:0 4px 14px rgba(26,109,255,.35)}"+
".gdrock-btn-ghost{background:rgba(255,255,255,.1);color:var(--gdr-fg,#f4f6fb)}"+
".gdrock-btn-ghost:hover{background:rgba(255,255,255,.18)}"+
".gdrock-btn-secondary{background:rgba(60,75,110,.75);color:var(--gdr-fg,#f4f6fb);box-shadow:0 2px 8px rgba(0,0,0,.22)}"+
".gdrock-btn-secondary:hover{background:rgba(60,75,110,.95)}"+
".gdrock-cat{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid var(--gdr-border,rgba(176,188,212,.18))}"+
".gdrock-cat-name{font-size:13px;font-weight:600}"+
".gdrock-cat-desc{font-size:12px;color:var(--gdr-muted,#b0bcd4);margin-top:2px;line-height:1.45}"+
".gdrock-switch{position:relative;width:40px;height:22px;flex-shrink:0}"+
".gdrock-switch input{opacity:0;width:0;height:0}"+
".gdrock-slider{position:absolute;inset:0;background:#4b5563;border-radius:22px;transition:.2s;cursor:pointer}"+
".gdrock-slider:before{content:'';position:absolute;height:18px;width:18px;left:2px;top:2px;background:#fff;border-radius:50%;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}"+
".gdrock-switch input:checked+.gdrock-slider{background:var(--gdr-accent,#3b82f6)}"+
".gdrock-switch input:checked+.gdrock-slider:before{transform:translateX(18px)}"+
".gdrock-switch input:disabled+.gdrock-slider{opacity:.5;cursor:not-allowed}"+
".gdrock-foot{margin-top:14px;font-size:11px;color:var(--gdr-muted,#b0bcd4);text-align:center}"+
".gdrock-foot a{color:var(--gdr-accent,#3b82f6);text-decoration:none;font-weight:600}"+
".gdrock-foot a:hover{text-decoration:underline}"+
"@media(max-width:520px){.gdrock-banner{left:8px;right:8px;bottom:8px;padding:18px;border-radius:14px}.gdrock-btn{min-width:0;flex:1 1 100%;padding:14px}.gdrock-row{flex-direction:column-reverse}}";
var config={theme:"auto",accent:"#3b82f6",bg:null,fg:null,radius:16,logoSize:32,titleSize:16,customLogoB64:null};
function applyConfig(cfg){
  var dark=cfg.theme==="dark"||(cfg.theme==="auto"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches);
  var s=document.documentElement.style;
  s.setProperty("--gdr-bg",cfg.bg||(dark?"#0a1628":"#ffffff"));
  s.setProperty("--gdr-fg",cfg.fg||(dark?"#f4f6fb":"#0a1628"));
  s.setProperty("--gdr-muted",dark?"#b0bcd4":"#6b7a99");
  s.setProperty("--gdr-border",dark?"rgba(176,188,212,.18)":"#e8ecf4");
  s.setProperty("--gdr-accent",cfg.accentBtn||cfg.accent||"#3b82f6");
  s.setProperty("--gdr-radius",(cfg.radius||16)+"px");
  s.setProperty("--gdr-logo-size",(cfg.logoSize||32)+"px");
  s.setProperty("--gdr-title-size",(cfg.titleSize||16)+"px");
}
function injectCSS(){if(document.getElementById("gdrock-css"))return;var el=document.createElement("style");el.id="gdrock-css";el.textContent=CSS;document.head.appendChild(el);}
function render(showCustomize){
  var root=document.getElementById("gdrock-root");
  if(root)root.remove();
  root=document.createElement("div");root.id="gdrock-root";root.className="gdrock-root";
  root.setAttribute("dir",(LANG==="he"||LANG==="ar")?"rtl":"ltr");
  var existing=loadConsent()||{analytics:false,marketing:false};
  var logoSrc=(config.customLogoB64&&config.customLogoB64.length>10)?config.customLogoB64:((config.theme==="dark"||(config.theme==="auto"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches))?LOGO_B64_LIGHT:LOGO_B64_DARK);
  var html='<div class="gdrock-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">'+
    '<div class="gdrock-head"><img class="gdrock-logo-img" src="'+logoSrc+'" alt="GDRock"><h2 class="gdrock-title">'+T.title+'</h2></div>'+
    '<p class="gdrock-desc">'+T.desc+'</p>';
  if(showCustomize){
    html+=cat("necessary",T.necessary,T.necessaryDesc,true,true)+
      cat("analytics",T.analytics,T.analyticsDesc,existing.analytics,false)+
      cat("marketing",T.marketing,T.marketingDesc,existing.marketing,false)+
      '<div class="gdrock-row" style="margin-top:14px"><button type="button" class="gdrock-btn gdrock-btn-primary" data-action="save">'+T.save+'</button></div>';
  }else{
    html+='<div class="gdrock-row">'+
      '<button type="button" class="gdrock-btn gdrock-btn-secondary" data-action="reject">'+T.reject+'</button>'+
      '<button type="button" class="gdrock-btn gdrock-btn-ghost" data-action="customize">'+T.customize+'</button>'+
      '<button type="button" class="gdrock-btn gdrock-btn-primary" data-action="accept">'+T.accept+'</button></div>';
  }
  var href="https://gdrock.com/?utm_source=banner&utm_medium=poweredby&utm_campaign=site_"+encodeURIComponent(SITE_ID);
  html+='<div class="gdrock-foot"><a href="'+href+'" target="_blank" rel="noopener noreferrer">'+T.poweredBy+'</a></div></div>';
  root.innerHTML=html;document.body.appendChild(root);
  requestAnimationFrame(function(){root.querySelector(".gdrock-banner").classList.add("in");});
  root.addEventListener("click",function(e){
    var a=e.target.getAttribute&&e.target.getAttribute("data-action");
    if(!a)return;
    if(a==="accept")finish({accepted:true,analytics:true,marketing:true});
    else if(a==="reject")finish({accepted:false,analytics:false,marketing:false});
    else if(a==="customize")render(true);
    else if(a==="save")finish({accepted:true,analytics:!!root.querySelector('input[data-key="analytics"]').checked,marketing:!!root.querySelector('input[data-key="marketing"]').checked});
  });
}
function cat(key,name,desc,checked,disabled){
  return '<div class="gdrock-cat"><div><div class="gdrock-cat-name">'+name+'</div><div class="gdrock-cat-desc">'+desc+'</div></div>'+
    '<label class="gdrock-switch"><input type="checkbox" data-key="'+key+'"'+(checked?" checked":"")+(disabled?" disabled":"")+'><span class="gdrock-slider"></span></label></div>';
}
function finish(c){saveConsent(c);var el=document.getElementById("gdrock-root");if(el){var b=el.querySelector(".gdrock-banner");if(b)b.classList.remove("in");setTimeout(function(){el.remove();},350);}}
function init(){
  fetch(API_BASE+"/api/banner-config/"+encodeURIComponent(SITE_ID))
    .then(function(r){return r.ok?r.json():{}})
    .catch(function(){return{};})
    .then(function(cfg){
      if(cfg.blocked){console.warn("[GDRock] Not authorised: "+SITE_ID);try{localStorage.removeItem(STORAGE_KEY);}catch(e){}return;}
      config=Object.assign(config,cfg);
      if(!loadConsent()){injectCSS();applyConfig(config);render(false);}
    });
}
window.GDRock={show:function(){injectCSS();applyConfig(config);render(false);},consent:loadConsent,reset:function(){try{localStorage.removeItem(STORAGE_KEY);}catch(e){}}};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
`;

// -- Hosted Privacy Policy loader script --------------------------
const GDROCK_POLICY_JS = `/*!
 * GDRock Privacy Policy Loader v1.0 — cdn.gdrock.com
 * Usage: <div data-gdrock-policy="YOUR_SITE_ID"></div>
 *        <script src="https://cdn.gdrock.com/gdrock-policy.js"><\/script>
 */
(function(){
"use strict";
var el=document.querySelector("[data-gdrock-policy]");
if(!el)return;
var siteId=el.getAttribute("data-gdrock-policy");
if(!siteId){console.warn("[GDRock] Missing data-gdrock-policy value");return;}
el.innerHTML='<p style="color:#6b7a99;font-size:14px;padding:20px 0;">Loading privacy policy…</p>';
fetch("https://cdn.gdrock.com/api/policy/"+encodeURIComponent(siteId))
  .then(function(r){return r.ok?r.json():{};})
  .catch(function(){return{};})
  .then(function(d){
    if(d&&d.html){el.innerHTML=d.html;}
    else{el.innerHTML='<p style="color:#e63946;font-size:14px;padding:20px 0;">Privacy policy not configured. Please contact the site owner.</p>';}
  });
})();
`;

// -- DPA map (country code → supervisory authority) ---------------
const DPA_MAP = {
  IE:{name:"Data Protection Commission (DPC) Ireland",url:"https://www.dataprotection.ie"},
  FR:{name:"CNIL",url:"https://www.cnil.fr"},
  DE:{name:"Bundesbeauftragter für den Datenschutz (BfDI)",url:"https://www.bfdi.bund.de"},
  GB:{name:"Information Commissioner's Office (ICO)",url:"https://ico.org.uk"},
  NL:{name:"Autoriteit Persoonsgegevens",url:"https://www.autoriteitpersoonsgegevens.nl"},
  ES:{name:"Agencia Española de Protección de Datos (AEPD)",url:"https://www.aepd.es"},
  IT:{name:"Garante per la protezione dei dati personali",url:"https://www.garanteprivacy.it"},
  SE:{name:"Integritetsskyddsmyndigheten (IMY)",url:"https://www.imy.se"},
  PL:{name:"Urząd Ochrony Danych Osobowych (UODO)",url:"https://uodo.gov.pl"},
  IL:{name:"Privacy Protection Authority (PPA)",url:"https://www.gov.il/en/departments/pppa"},
};

// -- CORS headers for all responses -------------------------------
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function cors(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { ...CORS, ...extra } });
}
function json(obj, status = 200) {
  return cors(JSON.stringify(obj), status, { "Content-Type": "application/json" });
}

// -- Domain authorization -----------------------------------------
// A site_id is a public identifier (it ships in the customer's page source),
// so it can't be a secret. We authorize by the request's Origin/Referer host —
// the browser sets these honestly and page JS can't forge them — against the
// domain(s) registered to that site. A copied site_id therefore only works on
// the domain it was sold to.
function reqHost(request) {
  const src = request.headers.get("Origin") || request.headers.get("Referer") || "";
  try { return new URL(src).hostname.replace(/^www\./, "").toLowerCase(); } catch (e) { return ""; }
}
function normDomain(s) {
  return String(s || "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[\/?#].*$/, "").trim().toLowerCase();
}
// Lenient only when no host can be determined (rare no-referrer / non-browser
// callers gain nothing — they can't render the banner for real visitors). A real
// browser on the wrong domain always sends a host and is blocked. Falls back to
// the site_id-as-domain when allowed_domains hasn't been set on the row yet, so
// existing customers keep working without a migration.
function hostAuthorized(request, siteId, allowedDomains) {
  const host = reqHost(request);
  if (!host) return true;
  // The /customize dashboard itself calls this same endpoint (to preview/log
  // in) from cdn.gdrock.com, not from the customer's domain — that's not the
  // theft scenario this check guards against (a site_id copied onto someone
  // else's live site), so always allow it. Actual writes still require the
  // correct access_code in /save regardless of origin. gdrock.com is the same
  // trust tier — it's app.html, the Compliance Console, managing a client
  // site's config on the agency's behalf (the portfolio pitch needs this to
  // actually load a client's real saved settings, not just gdrock.com's own).
  if (host === "cdn.gdrock.com" || host === "gdrock.com") return true;
  const list = (Array.isArray(allowedDomains) && allowedDomains.length)
    ? allowedDomains.map(normDomain)
    : [normDomain(siteId)];
  return list.includes(host);
}

// -- Router --------------------------------------------------------
export default {
  async fetch(request, env) {
    const url  = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") return cors("", 204);

    // -- GET /gdrock.js ------------------------------------------
    // Blocking engine runs FIRST, banner UI second — one script tag, no install change.
    if (path === "/gdrock.js" || path === "/gdrock.min.js") {
      return cors(GDROCK_BLOCKER_JS + "\n;\n" + GDROCK_JS, 200, {
        "Content-Type":  "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      });
    }

    // -- GET /gdrock-blocker.js — engine standalone ---------------
    if (path === "/gdrock-blocker.js") {
      return cors(GDROCK_BLOCKER_JS, 200, {
        "Content-Type":  "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      });
    }

    // -- GET /api/banner-config/:siteId --------------------------
    if (path.startsWith("/api/banner-config/") && !path.endsWith("/save")) {
      const siteId = decodeURIComponent(path.replace("/api/banner-config/", ""));
      if (!siteId) return json({ error: "Missing siteId" }, 400);

      if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
        return json({ blocked: false, theme: "auto", primary: "#3b82f6" });
      }

      try {
        const r = await fetch(
          `${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(siteId)}&active=eq.true&select=*`,
          { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
        );
        const rows = await r.json();
        if (!rows || rows.length === 0) return json({ blocked: false, theme: "auto", primary: "#3b82f6" });
        const row = rows[0];
        // Only serve the banner to the domain(s) this site_id is registered to.
        if (!hostAuthorized(request, siteId, row.allowed_domains)) {
          return json({ blocked: true, reason: "unauthorized_domain" });
        }
        // The /customize dashboard sends ?code= when logging in — validate it
        // here so a wrong/blank code is rejected at login, not silently let
        // through (only /save enforced this before; the live gdrock.js banner
        // load never sends ?code=, so this doesn't affect real visitors).
        const codeParam = url.searchParams.get("code");
        if (codeParam !== null) {
          if (!row.access_code || row.access_code.toUpperCase() !== codeParam.trim().toUpperCase()) {
            return json({ blocked: true, reason: "invalid_code" });
          }
        }
        const cfg = row.config || {};
        return json({
          blocked: false, plan: row.plan,
          theme: cfg.theme || "auto", primary: cfg.accent || "#3b82f6",
          accentBtn: cfg.accent || "#3b82f6", bg: cfg.bg || null, fg: cfg.fg || null,
          radius: cfg.radius ?? 16, titleSize: cfg.titleSize ?? 16, logoSize: cfg.logoSize ?? 32,
          customLogoB64: cfg.customLogoB64 || null,
          // access_code is deliberately NOT exposed here — /save validates it server-side
          poweredByLocked: true,
        });
      } catch (e) {
        return json({ blocked: true, reason: "db_error" });
      }
    }

    // -- POST /api/banner-config/save ---------------------------
    if (path === "/api/banner-config/save" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { site_id, accessCode, accent, bg, fg, radius, titleSize, logoSize, theme, customLogoB64 } = body;
      if (!site_id || !accessCode) return json({ error: "Missing site_id or accessCode" }, 400);

      const check = await fetch(
        `${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(site_id)}&active=eq.true&select=access_code`,
        { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
      );
      const rows = await check.json();
      if (!rows || rows.length === 0) return json({ error: "Site not found" }, 403);
      if (rows[0].access_code && rows[0].access_code.toUpperCase() !== accessCode.toUpperCase()) {
        return json({ error: "Invalid access code" }, 403);
      }

      const cfg = { accent, bg, fg, radius, titleSize, logoSize, theme, customLogoB64, poweredByLocked: true, accessCode: rows[0].access_code };
      await fetch(
        `${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(site_id)}`,
        { method: "PATCH", headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "return=minimal" }, body: JSON.stringify({ config: cfg }) }
      );
      return json({ ok: true });
    }

    // -- POST /api/consent ---------------------------------------
    if (path === "/api/consent" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { site_id, accepted, analytics, marketing } = body;
      if (!site_id) return json({ error: "Missing site_id" }, 400);

      if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
        // Only log consent from a domain registered to this site.
        try {
          const sr = await fetch(
            `${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(site_id)}&active=eq.true&select=allowed_domains`,
            { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
          );
          const srows = await sr.json();
          const allowed = (Array.isArray(srows) && srows[0]) ? srows[0].allowed_domains : null;
          if (!hostAuthorized(request, site_id, allowed)) return json({ ok: true, skipped: "unauthorized_domain" });
        } catch (e) { /* if the lookup fails, fall through and log */ }
        await fetch(`${env.SUPABASE_URL}/rest/v1/consent_logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "return=minimal" },
          body: JSON.stringify({ site_id, accepted: !!accepted, analytics: !!analytics, marketing: !!marketing, ip: request.headers.get("CF-Connecting-IP") || null, user_agent: request.headers.get("User-Agent") || null }),
        }).catch(() => {});
      }
      return json({ ok: true });
    }

    // -- GET /api/consent-logs?site_id=X -------------------------
    // Read-only feed of recent consent events for the Compliance Console
    // (app.html). Returns ONLY non-PII fields (no IP / user-agent) by reading
    // the consent_logs_public view, so the public site_id can never expose a
    // visitor's personal data. See supabase-consent-logs-read.sql for the view.
    if (path === "/api/consent-logs" && request.method === "GET") {
      const siteId = (url.searchParams.get("site_id") || "").trim();
      if (!siteId) return json({ error: "Missing site_id" }, 400);
      if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return json([]);
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 200);
      try {
        const r = await fetch(
          `${env.SUPABASE_URL}/rest/v1/consent_logs_public?site_id=eq.${encodeURIComponent(siteId)}&select=created_at,accepted,analytics,marketing&order=created_at.desc&limit=${limit}`,
          { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
        );
        if (!r.ok) return json([]);
        const rows = await r.json();
        return json(Array.isArray(rows) ? rows : []);
      } catch (e) {
        return json([]);
      }
    }

    // -- POST /api/lead ------------------------------------------
    if (path === "/api/lead" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { source = "unknown", name = "", email = "", website_url = "", service = "", notes = "", plan = "" } = body;
      if (!email || !email.includes("@")) return json({ error: "Valid email required" }, 400);

      const SOURCE_LABELS = { modal_free: "?? Free Download", modal_paid: "?? Paid Modal", hero: "?? Hero Email", dfy_booking: "?? DFY Booking", checkout: "?? Checkout Started", agency_pilot: "?? AGENCY PILOT APPLICATION", scanner: "?? Scanner Lead" };

      // Save to Supabase
      if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
        await fetch(`${env.SUPABASE_URL}/rest/v1/leads`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "return=minimal" },
          body: JSON.stringify({ source, name, email, website_url, service, notes, plan }),
        }).catch(() => {});
      }

      // Telegram alert
      if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
        const label = SOURCE_LABELS[source] || `?? ${source}`;
        const lines = [`${label}`, "", `?? ${name || "(no name)"}`, `?? ${email}`, website_url && `?? ${website_url}`, plan && `?? ${plan}`, service && `?? ${service}`, notes && `?? ${notes.slice(0, 200)}`].filter(Boolean).join("\n");
        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: `?? *New GDRock Lead*\n\n${lines}`, parse_mode: "Markdown" }),
        }).catch(() => {});
      }

      return json({ ok: true });
    }

    // -- POST /api/scan ------------------------------------------
    if (path === "/api/scan" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { url: rawUrl, email } = body;
      if (!rawUrl) return json({ error: "Missing url" }, 400);
      const domain = rawUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim().toLowerCase();
      const fullUrl = "https://" + domain;

      // 1) SCRAPE the real site (clean text + links + trackers)
      const scraped = await scrapeSite(fullUrl);
      if (!scraped.ok || (scraped.text || "").length < 80) {
        return json({ score: 0, is_real_site: false,
          site_description: "Could not load this site.",
          summary: "The site did not respond or returned no readable homepage content.",
          legal_disclaimer: SCAN_DISCLAIMER,
          issues: [{ severity: "warning", text: "Site could not be reached or has no readable homepage content. Check the URL and that the site is live." }] });
      }

      // 2) Analyse with LLM on REAL scraped data (objective, no favoritism)
      let result;
      if (env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY) {
        try { result = await llmScan(env, buildScanPrompt(fullUrl, scraped)); }
        catch (e) { result = null; }
      }
      if (!result || typeof result.score !== "number") result = signalScan(domain, scraped);
      result.legal_disclaimer = result.legal_disclaimer || SCAN_DISCLAIMER;

      // Persist scan result for funnel analytics (best-effort)
      if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
        fetch(`${env.SUPABASE_URL}/rest/v1/scan_results`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "return=minimal" },
          body: JSON.stringify({ email: email || null, domain, score: result.score, summary: result.summary || null, issues: result.issues || [] }),
        }).catch(() => {});
      }

      // Email the report to the visitor + notify office@gdrock.com (best-effort, never blocks the response)
      if (email && email.includes("@")) {
        try { await sendScanReport(env, email, domain, result); } catch (e) {}
      }

      return json(result);
    }

    // -- POST /api/paddle-webhook --------------------------------
    if (path === "/api/paddle-webhook" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const eventType = body?.event_type || "";
      const data = body?.data || {};
      const email = data.customer?.email || data.billing_details?.email || "";
      const rawSiteUrl = data.custom_data?.website_url || "";
      const siteId = rawSiteUrl.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim().toLowerCase();
      const items = data.items || [];
      const plan = items[0]?.price?.id ? "care" : "care"; // update with real price IDs

      if (eventType === "subscription.canceled" || eventType === "subscription.paused") {
        if (siteId) await supabasePatch(env, siteId, { active: false });
        return json({ ok: true });
      }
      if (eventType === "subscription.resumed") {
        if (siteId) await supabasePatch(env, siteId, { active: true });
        return json({ ok: true });
      }
      if (eventType === "transaction.completed" || eventType === "subscription.created" || eventType === "subscription.updated") {
        if (!siteId || !email) return json({ ok: true, note: "missing siteId or email" });
        const code = generateCode();
        await supabaseUpsert(env, siteId, plan, true, code);
        if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
          await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: `?? *New Paddle Sale!*\n\n?? ${email}\n?? ${siteId}\n?? ${plan}\n?? Code: ${code}`, parse_mode: "Markdown" }),
          }).catch(() => {});
        }
        return json({ ok: true });
      }
      return json({ ok: true, skipped: true });
    }

    // -- GET /customize  � proxy (URL stays cdn.gdrock.com/customize) --------
    if (path === "/customize.html" || path === "/customize" || path === "/customize/") {
      try {
        const upstream = await fetch(
          "https://gdrock-banner-git-main-gd-rock-s-projects.vercel.app/customize.html",
          { cf: { cacheTtl: 300 } }
        );
        let body = await upstream.text();
        // safety: if Vercel returns an auth/redirect wall, fall back to a redirect
        if (!upstream.ok || /Vercel Authentication|Authenticating/i.test(body)) {
          return Response.redirect("https://gdrock-banner-git-main-gd-rock-s-projects.vercel.app/customize.html", 302);
        }
        return new Response(body, {
          status: 200,
          headers: { ...CORS, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" },
        });
      } catch (e) {
        return Response.redirect("https://gdrock-banner-git-main-gd-rock-s-projects.vercel.app/customize.html", 302);
      }
    }

    // -- GET /gdrock-policy.js ---------------------------------------
    if (path === "/gdrock-policy.js") {
      return cors(GDROCK_POLICY_JS, 200, {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      });
    }

    // -- GET /api/policy/:siteId -------------------------------------
    if (path.startsWith("/api/policy/") && !path.endsWith("/save") && request.method === "GET") {
      const siteId = decodeURIComponent(path.replace("/api/policy/", ""));
      if (!siteId) return json({ error: "Missing siteId" }, 400);
      if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return json({ error: "Not configured" }, 503);
      try {
        const r = await fetch(
          `${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(siteId)}&active=eq.true&select=config`,
          { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
        );
        const rows = await r.json();
        if (!rows || rows.length === 0) return json({ error: "Site not found" }, 404);
        const pc = (rows[0].config || {}).policy || {};
        if (!pc.company_name) return json({ error: "Policy not configured for this site" }, 404);
        return json({ html: buildPolicyHtml(pc) });
      } catch (e) {
        return json({ error: "db_error" }, 500);
      }
    }

    // -- POST /api/policy/save ---------------------------------------
    if (path === "/api/policy/save" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { site_id, accessCode, ...policyFields } = body;
      if (!site_id || !accessCode) return json({ error: "Missing site_id or accessCode" }, 400);
      if (!policyFields.company_name || !policyFields.contact_email)
        return json({ error: "company_name and contact_email are required" }, 400);

      const checkR = await fetch(
        `${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(site_id)}&active=eq.true&select=config,access_code`,
        { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
      );
      const rows = await checkR.json();
      if (!rows || rows.length === 0) return json({ error: "Site not found" }, 403);
      if (rows[0].access_code && rows[0].access_code.toUpperCase() !== accessCode.toUpperCase())
        return json({ error: "Invalid access code" }, 403);

      const existingConfig = rows[0].config || {};
      const newPolicy = { ...policyFields, updated_date: new Date().toISOString().slice(0, 10) };
      await fetch(
        `${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(site_id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "return=minimal" },
          body: JSON.stringify({ config: { ...existingConfig, policy: newPolicy } }),
        }
      );
      return json({ ok: true, preview_url: `https://cdn.gdrock.com/api/policy/${encodeURIComponent(site_id)}` });
    }

    return cors("GDRock CDN — OK", 200, { "Content-Type": "text/plain" });
  }
};

// -- Helpers -------------------------------------------------------

// Send transactional email via ZeptoMail (Zoho) — falls back to Resend if configured.
// Env vars: ZEPTO_TOKEN + MAIL_FROM   (or)   RESEND_API_KEY + MAIL_FROM
async function sendEmail(env, to, subject, html) {
  const from = env.MAIL_FROM || "noreply@gdrock.com";
  if (env.ZEPTO_TOKEN) {
    return fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: { "Authorization": "Zoho-enczapikey " + env.ZEPTO_TOKEN, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        from: { address: from, name: "GDRock" },
        to: [{ email_address: { address: to } }],
        subject, htmlbody: html,
      }),
    });
  }
  if (env.RESEND_API_KEY) {
    return fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "GDRock <" + from + ">", to: [to], subject, html }),
    });
  }
  return null; // no email provider configured yet
}

// Build + send the compliance scan report to the visitor, and notify office@gdrock.com
async function sendScanReport(env, email, domain, result) {

  const score = result.score ?? "—";
  const color = score >= 80 ? "#00a896" : score >= 60 ? "#f5c842" : "#e63946";
  const issues = (result.issues || []).map(i => {
    const c = i.severity === "critical" ? "#e63946" : i.severity === "good" ? "#00a896" : "#f5c842";
    const mark = i.severity === "critical" ? "✗" : i.severity === "good" ? "✓" : "!";
    return `<tr><td style="padding:8px 12px;border-left:3px solid ${c};background:#0a1020;color:#cfd8ea;font-size:14px;border-radius:6px;">${mark} ${i.text}</td></tr><tr><td style="height:8px"></td></tr>`;
  }).join("");

  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#04081a;padding:32px;border-radius:16px;">
    <div style="text-align:center;margin-bottom:24px;"><span style="font-size:22px;font-weight:800;color:#fff;">GDRock</span><div style="color:#5b6a8a;font-size:12px;">GDPR Compliance</div></div>
    <h1 style="color:#fff;font-size:22px;text-align:center;margin:0 0 8px;">Your Compliance Score</h1>
    <p style="text-align:center;color:#9CA3AF;font-size:14px;margin:0 0 20px;">for ${domain}</p>
    <div style="text-align:center;font-size:48px;font-weight:800;color:${color};margin-bottom:8px;">${score}/100</div>
    <p style="color:#9CA3AF;font-size:14px;text-align:center;line-height:1.6;margin:0 0 24px;">${result.summary || ""}</p>
    <table style="width:100%;border-collapse:collapse;">${issues}</table>
    <div style="background:rgba(0,201,177,.08);border:1px solid rgba(0,201,177,.25);border-radius:12px;padding:18px;margin-top:24px;">
      <p style="color:#fff;font-size:15px;font-weight:700;margin:0 0 4px;text-align:center;">Stay compliant automatically — Care, €39/mo</p>
      <p style="color:#9CA3AF;font-size:13px;line-height:1.6;margin:0 0 14px;text-align:center;">GDPR rules change. Care is a hosted banner (one script tag) that <b style="color:#fff;">auto-updates when the law changes</b>, plus monthly compliance alerts and support. Fix it once, never worry again.</p>
      <div style="text-align:center;"><a href="https://www.gdrock.com/checkout.html?plan=care" style="display:inline-block;background:#00a896;color:#fff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:10px;">Get Care — €39/mo →</a></div>
    </div>
    <div style="text-align:center;margin-top:14px;">
      <a href="https://www.gdrock.com/checkout.html?plan=core" style="color:#9CA3AF;font-size:13px;text-decoration:underline;">Or just the DIY templates — Core Pack €29 one-time →</a>
    </div>
    <p style="color:#5b6a8a;font-size:12px;text-align:center;margin-top:20px;line-height:1.6;">Both include the 14-day money-back guarantee.<br>Questions? Just reply to this email.</p>
  </div>`;

  // 1) send report to the visitor
  await sendEmail(env, email, `Your GDPR compliance score for ${domain}: ${score}/100`, html).catch(() => {});
  // 2) notify the business owner
  if (env.MAIL_FROM) {
    await sendEmail(env, env.MAIL_FROM, `New scan lead: ${email} (${domain}) — ${score}/100`,
      `<p>New scanner lead.</p><p><b>Email:</b> ${email}<br><b>Site:</b> ${domain}<br><b>Score:</b> ${score}/100</p>`).catch(() => {});
  }
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "GDR-";
  for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
  c += "-";
  for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

async function supabaseUpsert(env, siteId, plan, active, code) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/sites`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ site_id: siteId, plan, active, access_code: code, config: {} }),
  }).catch(() => {});
}

async function supabasePatch(env, siteId, data) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(siteId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "return=minimal" },
    body: JSON.stringify(data),
  }).catch(() => {});
}

const SCAN_DISCLAIMER = "This report is generated automatically by an AI text analysis tool for informational purposes only. It does not constitute legal advice, a formal compliance audit, or a guarantee of regulatory immunity. Users should consult qualified legal counsel for actual GDPR compliance verification.";

// Fetch a site and extract clean visible text + privacy/terms links + trackers/CMPs
async function scrapeSite(url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; GDRockScanner/1.0; +https://gdrock.com)" }, cf: { cacheTtl: 60 }, redirect: "follow" });
    if (!r.ok) return { ok: false };
    const html = (await r.text()) || "";
    const low = html.toLowerCase();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z#0-9]+;/gi, " ")
      .replace(/\s+/g, " ").trim().slice(0, 6000);
    const links = new Set();
    const re = /<a[^>]+href="([^"]+)"[^>]*>([^<]*)</gi; let m;
    while ((m = re.exec(html)) && links.size < 20) {
      const blob = ((m[1] || "") + " " + (m[2] || "")).toLowerCase();
      if (/privacy|datenschutz|confidential|terms|agb|conditions|impressum|cookie|legal/.test(blob)) links.add((m[1] || "").slice(0, 140));
    }
    const trackers = [];
    const tsig = { "Google Analytics/GA4": /gtag\(|googletagmanager|google-analytics/, "Meta Pixel": /fbq\(|connect\.facebook\.net/, "Hotjar": /static\.hotjar|hotjar\.com/, "Microsoft Clarity": /clarity\.ms/, "TikTok Pixel": /analytics\.tiktok|tiktok[^"]*pixel/, "Google Ads": /googleadservices|googlesyndication/ };
    for (const [n, rx] of Object.entries(tsig)) if (rx.test(low)) trackers.push(n);
    const cmps = [];
    const csig = { Cookiebot: /cookiebot/, OneTrust: /onetrust|optanon/, Usercentrics: /usercentrics/, CookieYes: /cookieyes/, Iubenda: /iubenda/, Complianz: /complianz/, Borlabs: /borlabs/, Termly: /termly/, "GDRock": /gdrock\.js|data-site-id/ };
    for (const [n, rx] of Object.entries(csig)) if (rx.test(low)) cmps.push(n);
    return { ok: true, text, links: [...links].slice(0, 12), trackers, cmps, low };
  } catch (e) { return { ok: false }; }
}

// Build the objective analysis prompt from REAL scraped data
function buildScanPrompt(fullUrl, s) {
  const discoveredLinks = s.links.length ? s.links.join(", ") : "None found";
  const detectedCookies = ([...s.trackers, ...s.cmps.map(c => c + " (consent manager)")].join(", ")) || "None detected in page source";
  return `You are an automated website text analyzer specializing in identifying privacy policy indicators and data tracking disclosures.

Your task is to review the provided website metadata, visible page text, and cookie manifests to flag potential compliance risks. You are NOT providing legal advice or a definitive compliance audit; you are generating an informational risk report.

### INPUT DATA TO ANALYZE:
- Target URL: ${fullUrl}
- Scraped Homepage Text: ${s.text}
- Privacy/Terms Links Discovered: ${discoveredLinks}
- Active Cookies/Trackers Detected: ${detectedCookies}

### SCORING METHODOLOGY (0-100):
Base your score strictly on the evidence present in the input data. Do not assume backend processes exist unless explicitly documented in the scraped text (e.g., explicit mention of consent logging or specific payment processor DPAs like Paddle or Stripe).
- 90-100: Excellent visibility of explicit consent mechanisms, clear vendor callouts, robust retention schedules, and easily accessible policies.
- 70-89: Basic cookie banner and policies are present, but missing specific disclosures (e.g., explicit retention periods, explicit data processor lists, or clear withdrawal steps).
- 40-69: Major gaps, such as tracking cookies firing without an obvious banner, or missing a clear privacy policy link.
- Below 40: Critical risk or non-functional/placeholder site.

### STRICT CONSTRAINTS:
1. Treat ALL domains completely objectively based ONLY on the provided input data. Never hardcode, artificially inflate, or favor any specific domain or SaaS platform.
2. If the input data is empty, generic, or a placeholder, set "is_real_site" to false and stop.
3. Do not assume or hallucinate features that are not explicitly stated in the input text.

### OUTPUT FORMAT:
Respond ONLY with a valid JSON object. No markdown, no commentary.
{
  "score": <number 0-100>,
  "is_real_site": <boolean>,
  "site_description": "objective description of the business/site based on the text.",
  "summary": "2-sentence max overview of privacy indicators found or missing.",
  "legal_disclaimer": "This report is generated automatically by an AI text analysis tool for informational purposes only. It does not constitute legal advice, a formal compliance audit, or a guarantee of regulatory immunity. Users should consult qualified legal counsel for actual GDPR compliance verification.",
  "issues": [ { "severity": "critical|warning|good", "text": "Specific finding tied to the input data." } ]
}
Ensure "issues" contains between 5 and 8 highly specific points based directly on the provided input data.`;
}

// Call OpenAI (gpt-4o-mini, JSON mode) if keyed, else Anthropic. Returns parsed JSON.
async function llmScan(env, prompt) {
  if (env.OPENAI_API_KEY) {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.OPENAI_API_KEY },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" }, max_tokens: 900, temperature: 0.2 }),
    });
    const d = await r.json();
    return JSON.parse(d.choices?.[0]?.message?.content || "{}");
  }
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "x-api-key": env.ANTHROPIC_API_KEY },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 900, system: "Respond with valid JSON only, no markdown.", messages: [{ role: "user", content: prompt }] }),
  });
  const d = await r.json();
  const raw = d.content?.[0]?.text || "";
  const a = raw.indexOf("{"), b = raw.lastIndexOf("}");
  return JSON.parse(raw.slice(a, b + 1));
}

// Real signal-based fallback (no API key) — objective, varied, no favoritism
function signalScan(domain, s) {
  let score = 100; const issues = [];
  const hasPrivacy = s.links.some(l => /privacy|datenschutz|confidential/.test(l.toLowerCase())) || /privacy policy|datenschutz/.test(s.low);
  const hasTerms = s.links.some(l => /terms|agb|conditions|impressum/.test(l.toLowerCase())) || /\bterms\b|impressum/.test(s.low);
  const hasCMP = s.cmps.length > 0;
  const hasTrackers = s.trackers.length > 0;
  if (hasTrackers && !hasCMP) { score -= 35; issues.push({ severity: "critical", text: "Trackers detected (" + s.trackers.join(", ") + ") with no recognised consent platform in the page source - a common GDPR risk. Static analysis cannot confirm firing order, and some banners are geo-served or client-side rendered; verify in a real browser from an EU location." }); }
  else if (hasTrackers && hasCMP) { issues.push({ severity: "good", text: "Consent manager detected (" + s.cmps.join(", ") + ") alongside trackers. Note: a static scan cannot confirm the CMP actually blocks them before consent - only a real-browser timing check can." }); }
  else if (!hasTrackers) { issues.push({ severity: "good", text: "No third-party trackers detected in the homepage source." }); }
  if (!hasPrivacy) { score -= 25; issues.push({ severity: "critical", text: "No privacy policy link found on the homepage." }); }
  else issues.push({ severity: "good", text: "Privacy policy link is present." });
  if (!hasCMP && !hasTrackers) issues.push({ severity: "warning", text: "No recognised consent platform detected. If the site truly sets no non-essential cookies, none is legally required - but banners can be geo-served or client-side rendered, so verify in a real browser before relying on this." });
  if (!hasTerms) { score -= 10; issues.push({ severity: "warning", text: "No terms/legal page link found on the homepage." }); }
  else issues.push({ severity: "good", text: "Terms/legal page link is present." });
  issues.push({ severity: "warning", text: "Verify your privacy policy names every processor (payments, email, analytics) with retention periods per data category." });
  score = Math.max(15, Math.min(98, score));
  return { score, is_real_site: true, site_description: "Website at " + domain,
    summary: "Automated signal scan of the homepage source. " + (score >= 70 ? "Core privacy indicators are present." : "Several GDPR indicators appear to be missing."),
    legal_disclaimer: SCAN_DISCLAIMER, issues: issues.slice(0, 8) };
}

// Server-renders the GDPR privacy policy HTML from stored per-site config
function buildPolicyHtml(pc) {
  const dpa = DPA_MAP[pc.country] || { name: "your national Data Protection Authority", url: "https://www.edpb.europa.eu/about-edpb/about-edpb/members_en" };
  const websiteDisplay = (pc.website || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const website = pc.website ? (pc.website.startsWith("http") ? pc.website : "https://" + pc.website) : "https://" + websiteDisplay;
  const dpoLine = pc.dpo_name ? `<br>Data Protection Officer: ${pc.dpo_name}` : "";
  const transferText = "Where we use US-based processors (e.g. analytics, cloud services), data transfers outside the EEA are protected by Standard Contractual Clauses (SCCs) under Art. 46 GDPR.";
  const updated = pc.updated_date || new Date().toISOString().slice(0, 10);

  const css = `<style>.gdp-policy{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:760px;margin:0 auto;padding:24px 16px;color:#1a2033;line-height:1.65;font-size:15px}.gdp-h1{font-size:28px;font-weight:800;color:#0a1628;margin:0 0 8px}.gdp-h2{font-size:17px;font-weight:700;color:#0a1628;margin:28px 0 10px;padding-bottom:6px;border-bottom:1px solid #e8ecf4}.gdp-meta{color:#6b7a99;font-size:13px;margin:0 0 28px}.gdp-list{padding-left:22px;margin:8px 0 16px}.gdp-list li{margin-bottom:6px}.gdp-table{width:100%;border-collapse:collapse;margin:10px 0 16px;font-size:14px}.gdp-table th{background:#f0f4fa;padding:9px 12px;text-align:left;font-weight:600;border:1px solid #dde3ef;color:#0a1628}.gdp-table td{padding:8px 12px;border:1px solid #dde3ef;vertical-align:top}.gdp-table tr:nth-child(even) td{background:#f8fafd}.gdp-link{color:#3b82f6;text-decoration:none;font-weight:500}.gdp-link:hover{text-decoration:underline}.gdp-footer{margin-top:40px;padding-top:16px;border-top:1px solid #e8ecf4;font-size:12px;color:#9CA3AF;text-align:center}@media(max-width:600px){.gdp-table{font-size:12px}.gdp-h1{font-size:22px}}</style>`;

  return `${css}<div class="gdp-policy">
<h1 class="gdp-h1">Privacy Policy</h1>
<p class="gdp-meta">Last updated: ${updated} &nbsp;·&nbsp; <a href="${website}" class="gdp-link">${websiteDisplay}</a></p>

<h2 class="gdp-h2">1. Who We Are</h2>
<p><strong>${pc.company_name}</strong> ("we", "our") operates <a href="${website}" class="gdp-link">${websiteDisplay}</a> and is the data controller for personal data collected through it.</p>
<p>Contact: <a href="mailto:${pc.contact_email}" class="gdp-link">${pc.contact_email}</a>${dpoLine}</p>

<h2 class="gdp-h2">2. Data We Collect &amp; Why</h2>
<table class="gdp-table"><thead><tr><th>Category</th><th>Examples</th><th>Legal basis (GDPR)</th></tr></thead><tbody>
<tr><td>Contact &amp; account data</td><td>Name, email, phone</td><td>Consent or Contract — Art. 6(1)(a)/(b)</td></tr>
<tr><td>Payment data</td><td>Billing address; card details held by ${pc.payment_processor || "our payment processor"}</td><td>Contract — Art. 6(1)(b)</td></tr>
<tr><td>Usage &amp; analytics</td><td>Pages viewed, session duration, device type</td><td>Consent — Art. 6(1)(a)</td></tr>
<tr><td>Server logs</td><td>IP address, referrer, timestamps</td><td>Legitimate interest (security) — Art. 6(1)(f)</td></tr>
</tbody></table>

<h2 class="gdp-h2">3. Cookies</h2>
<p>We use a GDPR-compliant cookie banner. Non-essential cookies (analytics, marketing) are placed <strong>only after you click "Accept"</strong>. Withdraw or change consent at any time via the "Customize" option in the banner. We never sell data collected via cookies.</p>

<h2 class="gdp-h2">4. Who We Share Data With</h2>
<p>We share data only with processors bound by Data Processing Agreements (DPAs):</p>
<ul class="gdp-list">
<li><strong>Hosting &amp; CDN:</strong> ${pc.hosting_provider || "Cloudflare"}</li>
<li><strong>Payments:</strong> ${pc.payment_processor || "Paddle / Stripe"}</li>
<li><strong>Email delivery:</strong> ${pc.email_provider || "ZeptoMail / Zoho"}</li>
<li><strong>Analytics:</strong> ${pc.analytics_provider || "Google Analytics 4 (only with your consent)"}</li>
</ul>
<p>We do <strong>not sell</strong> your personal data.</p>

<h2 class="gdp-h2">5. International Transfers</h2>
<p>${transferText}</p>

<h2 class="gdp-h2">6. Retention Periods</h2>
<table class="gdp-table"><thead><tr><th>Data category</th><th>Retention</th></tr></thead><tbody>
<tr><td>Customer account data</td><td>${pc.retention_customer || "3 years"} after end of subscription</td></tr>
<tr><td>Contact enquiries</td><td>${pc.retention_contact || "1 year"}</td></tr>
<tr><td>Analytics data</td><td>${pc.retention_analytics || "26 months"}</td></tr>
<tr><td>Financial records</td><td>${pc.retention_financial || "7 years"} (legal obligation)</td></tr>
</tbody></table>

<h2 class="gdp-h2">7. Your Rights</h2>
<p>Under the GDPR you have the right to: <strong>access</strong> your data (Art. 15), <strong>rectification</strong> (Art. 16), <strong>erasure</strong> — "right to be forgotten" (Art. 17), <strong>restriction of processing</strong> (Art. 18), <strong>data portability</strong> (Art. 20), <strong>object</strong> to processing (Art. 21), and to <strong>withdraw consent</strong> at any time without affecting prior processing (Art. 7(3)).</p>
<p>To exercise any right, email <a href="mailto:${pc.contact_email}" class="gdp-link">${pc.contact_email}</a>. We respond within <strong>30 days</strong>. You may also lodge a complaint with <a href="${dpa.url}" class="gdp-link" target="_blank" rel="noopener">${dpa.name}</a>.</p>

<h2 class="gdp-h2">8. Changes to This Policy</h2>
<p>This policy is hosted and <strong>automatically kept up to date</strong> by <a href="https://gdrock.com" class="gdp-link" target="_blank" rel="noopener">GDRock</a>. When GDPR regulations change, this page updates without any action required from you.</p>

<div class="gdp-footer">Managed by <a href="https://gdrock.com" class="gdp-link" target="_blank" rel="noopener">GDRock</a> &nbsp;·&nbsp; GDPR Compliance</div>
</div>`;
}

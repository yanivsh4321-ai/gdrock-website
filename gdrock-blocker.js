/*!
 * GDRock Consent Blocker v2.0.0 — cdn.gdrock.com
 * ================================================
 * Holds or drops tracker traffic until the visitor consents, and sets Google
 * Consent Mode v2 defaults to denied.
 *
 * MUST be the FIRST script in <head> — before GTM/gtag, before any pixel
 * loader, before gdrock.js (the banner UI) — and must NOT be async or defer:
 *
 *   <script src="https://cdn.gdrock.com/gdrock-blocker.js" data-site-id="YOUR_ID"></script>
 *
 * What counts as a tracker
 *   The blocklist below is generated from the GDRock scanner's own tracker
 *   list (verify_consent.config.js) by verify_blocklist_sync.js, so the
 *   blocker covers every vendor the scanner reports, plus a few whole-host
 *   rules that are broader on purpose.
 *
 * What it does before consent, by kind of traffic
 *   HELD, then released after consent (safe to replay — they carry no data):
 *     - <script src>   created from JS (createElement/.src/setAttribute), in
 *                      the HTML (MutationObserver), or via document.write
 *     - <iframe src>   created from JS, via innerHTML, and in the HTML
 *     - <link href>    preload / prefetch / preconnect and any other <link>
 *                      pointing at a tracker
 *     - inline code the merchant tagged:
 *         <script type="text/plain" data-gdrock-category="analytics">…</script>
 *   DROPPED, never replayed (they describe a moment before consent; the
 *   released library sends its own fresh hits after consent):
 *     - image pixels   new Image().src, img.src, setAttribute, srcset,
 *                      <img> in innerHTML / insertAdjacentHTML / document.write,
 *                      <img> already in the HTML (src removed; see limits)
 *     - fetch()        resolves with an empty 204 response, never rejects
 *     - XMLHttpRequest not sent; fires "error" + "loadend" like a blocked request
 *     - sendBeacon()   not sent; returns true so libraries don't retry
 *   A blocked call never throws into page code.
 *
 * Categories: "analytics" | "marketing". "necessary" is always granted.
 *
 * Google Consent Mode v2
 *   Defaults ad_storage / analytics_storage / ad_user_data /
 *   ad_personalization to "denied" (wait_for_update: 500) and pushes an
 *   update per category when the visitor chooses.
 *
 * Advanced Consent Mode (opt-in):  data-gdrock-advanced="true"
 *   Google tags (gtag.js, GTM, Google Ads, GA) are NOT blocked. They load
 *   with the denied defaults above and send cookieless pings until consent.
 *   Google models conversions from those pings. Trade-off: requests DO reach
 *   Google before consent (no cookies, no ids, but the IP address), so
 *   "nothing reaches an outside server before consent" no longer holds for
 *   Google. Default is OFF (basic mode: Google tags are blocked like any
 *   other tracker, which is what the GDRock scan checks for).
 *
 * Shopify
 *   When window.Shopify is present, the visitor's choice is passed to
 *   Shopify's Customer Privacy API on page load and on every change:
 *     Shopify.loadFeatures([{name:"consent-tracking-api", version:"0.1"}])
 *     Shopify.customerPrivacy.setTrackingConsent({analytics, marketing,
 *       preferences, sale_of_data})
 *   Mapping: analytics->analytics, marketing->marketing,
 *   preferences->analytics, sale_of_data->marketing. Until the visitor
 *   chooses, all four are false. This is what reaches app pixels running in
 *   Shopify's sandbox (web-pixels-manager), which no theme script can touch.
 *
 * Outside fonts and embeds
 *   Fonts are never blocked (the page would break). Google Fonts, Adobe
 *   Fonts etc. are reported by GDRock.diagnostics() so they can be
 *   self-hosted. YouTube / Vimeo / Google Maps embeds can be swapped for a
 *   click-to-load placeholder with  data-gdrock-embeds="click"  (off by
 *   default); marketing consent loads them all.
 *
 * Install check
 *   window.GDRock.diagnostics() returns: whether this was the first script,
 *   which scripts ran before it, everything held/dropped by category,
 *   untagged inline tracker code it saw but could not stop, fonts, embeds,
 *   the Shopify Customer Privacy status, and a plain-English to-do list.
 *
 * Public API (unchanged from v1, used by the live gdrock.js banner):
 *   window.GDRock.consent.get() / .set({analytics, marketing}) / .onChange(fn)
 *   window.GDRock.consent() still returns the state (back-compat)
 *   shared localStorage key gdrock_consent_<siteId>, "gdrock:consent" event,
 *   merge-safe window.GDRock (a later `window.GDRock = {...}` merges in).
 *
 * Optional attributes on this <script> tag:
 *   data-site-id="X"               site id (storage key suffix; matches banner)
 *   data-gdrock-advanced="true"    Advanced Consent Mode (see above)
 *   data-gdrock-embeds="click"     click-to-load placeholders for embeds
 *
 * Known limitations — what this cannot do (base sales claims on this list)
 *   1. Anything that runs BEFORE this script. If the blocker is not the first
 *      script, or is loaded async/defer, earlier tags are not stopped.
 *      diagnostics().install shows what ran first.
 *   2. Tracker <script src>, <img src> and <iframe src> written directly in
 *      the HTML can be fetched once by the browser's preloader before any
 *      JavaScript runs. Scripts are then never executed and iframes are
 *      blanked, but that first request can still reach the server. Only
 *      tagging the tag type="text/plain" (or data-gdrock-src) prevents it.
 *   3. Inline tracker code that is not tagged type="text/plain" has already
 *      run by the time any script can look. Its network calls are still
 *      checked, but code it runs locally (e.g. writing a first-party cookie
 *      such as _fbp from a stub) is not stopped. diagnostics() lists it.
 *   4. Other windows: iframes and workers have their own fetch/Image. Tracker
 *      code running inside a same-origin iframe, a Web Worker, a service
 *      worker, or Shopify's app-pixel sandbox is not intercepted. On Shopify
 *      the Customer Privacy API covers app pixels; elsewhere it doesn't.
 *   5. Shopify app pixels obey Shopify's consent state, and Shopify applies
 *      its own default per region (Settings > Customer privacy). If the store
 *      does not require consent for a region, an app pixel can fire before
 *      the blocker's first update lands. Set the store to require consent.
 *   6. Server-side tracking (Meta Conversions API, server-side GTM, a
 *      tracker proxied through the shop's own domain under an unknown path)
 *      never passes through the browser and cannot be blocked here.
 *   7. Not intercepted: CSS url() pixels, WebSocket, EventSource, <a ping>,
 *      <video>/<audio> sources, DOMParser/importNode, Attr.value and
 *      setAttributeNS writes, and HTTP Link: preload headers.
 *   8. Fonts are reported, not blocked. Embeds are only held when
 *      data-gdrock-embeds="click" is set; embeds built from HTML strings
 *      (innerHTML) are not swapped for a placeholder.
 *   9. Revoking consent updates Consent Mode, storage and Shopify, but cannot
 *      unload a tracker that is already running; a page reload is needed.
 *  10. A tracker is only blocked if its URL matches the list. A new vendor, or
 *      a known vendor on a new host, gets through until the list is updated.
 */
(function (window, document) {
  "use strict";
  if (window.__gdrockBlocker) return;
  var VERSION = "2.0.0";
  window.__gdrockBlocker = { version: VERSION };
  var T0 = new Date().getTime();

  // ---------- config -------------------------------------------------------
  var me = document.currentScript;
  var SITE_ID =
    (me && me.getAttribute("data-site-id")) ||
    (window.GDRockConfig && window.GDRockConfig.siteId) ||
    "";
  if (!SITE_ID) {
    var idTag = document.querySelector("script[data-site-id]");
    if (idTag) SITE_ID = idTag.getAttribute("data-site-id") || "";
  }
  // Same key as gdrock.js so banner + engine share one consent record.
  var STORAGE_KEY = "gdrock_consent_" + (SITE_ID || "default");
  var ADVANCED = !!(me && me.getAttribute("data-gdrock-advanced") === "true");
  var EMBEDS_CLICK = !!(me && me.getAttribute("data-gdrock-embeds") === "click");

  // ---------- blocklist (generated) ----------------------------------------
  // <generated-blocklist source="verify_consent.config.js">
  // Written by verify_blocklist_sync.js — edit verify_consent.config.js, not this block.
  // [urlSubstring, category, isGoogleTag, vendor]
  var BLOCKLIST = [
    ["google.com/pagead/1p-user-list","marketing",true,"Google Ads / DoubleClick"],
    ["google.de/pagead/1p-user-list","marketing",true,"Google Ads / DoubleClick"],
    ["google.com/pagead/1p-conversion","marketing",true,"Google Ads / DoubleClick"],
    ["google.com/ccm/collect","marketing",true,"Google Ads / DoubleClick"],
    ["facebook.com/tr","marketing",false,"Meta Pixel"],
    ["facebook.com/privacy_sandbox/pixel","marketing",false,"Meta Pixel"],
    ["tr-shadow.snapchat.com/","marketing",false,"Snapchat Pixel"],
    ["t.co/i/adsct","marketing",false,"X (Twitter) Pixel"],
    ["ads-twitter.com/i/adsct","marketing",false,"X (Twitter) Pixel"],
    ["a.klaviyo.com/client/events","marketing",false,"Klaviyo onsite tracking"],
    ["a.klaviyo.com/api/track","marketing",false,"Klaviyo onsite tracking"],
    ["s.amazon-adsystem.com/","marketing",false,"Amazon Ads"],
    ["aax.amazon-adsystem.com/","marketing",false,"Amazon Ads"],
    ["alb.reddit.com/","marketing",false,"Reddit Pixel"],
    ["mc.yandex.ru/watch","analytics",false,"Yandex Metrica"],
    ["mc.yandex.com/watch","analytics",false,"Yandex Metrica"],
    ["mc.yandex.ru/webvisor","analytics",false,"Yandex Metrica"],
    ["mc.yandex.com/webvisor","analytics",false,"Yandex Metrica"],
    ["q.quora.com/","marketing",false,"Quora Pixel"],
    ["d.adroll.com/","marketing",false,"AdRoll"],
    ["static-tracking.klaviyo.com/","marketing",false,"Klaviyo onsite"],
    ["c.amazon-adsystem.com/","marketing",false,"Amazon Ads"],
    ["redditstatic.com/ads/","marketing",false,"Reddit Pixel"],
    ["mc.yandex.ru/metrika/","analytics",false,"Yandex Metrica"],
    ["mc.yandex.com/metrika/","analytics",false,"Yandex Metrica"],
    ["a.quora.com/qevents.js","marketing",false,"Quora Pixel"],
    ["s.adroll.com/","marketing",false,"AdRoll"],
    ["dwin1.com/","marketing",false,"Awin"],
    ["googletagmanager.com","analytics",true,"Google Tag Manager"],
    ["google-analytics.com","analytics",true,"Google Analytics"],
    ["analytics.google.com","analytics",true,"Google Analytics"],
    ["doubleclick.net","marketing",true,"Google Ads / DoubleClick"],
    ["googleadservices.com","marketing",true,"Google Ads"],
    ["googlesyndication.com","marketing",true,"Google Ads"],
    ["hotjar.com","analytics",false,"Hotjar"],
    ["hotjar.io","analytics",false,"Hotjar"],
    ["clarity.ms","analytics",false,"Microsoft Clarity"],
    ["mouseflow.com","analytics",false,"Mouseflow"],
    ["fullstory.com","analytics",false,"FullStory"],
    ["connect.facebook.net","marketing",false,"Meta Pixel"],
    ["analytics.tiktok.com","marketing",false,"TikTok Pixel"],
    ["analytics-sg.tiktok.com","marketing",false,"TikTok Pixel"],
    ["static.klaviyo.com","marketing",false,"Klaviyo"],
    ["klaviyo.com/onsite","marketing",false,"Klaviyo"],
    ["px.ads.linkedin.com","marketing",false,"LinkedIn Insight Tag"],
    ["snap.licdn.com","marketing",false,"LinkedIn Insight Tag"],
    ["ct.pinterest.com","marketing",false,"Pinterest Tag"],
    ["s.pinimg.com/ct","marketing",false,"Pinterest Tag"],
    ["sc-static.net","marketing",false,"Snapchat Pixel"],
    ["tr.snapchat.com","marketing",false,"Snapchat Pixel"],
    ["static.ads-twitter.com","marketing",false,"X (Twitter) Pixel"],
    ["analytics.twitter.com","marketing",false,"X (Twitter) Pixel"],
    ["criteo.com","marketing",false,"Criteo"],
    ["criteo.net","marketing",false,"Criteo"],
    ["bat.bing.com","marketing",false,"Microsoft Ads (UET)"],
    ["taboola.com","marketing",false,"Taboola"],
    ["outbrain.com","marketing",false,"Outbrain"]
  ];
  // Tracking sent through the site's own server: [pathRegex, queryRegex, category, isGoogleTag, vendor]
  var FIRST_PARTY_BEACONS = [["\\/g\\/collect$","(^|&)tid=G-","analytics",true,"Google Analytics 4 (via the site's own server)"]];
  // Reported, never blocked (blocking a font breaks the page): [provider, substrings]
  var FONT_PROVIDERS = [["Google Fonts",["fonts.googleapis.com/","fonts.gstatic.com/"]],["Adobe Fonts",["use.typekit.net/","p.typekit.net/"]]];
  // Click-to-load candidates when data-gdrock-embeds="click": [provider, owner, thing, substrings]
  var EMBED_PROVIDERS = [["YouTube","Google","video player",["youtube.com/embed","youtube.com/iframe_api","youtube.com/s/player","youtube-nocookie.com/","ytimg.com/","googlevideo.com/"]],["Vimeo","Vimeo","video player",["player.vimeo.com/","vimeocdn.com/"]],["Google Maps","Google","map",["maps.googleapis.com/","maps.gstatic.com/","google.com/maps/embed","google.com/maps/api","google.de/maps/embed"]]];
  // Inline tracker code the engine can see but not stop: [regexSource, vendor]
  var INLINE_SIGNATURES = [["fbq\\(\\s*['\"]init","Meta Pixel"],["gtag\\(\\s*['\"]config","Google tag"],["googletagmanager\\.com\\/gtm\\.js|['\"]gtm\\.start['\"]","Google Tag Manager"],["ttq\\.(?:load|page)\\(","TikTok Pixel"],["_hjSettings|static\\.hotjar\\.com","Hotjar"],["clarity\\.ms\\/tag|\\bclarity\\(\\s*['\"]","Microsoft Clarity"],["pintrk\\(","Pinterest Tag"],["snaptr\\(","Snapchat Pixel"],["\\btwq\\(","X (Twitter) Pixel"],["_linkedin_partner_id","LinkedIn Insight Tag"],["\\buetq\\b","Microsoft Ads (UET)"],["static\\.klaviyo\\.com|_learnq","Klaviyo"],["\\bym\\(\\s*\\d+","Yandex Metrica"],["\\brdt\\(","Reddit Pixel"]];
  // </generated-blocklist>

  // ---------- matching -----------------------------------------------------
  function toUrl(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (v.url) return String(v.url); // Request
    return String(v);                // URL object or anything stringable
  }

  // -> {category, vendor} or null. Substring match, like the scanner.
  function blockedRule(value) {
    var url = toUrl(value);
    if (!url) return null;
    var u = url.toLowerCase(), i;
    for (i = 0; i < BLOCKLIST.length; i++) {
      if (u.indexOf(BLOCKLIST[i][0]) !== -1) {
        if (ADVANCED && BLOCKLIST[i][2]) return null; // Consent Mode governs Google
        return granted(BLOCKLIST[i][1]) ? null : { category: BLOCKLIST[i][1], vendor: BLOCKLIST[i][3] };
      }
    }
    if (u.indexOf("collect") !== -1) {
      var q = url.indexOf("?");
      var pathPart = (q === -1 ? url : url.slice(0, q)).replace(/^[a-z][a-z0-9+.\-]*:\/\/[^\/]*/i, "");
      var query = q === -1 ? "" : url.slice(q + 1);
      for (i = 0; i < FIRST_PARTY_BEACONS.length; i++) {
        var fp = FIRST_PARTY_BEACONS[i];
        if (new RegExp(fp[0], "i").test(pathPart) && new RegExp(fp[1], "i").test(query)) {
          if (ADVANCED && fp[3]) return null;
          return granted(fp[2]) ? null : { category: fp[2], vendor: fp[4] };
        }
      }
    }
    return null;
  }

  function providerOf(list, value) {
    var u = toUrl(value).toLowerCase();
    if (!u) return null;
    for (var i = 0; i < list.length; i++) {
      var pats = list[i][list[i].length - 1];
      for (var j = 0; j < pats.length; j++) if (u.indexOf(pats[j]) !== -1) return list[i];
    }
    return null;
  }

  function srcsetRule(srcset) {
    var parts = String(srcset || "").split(",");
    for (var i = 0; i < parts.length; i++) {
      var r = blockedRule(parts[i].replace(/^\s+/, "").split(/\s+/)[0]);
      if (r) return r;
    }
    return null;
  }

  // ---------- activity log (feeds diagnostics) -----------------------------
  var log = [];
  function record(type, url, rule, action, via) {
    var e = { type: type, url: toUrl(url).slice(0, 300), category: rule.category, vendor: rule.vendor,
      action: action, via: via || "js", ms: new Date().getTime() - T0 };
    if (log.length < 500) log.push(e);
    return e;
  }

  function fire(target, type) {
    try {
      var e;
      if (typeof Event === "function") e = new Event(type);
      else { e = document.createEvent("Event"); e.initEvent(type, false, false); }
      target.dispatchEvent(e);
    } catch (x) {}
  }
  function later(fn) { setTimeout(fn, 0); }

  // ---------- install check: what ran before this script -------------------
  var CODE_TYPES = /^(|text\/javascript|application\/javascript|module|text\/ecmascript|application\/ecmascript)$/i;
  function describeScript(s) {
    var src = s.getAttribute("src");
    var d = { src: src || null, inline: src ? null : String(s.text || "").replace(/\s+/g, " ").slice(0, 100), tracker: null };
    var r = src ? blockedRuleIgnoringConsent(src) : null;
    if (r) d.tracker = r.vendor;
    return d;
  }
  function blockedRuleIgnoringConsent(url) {
    var u = toUrl(url).toLowerCase();
    for (var i = 0; i < BLOCKLIST.length; i++) if (u.indexOf(BLOCKLIST[i][0]) !== -1) return { category: BLOCKLIST[i][1], vendor: BLOCKLIST[i][3] };
    return null;
  }
  var ranBefore = [];
  (function () {
    if (!me) return;
    var all = document.getElementsByTagName("script");
    for (var i = 0; i < all.length && all[i] !== me; i++) {
      if (CODE_TYPES.test(all[i].getAttribute("type") || "")) ranBefore.push(describeScript(all[i]));
    }
  })();
  var install = {
    firstScript: !!me && ranBefore.length === 0 && !me.async && !me.defer,
    foundOwnTag: !!me,
    async: !!(me && (me.async || me.defer)),
    ranBefore: ranBefore
  };

  // ---------- consent state ------------------------------------------------
  function loadStored() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }
  var state = loadStored(); // {analytics, marketing, accepted, timestamp} | null

  function granted(cat) {
    if (cat === "necessary") return true;
    return !!(state && state[cat]);
  }

  // ---------- Google Consent Mode v2 ---------------------------------------
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (typeof window.gtag !== "function") window.gtag = gtag;

  gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500
  });
  gtag("set", "ads_data_redaction", true);

  function pushConsentUpdate(c) {
    gtag("consent", "update", {
      analytics_storage: c.analytics ? "granted" : "denied",
      ad_storage: c.marketing ? "granted" : "denied",
      ad_user_data: c.marketing ? "granted" : "denied",
      ad_personalization: c.marketing ? "granted" : "denied"
    });
    gtag("set", "ads_data_redaction", !c.marketing);
  }
  if (state) pushConsentUpdate(state); // returning visitor: restore immediately

  // ---------- natives ------------------------------------------------------
  var origCreateElement = Document.prototype.createElement;
  var origSetAttribute = Element.prototype.setAttribute;
  var origRemoveAttribute = Element.prototype.removeAttribute;
  function desc(proto, prop) { try { return proto && Object.getOwnPropertyDescriptor(proto, prop); } catch (e) { return null; } }
  var nativeScriptSrc = desc(window.HTMLScriptElement && HTMLScriptElement.prototype, "src");
  var nativeIframeSrc = desc(window.HTMLIFrameElement && HTMLIFrameElement.prototype, "src");
  var nativeLinkHref = desc(window.HTMLLinkElement && HTMLLinkElement.prototype, "href");
  var nativeImgSrc = desc(window.HTMLImageElement && HTMLImageElement.prototype, "src");
  var nativeImgSrcset = desc(window.HTMLImageElement && HTMLImageElement.prototype, "srcset");
  function setNative(d, el, attr, v) { if (d && d.set) d.set.call(el, v); else origSetAttribute.call(el, attr, v); }

  // ---------- held registry ------------------------------------------------
  var held = []; // {kind, el, src, text, category, entry, placeholder}

  function markHeld(el, url, cat, attr) {
    origSetAttribute.call(el, "data-gdrock-held", "1");
    if (url) origSetAttribute.call(el, attr || "data-gdrock-src", url);
    origSetAttribute.call(el, "data-gdrock-category", cat);
  }
  function holdScript(el, url, rule, via) {
    origSetAttribute.call(el, "type", "text/plain");
    markHeld(el, url, rule.category);
    held.push({ kind: "script", el: el, src: url || null, text: null, category: rule.category, entry: record("script", url, rule, "held", via) });
  }
  function holdIframe(el, url, rule, via) {
    markHeld(el, url, rule.category);
    held.push({ kind: "iframe", el: el, src: url, category: rule.category, entry: record("iframe", url, rule, "held", via) });
  }
  function holdLink(el, url, rule, via) {
    markHeld(el, url, rule.category, "data-gdrock-href");
    held.push({ kind: "link", el: el, src: url, category: rule.category, entry: record("link", url, rule, "held", via) });
  }
  function dropImg(el, url, rule, via) {
    record("img", url, rule, "dropped", via);
    origSetAttribute.call(el, "data-gdrock-blocked-src", toUrl(url).slice(0, 300));
    later(function () { fire(el, "error"); });
  }

  function clearMarks(el) {
    origRemoveAttribute.call(el, "data-gdrock-held");
    origRemoveAttribute.call(el, "data-gdrock-src");
    origRemoveAttribute.call(el, "data-gdrock-href");
    origRemoveAttribute.call(el, "data-gdrock-category");
    origRemoveAttribute.call(el, "data-gdrock-embed");
  }

  function activate(h) {
    var el = h.el;
    if (h.entry) h.entry.action = h.kind === "embed" && h.clicked ? "loaded by click" : "released";
    if (h.kind === "script") {
      if (el.parentNode) {
        // Connected placeholder: swap in a fresh, executable script in place
        // (changing type back on the same node does not re-trigger execution).
        var s = origCreateElement.call(document, "script");
        for (var i = 0; i < el.attributes.length; i++) {
          var a = el.attributes[i];
          if (a.name === "type" || a.name === "src" || a.name.indexOf("data-gdrock-") === 0) continue;
          origSetAttribute.call(s, a.name, a.value);
        }
        if (h.src) {
          // Preserve execution order among released scripts unless the
          // original opted into async.
          s.async = el.hasAttribute("async");
          setNative(nativeScriptSrc, s, "src", h.src);
        } else if (h.text != null) {
          s.text = h.text;
        }
        el.parentNode.insertBefore(s, el);
        el.parentNode.removeChild(el);
      } else if (h.src) {
        // Created but never inserted by the site: restore quietly so it runs
        // IF the site inserts it later — never self-insert on its behalf.
        origRemoveAttribute.call(el, "type");
        clearMarks(el);
        setNative(nativeScriptSrc, el, "src", h.src);
      }
    } else if (h.kind === "iframe" || h.kind === "embed") {
      clearMarks(el);
      // Re-inserting the iframe wakes the observer; this mark keeps it from
      // holding an embed the visitor just chose to load.
      origSetAttribute.call(el, "data-gdrock-loaded", "1");
      if (h.placeholder && h.placeholder.parentNode) {
        h.placeholder.parentNode.insertBefore(el, h.placeholder);
        h.placeholder.parentNode.removeChild(h.placeholder);
      }
      setNative(nativeIframeSrc, el, "src", h.src);
    } else if (h.kind === "link") {
      clearMarks(el);
      setNative(nativeLinkHref, el, "href", h.src);
    }
  }

  function release() {
    var remaining = [];
    for (var i = 0; i < held.length; i++) {
      if (granted(held[i].category)) activate(held[i]);
      else remaining.push(held[i]);
    }
    held = remaining;
  }

  // ---------- click-to-load embeds (opt-in) --------------------------------
  function embedFor(url) { return EMBEDS_CLICK && !granted("marketing") ? providerOf(EMBED_PROVIDERS, url) : null; }

  function holdEmbed(el, url, prov, via) {
    markHeld(el, url, "marketing");
    origSetAttribute.call(el, "data-gdrock-embed", prov[0]);
    var rec = { kind: "embed", el: el, src: url, category: "marketing", provider: prov,
      entry: record("embed", url, { category: "marketing", vendor: prov[0] }, "held", via) };
    held.push(rec);
    if (el.parentNode) swapInPlaceholder(rec);
    return rec;
  }

  function swapInPlaceholder(rec) {
    var el = rec.el, prov = rec.provider;
    if (rec.placeholder || !el.parentNode) return;
    var w = el.getAttribute("width"), h = el.getAttribute("height");
    var box = origCreateElement.call(document, "div");
    origSetAttribute.call(box, "class", "gdrock-embed-placeholder");
    origSetAttribute.call(box, "role", "region");
    origSetAttribute.call(box, "aria-label", prov[0] + " " + prov[2] + " not loaded");
    box.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;box-sizing:border-box;" +
      "max-width:100%;padding:20px;border-radius:8px;background:#111418;color:#e8eaee;text-align:center;" +
      "font:14px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;" +
      "width:" + (w ? (/^\d+$/.test(w) ? w + "px" : w) : "100%") + ";height:" + (h ? (/^\d+$/.test(h) ? h + "px" : h) : "315px") + ";";
    var p = origCreateElement.call(document, "p");
    p.style.cssText = "margin:0;max-width:44ch;";
    p.textContent = "This " + prov[2] + " is hosted by " + prov[1] + " (" + prov[0] + "). Loading it lets " + prov[1] + " set cookies and see your IP address.";
    var b = origCreateElement.call(document, "button");
    origSetAttribute.call(b, "type", "button");
    b.style.cssText = "border:0;border-radius:6px;padding:10px 18px;background:#fff;color:#111418;font:600 14px/1 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;cursor:pointer;";
    b.textContent = "Load " + prov[2];
    b.addEventListener("click", function () {
      var i = held.indexOf(rec);
      if (i !== -1) held.splice(i, 1);
      rec.clicked = true;
      activate(rec);
    });
    box.appendChild(p);
    box.appendChild(b);
    el.parentNode.insertBefore(box, el);
    el.parentNode.removeChild(el);
    rec.placeholder = box;
  }

  // ---------- interception: element properties -----------------------------
  // Prototype-level accessors cover createElement, new Image(), cloneNode and
  // anything else that ends in a property write.
  function wrapProp(proto, prop, nd, heldAttr, onSet) {
    if (!proto || !nd || !nd.set || !nd.configurable) return;
    try {
      Object.defineProperty(proto, prop, {
        configurable: true,
        enumerable: nd.enumerable,
        get: function () {
          if (heldAttr) { var v = this.getAttribute(heldAttr); if (v != null && this.getAttribute("data-gdrock-held")) return v; }
          return nd.get.call(this);
        },
        set: function (v) { if (onSet(this, v) !== true) nd.set.call(this, v); }
      });
    } catch (e) { /* locked-down environment: setAttribute + observer paths still cover */ }
  }

  function onScriptSrc(el, v) { var r = blockedRule(v); if (r) { holdScript(el, toUrl(v), r, "js"); return true; } }
  function onIframeSrc(el, v) {
    var r = blockedRule(v);
    if (r) { holdIframe(el, toUrl(v), r, "js"); return true; }
    var prov = embedFor(v);
    if (prov) { holdEmbed(el, toUrl(v), prov, "js"); return true; }
  }
  function onLinkHref(el, v) { var r = blockedRule(v); if (r) { holdLink(el, toUrl(v), r, "js"); return true; } }
  function onImgSrc(el, v) { var r = blockedRule(v); if (r) { dropImg(el, v, r, "js"); return true; } }
  function onImgSrcset(el, v) { var r = srcsetRule(v); if (r) { dropImg(el, v, r, "js"); return true; } }

  wrapProp(window.HTMLScriptElement && HTMLScriptElement.prototype, "src", nativeScriptSrc, "data-gdrock-src", onScriptSrc);
  wrapProp(window.HTMLIFrameElement && HTMLIFrameElement.prototype, "src", nativeIframeSrc, "data-gdrock-src", onIframeSrc);
  wrapProp(window.HTMLLinkElement && HTMLLinkElement.prototype, "href", nativeLinkHref, "data-gdrock-href", onLinkHref);
  wrapProp(window.HTMLImageElement && HTMLImageElement.prototype, "src", nativeImgSrc, null, onImgSrc);
  wrapProp(window.HTMLImageElement && HTMLImageElement.prototype, "srcset", nativeImgSrcset, null, onImgSrcset);

  Element.prototype.setAttribute = function (name, value) {
    var n = String(name).toLowerCase(), tag = this.nodeName;
    if (n === "src" || n === "href" || n === "srcset") {
      if (tag === "SCRIPT" && n === "src" && onScriptSrc(this, value)) return;
      if (tag === "IFRAME" && n === "src" && onIframeSrc(this, value)) return;
      if (tag === "LINK" && n === "href" && onLinkHref(this, value)) return;
      if ((tag === "IMG" || tag === "SOURCE") && n === "src" && onImgSrc(this, value)) return;
      if ((tag === "IMG" || tag === "SOURCE") && n === "srcset" && onImgSrcset(this, value)) return;
    }
    return origSetAttribute.apply(this, arguments);
  };

  // ---------- interception: network APIs -----------------------------------
  // Beacons are dropped, not queued: they describe a page view that happened
  // before consent, and the released library sends its own after consent.
  if (typeof window.fetch === "function") {
    var nativeFetch = window.fetch;
    window.fetch = function (input, init) {
      var r = blockedRule(input);
      if (r) {
        record("fetch", input, r, "dropped");
        // An empty 204 rather than a rejection: fire-and-forget code must not
        // surface an "Uncaught (in promise)" error.
        try { return Promise.resolve(new Response(null, { status: 204, statusText: "No Content" })); }
        catch (e) { return new Promise(function () {}); }
      }
      return nativeFetch.apply(this, arguments);
    };
  }

  if (window.XMLHttpRequest) {
    var XP = XMLHttpRequest.prototype, nativeOpen = XP.open, nativeSend = XP.send;
    XP.open = function (method, url) {
      var r = blockedRule(url);
      this.__gdrockBlocked = r ? { url: toUrl(url), rule: r } : null;
      return nativeOpen.apply(this, arguments);
    };
    XP.send = function () {
      var b = this.__gdrockBlocked;
      if (b) {
        var xhr = this;
        record("xhr", b.url, b.rule, "dropped");
        later(function () { fire(xhr, "error"); fire(xhr, "loadend"); });
        return;
      }
      return nativeSend.apply(this, arguments);
    };
  }

  if (window.navigator && typeof navigator.sendBeacon === "function") {
    var nativeBeacon = navigator.sendBeacon;
    try {
      navigator.sendBeacon = function (url) {
        var r = blockedRule(url);
        if (r) { record("beacon", url, r, "dropped"); return true; }
        return nativeBeacon.apply(navigator, arguments);
      };
    } catch (e) {}
  }

  // ---------- interception: HTML strings -----------------------------------
  // innerHTML / outerHTML / insertAdjacentHTML / document.write can carry a
  // pixel or iframe that starts loading the moment the string is parsed, so
  // the tracker attribute is renamed before the browser ever sees it.
  var TAG_RE = /<(script|img|iframe|link|source)\b([^>]*)>/gi;
  var ATTR_RE = /\s(src|href|srcset)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/i;
  function anyRuleIn(low) {
    for (var i = 0; i < BLOCKLIST.length; i++) if (low.indexOf(BLOCKLIST[i][0]) !== -1) return true;
    return low.indexOf("collect") !== -1;
  }
  function rewriteHTML(html, forWrite) {
    if (typeof html !== "string" || html.indexOf("<") === -1 || !anyRuleIn(html.toLowerCase())) return html;
    return html.replace(TAG_RE, function (tag, name, attrs) {
      var n = name.toLowerCase();
      if (n === "script" && !forWrite) return tag; // innerHTML scripts never run or load
      var am = ATTR_RE.exec(attrs);
      if (!am) return tag;
      var url = am[3] != null ? am[3] : (am[4] != null ? am[4] : am[5]);
      var r = am[1].toLowerCase() === "srcset" ? srcsetRule(url) : blockedRule(url);
      if (!r) return tag;
      var q = am[2].charAt(0) === "'" ? "'" : "\"";
      var val = url.replace(/"/g, "&quot;");
      var rest = attrs.replace(am[0], "");
      var marks = " data-gdrock-category=\"" + r.category + "\"";
      if (n === "img" || n === "source") {
        record("img", url, r, "dropped", "html-string");
        return "<" + name + marks + " data-gdrock-blocked-src=" + q + val + q + rest + ">";
      }
      var attr = n === "link" ? "data-gdrock-href" : "data-gdrock-src";
      // Our type comes first: with duplicate attributes, the first one wins.
      return "<" + name + (n === "script" ? " type=\"text/plain\"" : "") + marks + " " + attr + "=" + q + val + q + rest + ">";
    });
  }
  var SKIP_REWRITE = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1 };
  function wrapHTMLProp(prop) {
    var d = desc(Element.prototype, prop);
    if (!d || !d.set || !d.configurable) return;
    try {
      Object.defineProperty(Element.prototype, prop, {
        configurable: true, enumerable: d.enumerable,
        get: function () { return d.get.call(this); },
        set: function (v) { d.set.call(this, SKIP_REWRITE[this.nodeName] ? v : rewriteHTML(v, false)); }
      });
    } catch (e) {}
  }
  wrapHTMLProp("innerHTML");
  wrapHTMLProp("outerHTML");
  var nativeIAH = Element.prototype.insertAdjacentHTML;
  if (nativeIAH) Element.prototype.insertAdjacentHTML = function (pos, html) { return nativeIAH.call(this, pos, rewriteHTML(html, false)); };
  function wrapWrite(name) {
    var nw = document[name];
    if (typeof nw !== "function") return;
    document[name] = function () {
      var args = [];
      for (var i = 0; i < arguments.length; i++) args.push(rewriteHTML(String(arguments[i]), true));
      return nw.apply(document, args);
    };
  }
  wrapWrite("write");
  wrapWrite("writeln");

  // ---------- interception: parser-inserted / subtree-inserted -------------
  function inspectScript(node) {
    if (node.getAttribute("data-gdrock-held")) return;
    var type = (node.getAttribute("type") || "").toLowerCase();
    if (type === "text/plain") { registerTagged(node); return; }
    var url = node.getAttribute("src");
    var r = blockedRule(url);
    if (!r) return;
    // External scripts only: their fetch leaves a gap the observer wins.
    // Neutralize before evaluation and leave an inert placeholder in place.
    origSetAttribute.call(node, "type", "text/plain");
    var ph = origCreateElement.call(document, "script");
    for (var i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i];
      if (a.name === "src" || a.name === "type") continue;
      origSetAttribute.call(ph, a.name, a.value);
    }
    holdScript(ph, url, r, "html");
    if (node.parentNode) {
      node.parentNode.insertBefore(ph, node);
      node.parentNode.removeChild(node);
    }
  }

  function inspectIframe(node) {
    if (node.getAttribute("data-gdrock-loaded")) return;
    if (node.getAttribute("data-gdrock-held")) {
      // Held from JS before it was inserted: an embed now gets its placeholder.
      for (var k = 0; k < held.length; k++) if (held[k].el === node && held[k].kind === "embed") swapInPlaceholder(held[k]);
      return;
    }
    var tagged = node.getAttribute("data-gdrock-src");
    if (tagged) { // merchant-tagged or rewritten from an HTML string: never loaded
      var cat = node.getAttribute("data-gdrock-category") === "analytics" ? "analytics" : "marketing";
      var prov = providerOf(EMBED_PROVIDERS, tagged);
      if (granted(cat)) { setNative(nativeIframeSrc, node, "src", tagged); clearMarks(node); return; }
      if (EMBEDS_CLICK && prov && !blockedRuleIgnoringConsent(tagged)) { holdEmbed(node, tagged, prov, "html"); return; }
      holdIframe(node, tagged, { category: cat, vendor: (blockedRuleIgnoringConsent(tagged) || {}).vendor || "tagged iframe" }, "html");
      return;
    }
    var url = node.getAttribute("src");
    if (!url) return;
    var r = blockedRule(url);
    if (r) { origRemoveAttribute.call(node, "src"); holdIframe(node, url, r, "html"); return; }
    var p = embedFor(url);
    if (p) { origRemoveAttribute.call(node, "src"); holdEmbed(node, url, p, "html"); }
  }

  function inspectLink(node) {
    if (node.getAttribute("data-gdrock-held")) return;
    var tagged = node.getAttribute("data-gdrock-href");
    if (tagged) {
      var cat = node.getAttribute("data-gdrock-category") === "analytics" ? "analytics" : "marketing";
      if (granted(cat)) { setNative(nativeLinkHref, node, "href", tagged); clearMarks(node); }
      else holdLink(node, tagged, { category: cat, vendor: (blockedRuleIgnoringConsent(tagged) || {}).vendor || "tagged link" }, "html");
      return;
    }
    var url = node.getAttribute("href");
    var r = blockedRule(url);
    if (r) { origRemoveAttribute.call(node, "href"); holdLink(node, url, r, "html"); }
  }

  function inspectImg(node) {
    if (node.getAttribute("data-gdrock-blocked-src")) return;
    var url = node.getAttribute("src"), r = blockedRule(url);
    if (!r) { url = node.getAttribute("srcset"); r = url ? srcsetRule(url) : null; }
    if (!r) return;
    // Already parsed with its src: the request may have left before any
    // script could act. Removing src stops the load where it hasn't.
    origRemoveAttribute.call(node, "src");
    origRemoveAttribute.call(node, "srcset");
    dropImg(node, url, r, "html");
  }

  function inspectOne(node) {
    switch (node.nodeName) {
      case "SCRIPT": inspectScript(node); break;
      case "IFRAME": inspectIframe(node); break;
      case "LINK": inspectLink(node); break;
      case "IMG": case "SOURCE": inspectImg(node); break;
    }
  }
  function inspectNode(node) {
    if (!node || node.nodeType !== 1) return;
    inspectOne(node);
    // Subtrees: a container appended in one go carries its children with it.
    if (node.firstElementChild && node.querySelectorAll) {
      var list = node.querySelectorAll("script,iframe,link,img,source");
      for (var i = 0; i < list.length; i++) inspectOne(list[i]);
    }
  }

  // Publisher-tagged scripts: <script type="text/plain"
  //   data-gdrock-category="analytics|marketing" [src=… | data-gdrock-src=… | inline code]>
  function registerTagged(node) {
    if (node.getAttribute("data-gdrock-held")) return;
    var cat = node.getAttribute("data-gdrock-category");
    if (!cat && !node.getAttribute("data-gdrock-src")) return; // unrelated text/plain
    cat = cat === "analytics" ? "analytics" : "marketing"; // safe default
    var url = node.getAttribute("data-gdrock-src") || node.getAttribute("src") || null;
    origSetAttribute.call(node, "data-gdrock-held", "1");
    origSetAttribute.call(node, "data-gdrock-category", cat);
    var rule = { category: cat, vendor: url ? ((blockedRuleIgnoringConsent(url) || {}).vendor || "tagged script") : "tagged inline code" };
    var rec = { kind: "script", el: node, src: url, text: url ? null : node.text, category: cat,
      entry: record("script", url || "(inline)", rule, "held", "tagged") };
    if (granted(cat)) activate(rec);
    else held.push(rec);
  }

  if (window.MutationObserver) {
    new MutationObserver(function (muts) {
      for (var m = 0; m < muts.length; m++) {
        var added = muts[m].addedNodes;
        for (var n = 0; n < added.length; n++) inspectNode(added[n]);
      }
    }).observe(document.documentElement || document, { childList: true, subtree: true });
  }

  // Sweep anything already parsed before the engine ran, and again at
  // DOMContentLoaded in case the observer was attached late.
  function sweepTagged() {
    var list = document.querySelectorAll('script[type="text/plain"], iframe[data-gdrock-src], link[data-gdrock-href]');
    for (var i = 0; i < list.length; i++) inspectOne(list[i]);
  }
  sweepTagged();

  // ---------- Shopify Customer Privacy API ---------------------------------
  // Apps running in Shopify's pixel sandbox can't be reached by theme
  // scripts; Shopify's own consent state is what they obey.
  var shopify = { present: false, apiFound: false, loadRequested: false, updates: 0, lastSent: null, error: null };

  function shopifyPayload() {
    return {
      analytics: granted("analytics"),
      marketing: granted("marketing"),
      preferences: granted("analytics"),
      sale_of_data: granted("marketing")
    };
  }
  function shopifySync() {
    var S = window.Shopify;
    if (!S || typeof S !== "object") return;
    shopify.present = true;
    function apply() {
      var cp = S.customerPrivacy;
      if (!cp || typeof cp.setTrackingConsent !== "function") { shopify.error = "Shopify.customerPrivacy.setTrackingConsent not available"; return; }
      shopify.apiFound = true;
      var payload = shopifyPayload();
      try {
        // Shopify documents a callback with no stated arguments; an error
        // argument is handled if one is ever passed.
        cp.setTrackingConsent(payload, function (res) {
          if (res && res.error) { shopify.error = String(res.error); return; }
          shopify.updates++;
          shopify.lastSent = payload;
          shopify.error = null;
        });
      } catch (e) { shopify.error = String(e && e.message || e); }
    }
    if (S.customerPrivacy && typeof S.customerPrivacy.setTrackingConsent === "function") { apply(); return; }
    if (typeof S.loadFeatures === "function") {
      shopify.loadRequested = true;
      try {
        S.loadFeatures([{ name: "consent-tracking-api", version: "0.1" }], function (err) {
          if (err) { shopify.error = "loadFeatures: " + String(err && err.message || err); return; }
          apply();
        });
      } catch (e) { shopify.error = String(e && e.message || e); }
      return;
    }
    shopify.error = "window.Shopify has no loadFeatures or customerPrivacy";
  }
  // Shopify defines window.Shopify in <head> after this script, so sync once
  // the document is parsed (and now, in case it already exists).
  var shopifyStarted = false;
  function shopifyOnLoad() { if (shopifyStarted) return; shopifyStarted = true; shopifySync(); }
  if (window.Shopify) shopifyOnLoad();

  function onParsed() { sweepTagged(); shopifyOnLoad(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onParsed);
  else onParsed();

  // ---------- public API ----------------------------------------------------
  var listeners = [];
  function fireChange() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](get()); } catch (e) {}
    }
  }

  function get() {
    var c = state || {};
    return {
      necessary: true,
      analytics: !!c.analytics,
      marketing: !!c.marketing,
      choiceMade: !!state,
      timestamp: c.timestamp || null
    };
  }

  function applyChange() {
    pushConsentUpdate(state);
    release();
    shopifySync(); // no-op until window.Shopify exists; the load-time sync still runs
    fireChange();
  }

  var applying = false;
  function set(v) {
    v = v || {};
    var next = {
      analytics: "analytics" in v ? !!v.analytics : !!(state && state.analytics),
      marketing: "marketing" in v ? !!v.marketing : !!(state && state.marketing)
    };
    next.accepted = next.analytics || next.marketing;
    next.timestamp = new Date().toISOString();
    state = next;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
    applyChange();
    // Notify the banner/site. Consent LOGGING stays owned by the banner
    // (gdrock.js saveConsent); the engine does not POST to /api/consent.
    applying = true;
    try { window.dispatchEvent(new CustomEvent("gdrock:consent", { detail: next })); }
    catch (e) {}
    applying = false;
    return get();
  }

  // The live gdrock.js banner dispatches this after saveConsent() — the
  // engine reacts without any banner change.
  window.addEventListener("gdrock:consent", function (e) {
    if (applying) return;
    var d = (e && e.detail) || loadStored() || {};
    state = {
      analytics: !!d.analytics,
      marketing: !!d.marketing,
      accepted: !!d.analytics || !!d.marketing,
      timestamp: d.timestamp || new Date().toISOString()
    };
    applyChange();
  });

  // ---------- diagnostics ---------------------------------------------------
  function inlineUntagged() {
    var out = [], res = [], i, j;
    for (i = 0; i < INLINE_SIGNATURES.length; i++) {
      try { res.push([new RegExp(INLINE_SIGNATURES[i][0], "i"), INLINE_SIGNATURES[i][1]]); } catch (e) {}
    }
    var all = document.getElementsByTagName("script");
    for (i = 0; i < all.length; i++) {
      var s = all[i];
      if (s === me || s.getAttribute("src") || s.getAttribute("data-gdrock-held") || s.getAttribute("data-gdrock-category")) continue;
      if (!CODE_TYPES.test(s.getAttribute("type") || "")) continue;
      var text = String(s.text || "");
      for (j = 0; j < res.length; j++) {
        if (res[j][0].test(text)) {
          var m = res[j][0].exec(text);
          out.push({ vendor: res[j][1], snippet: text.slice(Math.max(0, m.index - 40), m.index + 80).replace(/\s+/g, " ") });
          break;
        }
      }
    }
    return out;
  }

  function fontsSeen() {
    var urls = [], out = [], seen = {}, i;
    var links = document.querySelectorAll("link[href]");
    for (i = 0; i < links.length; i++) urls.push(links[i].getAttribute("href"));
    var styles = document.getElementsByTagName("style");
    for (i = 0; i < styles.length; i++) {
      var re = /@import\s+(?:url\()?\s*["']?([^"')\s;]+)/gi, m;
      while ((m = re.exec(styles[i].textContent || ""))) urls.push(m[1]);
    }
    try {
      var entries = window.performance && performance.getEntriesByType ? performance.getEntriesByType("resource") : [];
      for (i = 0; i < entries.length; i++) urls.push(entries[i].name);
    } catch (e) {}
    for (i = 0; i < urls.length; i++) {
      var p = providerOf(FONT_PROVIDERS, urls[i]);
      if (p && !seen[urls[i]]) { seen[urls[i]] = 1; out.push({ provider: p[0], url: String(urls[i]).slice(0, 200) }); }
    }
    return out;
  }

  function embedsSeen() {
    var out = [], i;
    var frames = document.getElementsByTagName("iframe");
    for (i = 0; i < frames.length; i++) {
      var src = frames[i].getAttribute("src") || "";
      var p = providerOf(EMBED_PROVIDERS, src);
      if (p) out.push({ provider: p[0], src: src.slice(0, 200), state: "loaded" });
    }
    for (i = 0; i < held.length; i++) if (held[i].kind === "embed") out.push({ provider: held[i].provider[0], src: held[i].src.slice(0, 200), state: "click-to-load" });
    return out;
  }

  function diagnostics() {
    var byCat = { analytics: [], marketing: [] }, counts = { held: 0, released: 0, dropped: 0, loadedByClick: 0 }, i;
    for (i = 0; i < log.length; i++) {
      var e = log[i];
      (byCat[e.category] || (byCat[e.category] = [])).push({ type: e.type, vendor: e.vendor, url: e.url, action: e.action, via: e.via, ms: e.ms });
      if (e.action === "held") counts.held++;
      else if (e.action === "released") counts.released++;
      else if (e.action === "dropped") counts.dropped++;
      else if (e.action === "loaded by click") counts.loadedByClick++;
    }
    var inline = inlineUntagged(), fonts = fontsSeen(), embeds = embedsSeen();
    var fromHtml = [];
    for (i = 0; i < log.length; i++) if (log[i].via === "html" && (log[i].type === "script" || log[i].type === "img" || log[i].type === "iframe")) fromHtml.push({ type: log[i].type, vendor: log[i].vendor, url: log[i].url });

    var todo = [];
    if (!install.foundOwnTag) todo.push("GDRock could not identify its own <script> tag. Load it with a plain <script src> tag, not from another script.");
    if (install.async) todo.push("Remove async/defer from the GDRock script tag: it has to run before everything else.");
    var trackersFirst = [];
    for (i = 0; i < install.ranBefore.length; i++) if (install.ranBefore[i].tracker) trackersFirst.push(install.ranBefore[i].tracker);
    if (install.ranBefore.length) todo.push("Move the GDRock script above the " + install.ranBefore.length + " script(s) that ran before it" +
      (trackersFirst.length ? ", including " + trackersFirst.join(", ") + ", which ran unblocked" : "") + ".");
    for (i = 0; i < inline.length; i++) todo.push("Inline " + inline[i].vendor + " code runs before anyone can block it. Tag that <script> type=\"text/plain\" data-gdrock-category=\"" +
      (/Google Analytics|Google Tag Manager|Google tag|Hotjar|Clarity|Yandex/.test(inline[i].vendor) ? "analytics" : "marketing") + "\" so it waits for consent.");
    for (i = 0; i < fromHtml.length; i++) todo.push("The " + fromHtml[i].vendor + " " + fromHtml[i].type + " is written directly in the HTML, so the browser may fetch it once before GDRock can act. Change src to data-gdrock-src" + (fromHtml[i].type === "script" ? " and add type=\"text/plain\"" : "") + ".");
    var fontProviders = {};
    for (i = 0; i < fonts.length; i++) fontProviders[fonts[i].provider] = 1;
    for (var fp in fontProviders) todo.push(fp + " are loaded from " + fp.split(" ")[0] + "'s servers, which sends every visitor's IP address there. Host the font files on your own server.");
    for (i = 0; i < embeds.length; i++) if (embeds[i].state === "loaded" && !granted("marketing")) todo.push("A " + embeds[i].provider + " embed loaded before consent. Add data-gdrock-embeds=\"click\" to the GDRock script tag for a click-to-load placeholder.");
    if (shopify.present && !shopify.apiFound) todo.push("This is a Shopify store but the Customer Privacy API could not be reached (" + (shopify.error || "not loaded yet") + "), so app pixels are not told about consent.");
    if (shopify.present) todo.push("In Shopify admin > Settings > Customer privacy, require consent for your visitors' regions, so app pixels wait for GDRock's signal instead of Shopify's regional default.");

    return {
      version: VERSION,
      siteId: SITE_ID || null,
      advancedConsentMode: ADVANCED,
      embedsClickToLoad: EMBEDS_CLICK,
      install: { firstScript: install.firstScript, foundOwnTag: install.foundOwnTag, asyncOrDefer: install.async, ranBefore: install.ranBefore },
      consent: get(),
      blocked: byCat,
      counts: counts,
      stillHeld: held.length,
      untaggedInline: inline,
      fromHtml: fromHtml,
      fonts: fonts,
      embeds: embeds,
      shopify: {
        present: shopify.present, apiFound: shopify.apiFound, loadRequested: shopify.loadRequested,
        updated: shopify.updates > 0, updates: shopify.updates, lastSent: shopify.lastSent, error: shopify.error
      },
      manualWork: todo
    };
  }

  // Back-compat: old gdrock.js exposed GDRock.consent as a FUNCTION returning
  // the stored record — keep it callable, with get/set/onChange attached.
  function consentAPI() { return get(); }
  consentAPI.get = get;
  consentAPI.set = set;
  consentAPI.onChange = function (fn) {
    if (typeof fn === "function") listeners.push(fn);
    return function () {
      var i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    };
  };

  var ns = (typeof window.GDRock === "object" && window.GDRock) || {};
  ns.consent = consentAPI;
  ns.diagnostics = diagnostics;
  ns.blocker = {
    version: VERSION,
    // Agencies/tests can extend the blocklist before trackers load.
    add: function (pattern, category) {
      BLOCKLIST.push([String(pattern).toLowerCase(), category === "analytics" ? "analytics" : "marketing", false, "custom rule"]);
    },
    held: function () {
      var out = [];
      for (var i = 0; i < held.length; i++) {
        out.push({ kind: held[i].kind, src: held[i].src, category: held[i].category, inline: held[i].src == null });
      }
      return out;
    }
  };

  // Merge-safe namespace: a later `window.GDRock = {...}` (the current banner
  // does this) merges in instead of clobbering the consent API.
  try {
    Object.defineProperty(window, "GDRock", {
      configurable: true,
      get: function () { return ns; },
      set: function (v) {
        if (v && typeof v === "object") {
          for (var k in v) { if (k !== "consent" && k !== "diagnostics") ns[k] = v[k]; }
        }
      }
    });
  } catch (e) {
    window.GDRock = ns;
  }
})(window, document);

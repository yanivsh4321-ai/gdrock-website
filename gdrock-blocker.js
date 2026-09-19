/*!
 * GDRock Consent Blocker v2.1.0 — cdn.gdrock.com
 * ================================================
 * Holds or drops tracker traffic until the visitor consents, refuses tracking
 * cookies, and sets Google Consent Mode v2 defaults to denied.
 *
 * MUST be the FIRST script in <head> — before GTM/gtag, before any pixel
 * loader — and must NOT be async or defer. /gdrock.js is this file with the
 * banner appended, so one tag does both:
 *
 *   <script src="https://cdn.gdrock.com/gdrock.js" data-site-id="YOUR_ID"></script>
 *
 * On Shopify, render snippets/gdrock-blocker.liquid as the first line inside
 * <head> in layout/theme.liquid, above {{ content_for_header }}.
 *
 * What counts as a tracker
 *   The blocklist and the cookie list below are generated from the GDRock
 *   scanner's own lists (verify_consent.config.js) by verify_blocklist_sync.js,
 *   so the blocker covers every vendor and cookie the scanner reports.
 *
 * What it does before consent, by kind of traffic
 *   HELD, then released after consent:
 *     - <script src>   from JS, in the HTML, via document.write/srcdoc
 *     - <iframe src>   from JS, HTML strings and the HTML
 *     - <link href>    preload / prefetch / preconnect / stylesheet
 *     - <a ping>       the ping list is set aside and restored
 *     - inline code the merchant tagged:
 *         <script type="text/plain" data-gdrock-category="analytics">…</script>
 *   DROPPED, never replayed (they describe a moment before consent; the
 *   released library sends its own fresh hits after consent):
 *     - image pixels, <video>/<audio>/<track> sources and posters, SVG hrefs
 *     - url() and @import in style attributes, <style> tags, el.style,
 *       insertRule/replace (the url becomes about:invalid)
 *     - fetch() (empty 204), XMLHttpRequest (error + loadend), sendBeacon
 *       (returns true), WebSocket and EventSource (closed stand-ins that fire
 *       error), Worker/SharedWorker from a tracker URL (inert stand-in)
 *   REFUSED:
 *     - tracking cookies written through document.cookie or cookieStore
 *       (deleting one is always allowed)
 *   Every path above is covered however the element was made: property,
 *   setAttribute, setAttributeNS, Attr.value, innerHTML/outerHTML,
 *   insertAdjacentHTML, createContextualFragment, setHTMLUnsafe,
 *   document.write, importNode/adoptNode of DOMParser or <template> content,
 *   or the parser. A blocked call never throws into page code.
 *
 * Same-origin frames
 *   about:blank and srcdoc iframes get the same patches the moment they are
 *   inserted or their window is read (contentWindow/contentDocument), and a
 *   srcdoc gets a one-line bootstrap so its own scripts start patched.
 *
 * Categories: "analytics" | "marketing". "necessary" is always granted.
 *
 * Google Consent Mode v2
 *   Defaults ad_storage / analytics_storage / ad_user_data /
 *   ad_personalization to "denied" (wait_for_update: 500) and pushes an
 *   update per category when the visitor chooses.
 *
 * Withdrawal
 *   When a granted category is taken back, the tracking cookies of that
 *   category are deleted (every host/path combination this page can reach)
 *   and the page reloads, because a tracker that already runs can't be
 *   unloaded. data-gdrock-reload="false" skips the reload.
 *
 * Shopify
 *   window.Shopify is caught the moment it is assigned (property trap), and
 *   the choice goes to Shopify's Customer Privacy API before any later script
 *   runs, then on every change:
 *     Shopify.loadFeatures([{name:"consent-tracking-api", version:"0.1"}])
 *     Shopify.customerPrivacy.setTrackingConsent({analytics, marketing,
 *       preferences, sale_of_data})
 *   Mapping: preferences->analytics, sale_of_data->marketing; all false
 *   until the visitor chooses. That is what reaches app pixels in Shopify's
 *   sandbox. diagnostics() warns when Shopify already treated the visitor as
 *   trackable before any choice.
 *
 * Optional attributes on the script tag
 *   data-site-id="X"               site id (storage key suffix; matches banner)
 *   data-gdrock-advanced="true"    Advanced Consent Mode: Google tags load with
 *                                  the denied defaults and send cookieless
 *                                  pings (Google then sees the IP before
 *                                  consent). Off by default.
 *   data-gdrock-embeds="click"     YouTube / Vimeo / Maps become click-to-load
 *                                  placeholders, wherever they come from
 *   data-gdrock-fonts="bunny"      Google Fonts stylesheets added by JavaScript
 *                                  load from fonts.bunny.net instead (an EU
 *                                  host that says it keeps no IP logs).
 *                                  Self-hosting is still the clean fix.
 *   data-gdrock-strict="true"      until marketing consent, drop fetch / XHR /
 *                                  beacon / WebSocket / EventSource / ping to
 *                                  third-party hosts that are not on the list
 *                                  below (images and scripts are not touched)
 *   data-gdrock-allow="a.com b.io" hosts strict mode lets through (and their
 *                                  subdomains); *.gdrock.com always passes
 *   data-gdrock-reload="false"     no reload after a withdrawal
 *
 * Install check
 *   GDRock.diagnostics() — first-script check, everything held / dropped /
 *   refused by category, untagged inline tracker code, trackers written in the
 *   HTML, fonts, embeds, unknown third-party hosts, Shopify status, and a
 *   plain-English to-do list.
 *   GDRock.installFix() — the same findings as exact edits (find / replace,
 *   Shopify steps), plus a printable text version.
 *
 * Public API (unchanged, used by the gdrock.js banner):
 *   window.GDRock.consent.get() / .set({analytics, marketing}) / .onChange(fn)
 *   window.GDRock.consent() still returns the state (back-compat)
 *   shared localStorage key gdrock_consent_<siteId>, "gdrock:consent" event,
 *   merge-safe window.GDRock (a later `window.GDRock = {...}` merges in).
 *
 * Known limitations — what this cannot do (base sales claims on this list)
 *   1. Anything that runs BEFORE this script. It must be the first script and
 *      not async/defer. diagnostics() and installFix() show what ran first.
 *   2. The browser's preloader. A tracker <script src>, <img src>,
 *      <iframe src> or <link> written straight into the HTML can be fetched
 *      once before any script runs. It is never executed, but the tracker's
 *      server sees the IP. Only tagging it (installFix() gives the exact edit;
 *      on Shopify that means switching an app embed off and pasting a tagged
 *      snippet) prevents that request. The same goes for HTTP Link: preload
 *      headers.
 *   3. Untagged inline tracker code has already run by the time any script
 *      can look. Its network calls, cookie writes and injected tags are still
 *      stopped; anything else it does locally (e.g. localStorage) is not.
 *   4. Cookies set by a server (Set-Cookie on any response, including
 *      HttpOnly cookies) never pass through JavaScript: they can be neither
 *      refused nor deleted here. The same is true of cookies a third-party
 *      iframe sets on its own domain.
 *   5. Other windows it cannot enter: cross-origin iframes, sandboxed
 *      iframes without allow-same-origin (Shopify's app-pixel sandbox is one;
 *      the Customer Privacy API covers it), the code inside a Worker started
 *      from a non-tracker URL, service workers, and same-origin pages loaded
 *      into an iframe (those need their own tag).
 *   6. Shopify's regional default: if the store doesn't require consent for
 *      a region, an app pixel may act on Shopify's own default. diagnostics()
 *      warns; the fix is Settings > Customer privacy.
 *   7. Server-side tracking (Meta Conversions API, server-side GTM, a tracker
 *      proxied through the shop's own domain under an unknown path).
 *   8. Transports still not intercepted: url() inside an external stylesheet
 *      file, dynamic import() of a tracker module, <object data>/<embed src>,
 *      <input type=image>, legacy background= attributes, writes through
 *      Attr.nodeValue/textContent, and WebRTC/WebTransport.
 *   9. Fonts are reported, not blocked (a blocked font breaks the page). The
 *      Bunny Fonts switch only reaches stylesheets added by JavaScript.
 *  10. Withdrawal deletes the listed tracking cookies and reloads. Cookies not
 *      on the list, HttpOnly cookies, and a tracker's localStorage/IndexedDB
 *      data stay.
 *  11. It blocks by list. A new vendor, or a known vendor on a new host, gets
 *      through until the list is updated; diagnostics() lists every unknown
 *      third-party host, and strict mode drops their beacons.
 */
(function (window, document) {
  "use strict";
  if (window.__gdrockBlocker) return;
  var VERSION = "2.1.0";
  window.__gdrockBlocker = { version: VERSION };
  var T0 = new Date().getTime();
  var SKIP = {}; // an attribute or property write that must not happen
  var SVG_NS = "http://www.w3.org/2000/svg";

  // ---------- config -------------------------------------------------------
  var me = document.currentScript;
  function opt(n) { return me ? me.getAttribute(n) : null; }
  var SITE_ID = opt("data-site-id") || (window.GDRockConfig && window.GDRockConfig.siteId) || "";
  if (!SITE_ID) {
    var idTag = document.querySelector("script[data-site-id]");
    if (idTag) SITE_ID = idTag.getAttribute("data-site-id") || "";
  }
  // Same key as gdrock.js so banner + engine share one consent record.
  var STORAGE_KEY = "gdrock_consent_" + (SITE_ID || "default");
  var ADVANCED = opt("data-gdrock-advanced") === "true";
  var EMBEDS_CLICK = opt("data-gdrock-embeds") === "click";
  var FONTS_BUNNY = opt("data-gdrock-fonts") === "bunny";
  var STRICT = opt("data-gdrock-strict") === "true";
  var RELOAD_ON_WITHDRAW = opt("data-gdrock-reload") !== "false";
  var ALLOW = ["gdrock.com"];
  String(opt("data-gdrock-allow") || "").replace(/[^,\s]+/g, function (h) { ALLOW.push(h.toLowerCase().replace(/^\*\./, "")); return h; });

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
  // Tracking cookies a page can write on its own domain, refused before consent: [name, isPrefix, category, vendor]
  var TRACKING_COOKIES = [["_ga",true,"analytics","Google Analytics"],["_gid",false,"analytics","Google Analytics"],["_gat",true,"analytics","Google Analytics"],["_dc_gtm_",true,"analytics","Google Analytics"],["_gcl_",true,"marketing","Google Ads"],["_fbp",false,"marketing","Meta Pixel"],["_fbc",false,"marketing","Meta Pixel"],["_ttp",false,"marketing","TikTok Pixel"],["_tt_enable_cookie",false,"marketing","TikTok Pixel"],["_pin_unauth",false,"marketing","Pinterest Tag"],["_epik",false,"marketing","Pinterest Tag"],["_derived_epik",false,"marketing","Pinterest Tag"],["_scid",true,"marketing","Snapchat Pixel"],["li_fat_id",false,"marketing","LinkedIn Insight Tag"],["_uetsid",false,"marketing","Microsoft Ads (UET)"],["_uetvid",false,"marketing","Microsoft Ads (UET)"],["_clck",false,"analytics","Microsoft Clarity"],["_clsk",false,"analytics","Microsoft Clarity"],["_hj",true,"analytics","Hotjar"],["__kla_id",false,"marketing","Klaviyo"],["cto_bundle",false,"marketing","Criteo"],["_rdt_uuid",false,"marketing","Reddit Pixel"],["_ym_",true,"analytics","Yandex Metrica"],["_pk_",true,"analytics","Matomo"],["ajs_anonymous_id",false,"marketing","Segment"]];
  // </generated-blocklist>

  // ---------- matching -----------------------------------------------------
  function toUrl(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (v.url) return String(v.url); // Request
    return String(v);                // URL object or anything stringable
  }
  function listRule(low) {
    for (var i = 0; i < BLOCKLIST.length; i++) if (low.indexOf(BLOCKLIST[i][0]) !== -1) return BLOCKLIST[i];
    return null;
  }

  // -> {category, vendor} or null. Substring match, like the scanner.
  function blockedRule(value) {
    var url = toUrl(value);
    if (!url) return null;
    var low = url.toLowerCase(), hit = listRule(low), i;
    if (hit) {
      if (ADVANCED && hit[2]) return null; // Consent Mode governs Google
      return granted(hit[1]) ? null : { category: hit[1], vendor: hit[3] };
    }
    if (low.indexOf("collect") !== -1) {
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
  // The list's verdict regardless of consent (for reports).
  function knownRule(url) {
    var h = listRule(toUrl(url).toLowerCase());
    return h ? { category: h[1], vendor: h[3] } : null;
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

  // ---------- hosts: first party, strict mode, unknown third parties -------
  function hostOf(u) {
    try { return new URL(toUrl(u), document.baseURI).hostname.toLowerCase(); } catch (e) { return ""; }
  }
  // Registrable domain, good enough to tell "this shop" from "someone else":
  // shop.example.co.uk and www.example.co.uk are the same site.
  function siteOf(h) {
    if (/^[\d.]+$|:/.test(h)) return h; // an IP address is its own site
    var p = String(h || "").split(".");
    var k = p.length > 2 && p[p.length - 1].length === 2 && /^(co|com|org|net|ac|gov|or|ne|gv|ltd|plc)$/.test(p[p.length - 2]) ? 3 : 2;
    return p.slice(-k).join(".");
  }
  var SELF = siteOf(location.hostname);
  function thirdParty(h) { return !!h && siteOf(h) !== SELF; }
  function allowedHost(h) {
    for (var i = 0; i < ALLOW.length; i++) if (h === ALLOW[i] || h.slice(-ALLOW[i].length - 1) === "." + ALLOW[i]) return true;
    return false;
  }
  // Strict mode: a beacon to a host nobody listed, before marketing consent.
  function strictRule(u) {
    if (!STRICT || granted("marketing")) return null;
    var h = hostOf(u);
    if (!thirdParty(h) || allowedHost(h)) return null;
    return { category: "marketing", vendor: "unlisted host " + h, strict: true };
  }
  function beaconRule(u) { return blockedRule(u) || strictRule(u); }

  var hosts = {}, hostCount = 0;
  function noteHost(u, via) {
    u = toUrl(u);
    if (!u || /^(data|blob|about|javascript|mailto|tel):/i.test(u)) return;
    var h = hostOf(u);
    if (!thirdParty(h)) return;
    var e = hosts[h];
    if (!e) {
      if (hostCount >= 150) return;
      hostCount++;
      var low = u.toLowerCase(), k = listRule(low), p = providerOf(FONT_PROVIDERS, low) || providerOf(EMBED_PROVIDERS, low);
      e = hosts[h] = { host: h, count: 0, via: [], known: k ? k[3] : p ? p[0] : allowedHost(h) ? "allowed" : null, dropped: 0 };
    }
    e.count++;
    if (e.via.indexOf(via) === -1) e.via.push(via);
  }

  // ---------- activity log (feeds diagnostics) -----------------------------
  var log = [];
  function record(type, url, rule, action, via) {
    var e = { type: type, url: toUrl(url).slice(0, 300), category: rule.category, vendor: rule.vendor,
      action: action, via: via || "js", ms: new Date().getTime() - T0 };
    if (log.length < 500) log.push(e);
    if (rule.strict) { noteHost(url, type); var h = hosts[hostOf(url)]; if (h) h.dropped++; }
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
  function soon(fn) { if (window.Promise) Promise.resolve().then(fn); else later(fn); }
  function noop() {}

  // ---------- install check: what ran before this script -------------------
  var CODE_TYPES = /^(|text\/javascript|application\/javascript|module|text\/ecmascript|application\/ecmascript)$/i;
  function describeScript(s) {
    var src = s.getAttribute("src");
    var d = { src: src || null, inline: src ? null : String(s.text || "").replace(/\s+/g, " ").slice(0, 100), tracker: null };
    var r = src ? knownRule(src) : null;
    if (r) d.tracker = r.vendor;
    return d;
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

  // ---------- natives (this window; frames get their own in patchRealm) ----
  function desc(proto, prop) { try { return proto && Object.getOwnPropertyDescriptor(proto, prop); } catch (e) { return null; } }
  function P(name) { return window[name] && window[name].prototype; }
  var origCreateElement = Document.prototype.createElement;
  var origSetAttribute = Element.prototype.setAttribute;
  var origRemoveAttribute = Element.prototype.removeAttribute;
  var nativeScriptSrc = desc(P("HTMLScriptElement"), "src");
  var nativeIframeSrc = desc(P("HTMLIFrameElement"), "src");
  var nativeContentWindow = desc(P("HTMLIFrameElement"), "contentWindow");
  var nativeLinkHref = desc(P("HTMLLinkElement"), "href");
  var nativeText = desc(P("Node"), "textContent");
  var nativeAttrValue = desc(P("Attr"), "value");
  var nativeCookie = desc(P("Document"), "cookie") || desc(P("HTMLDocument"), "cookie");
  function setNative(d, el, attr, v) { if (d && d.set) d.set.call(el, v); else origSetAttribute.call(el, attr, v); }
  function make(el, tag) { return origCreateElement.call(el.ownerDocument || document, tag); }

  // ---------- cookies ------------------------------------------------------
  function cookieRule(name) {
    for (var i = 0; i < TRACKING_COOKIES.length; i++) {
      var c = TRACKING_COOKIES[i];
      if (c[1] ? name.indexOf(c[0]) === 0 : name === c[0]) return { category: c[2], vendor: c[3] };
    }
    return null;
  }
  function cookieName(s) { return String(s).split(";")[0].split("=")[0].replace(/^\s+|\s+$/g, ""); }
  function isDeletion(s) {
    if (/;\s*max-age\s*=\s*(?:0|-)/i.test(s)) return true;
    var m = /;\s*expires\s*=\s*([^;]+)/i.exec(s);
    return !!(m && Date.parse(m[1]) < new Date().getTime());
  }
  // null = allowed; otherwise the rule that refused it.
  function refuseCookie(s, via) {
    s = String(s);
    var name = cookieName(s), r = name ? cookieRule(name) : null;
    if (!r || granted(r.category) || isDeletion(s)) return null;
    record("cookie", name, r, "refused", via);
    return r;
  }

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
  function drop(el, type, url, rule, via) {
    record(type, url, rule, "dropped", via);
    origSetAttribute.call(el, "data-gdrock-blocked-src", toUrl(url).slice(0, 300));
    later(function () { fire(el, "error"); });
  }

  function clearMarks(el) {
    var names = ["data-gdrock-held", "data-gdrock-src", "data-gdrock-href", "data-gdrock-category", "data-gdrock-embed", "data-gdrock-ping"];
    for (var i = 0; i < names.length; i++) origRemoveAttribute.call(el, names[i]);
  }

  function activate(h) {
    var el = h.el;
    if (h.entry) h.entry.action = h.kind === "embed" && h.clicked ? "loaded by click" : "released";
    if (h.kind === "script") {
      if (el.parentNode) {
        // Connected placeholder: swap in a fresh, executable script in place
        // (changing type back on the same node does not re-trigger execution).
        var s = make(el, "script");
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
    } else if (h.kind === "ping") {
      var cur = el.getAttribute("ping");
      clearMarks(el);
      origSetAttribute.call(el, "ping", (cur ? cur + " " : "") + h.src);
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

  // ---------- <a ping> -----------------------------------------------------
  function splitPing(v) {
    var parts = String(v || "").split(/\s+/), keep = [], blocked = [], cat = "analytics";
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i]) continue;
      var r = beaconRule(parts[i]);
      if (r) { blocked.push(parts[i]); if (r.category === "marketing") cat = "marketing"; }
      else keep.push(parts[i]);
    }
    return { keep: keep.join(" "), blocked: blocked.join(" "), category: cat };
  }
  function holdPing(el, s, via) {
    origSetAttribute.call(el, "data-gdrock-ping", s.blocked);
    origSetAttribute.call(el, "data-gdrock-held", "1");
    held.push({ kind: "ping", el: el, src: s.blocked, category: s.category,
      entry: record("ping", s.blocked, { category: s.category, vendor: (knownRule(s.blocked) || {}).vendor || "ping" }, "held", via) });
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
    var box = make(el, "div");
    origSetAttribute.call(box, "class", "gdrock-embed-placeholder");
    origSetAttribute.call(box, "role", "region");
    origSetAttribute.call(box, "aria-label", prov[0] + " " + prov[2] + " not loaded");
    box.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;box-sizing:border-box;" +
      "max-width:100%;padding:20px;border-radius:8px;background:#111418;color:#e8eaee;text-align:center;" +
      "font:14px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;" +
      "width:" + (w ? (/^\d+$/.test(w) ? w + "px" : w) : "100%") + ";height:" + (h ? (/^\d+$/.test(h) ? h + "px" : h) : "315px") + ";";
    var p = make(el, "p");
    p.style.cssText = "margin:0;max-width:44ch;";
    p.textContent = "This " + prov[2] + " is hosted by " + prov[1] + " (" + prov[0] + "). Loading it lets " + prov[1] + " set cookies and see your IP address.";
    var b = make(el, "button");
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

  // ---------- fonts (reported; optional Bunny swap for JS-added CSS) ------
  var fontRewrites = [];
  function fontSwap(u, via) {
    if (!FONTS_BUNNY || typeof u !== "string" || !/fonts\.googleapis\.com\/css/i.test(u)) return u;
    var n = u.replace(/fonts\.googleapis\.com/i, "fonts.bunny.net");
    if (fontRewrites.length < 50) fontRewrites.push({ from: u.slice(0, 200), to: n.slice(0, 200), via: via });
    return n;
  }

  // ---------- CSS: url() and @import ---------------------------------------
  var CSS_URL = /url\(\s*(['"]?)([^'")\s]+)\1\s*\)/gi;
  var CSS_IMPORT = /@import\s+(['"])([^'"]+)\1/gi;
  function cleanCSS(text, fromJs) {
    if (typeof text !== "string" || (text.indexOf("url(") === -1 && text.indexOf("@import") === -1)) return text;
    var via = fromJs ? "js" : "html";
    return text.replace(CSS_URL, function (all, q, u) {
      var r = blockedRule(u);
      if (r) { record("css", u, r, "dropped", via); return "url(about:invalid)"; }
      var s = fromJs ? fontSwap(u, "css") : u;
      return s === u ? all : "url(" + q + s + q + ")";
    }).replace(CSS_IMPORT, function (all, q, u) {
      var r = blockedRule(u);
      if (r) { record("css", u, r, "dropped", via); return "@import url(about:invalid)"; }
      var s = fromJs ? fontSwap(u, "css") : u;
      return s === u ? all : "@import " + q + s + q;
    });
  }

  // ---------- srcdoc bootstrap ---------------------------------------------
  // The first thing a srcdoc document runs asks its parent to patch it, so its
  // own scripts start with patched fetch/Image/cookie.
  var BOOT = "<script data-gdrock-boot>try{parent.__gdrockPatch(window)}catch(e){}<\/script>";
  function bootSrcdoc(v) {
    if (typeof v !== "string" || v.indexOf("data-gdrock-boot") !== -1) return v;
    return BOOT + rewriteHTML(v, true);
  }

  // ---------- per-attribute decisions (property, setAttribute*, Attr) ------
  function onScriptSrc(el, v) {
    var r = blockedRule(v);
    if (r) { holdScript(el, toUrl(v), r, "js"); return SKIP; }
    noteHost(v, "script");
    return v;
  }
  function onIframeSrc(el, v) {
    var r = blockedRule(v);
    if (r) { holdIframe(el, toUrl(v), r, "js"); return SKIP; }
    var prov = embedFor(v);
    if (prov) { holdEmbed(el, toUrl(v), prov, "js"); return SKIP; }
    noteHost(v, "iframe");
    return v;
  }
  function onLinkHref(el, v) {
    var r = blockedRule(v);
    if (r) { holdLink(el, toUrl(v), r, "js"); return SKIP; }
    var s = fontSwap(v, "link");
    noteHost(s, "link");
    return s;
  }
  function onPixel(el, v) {
    var r = blockedRule(v);
    if (r) { drop(el, "img", v, r, "js"); return SKIP; }
    noteHost(v, "img");
    return v;
  }
  function onSrcset(el, v) {
    var r = srcsetRule(v);
    if (r) { drop(el, "img", v, r, "js"); return SKIP; }
    return v;
  }
  function onMedia(el, v) {
    var r = blockedRule(v);
    if (r) { drop(el, "media", v, r, "js"); return SKIP; }
    noteHost(v, "media");
    return v;
  }
  function onPing(el, v) {
    var s = splitPing(v);
    if (!s.blocked) return v;
    holdPing(el, s, "js");
    return s.keep;
  }

  function attrFilter(el, n, value) {
    var t = el.nodeName;
    if (n === "style") return cleanCSS(value, true);
    if (n === "src") {
      if (t === "SCRIPT") return onScriptSrc(el, value);
      if (t === "IFRAME") return onIframeSrc(el, value);
      if (t === "IMG" || t === "SOURCE") return onPixel(el, value);
      if (t === "VIDEO" || t === "AUDIO" || t === "TRACK") return onMedia(el, value);
    } else if (n === "srcset") {
      if (t === "IMG" || t === "SOURCE") return onSrcset(el, value);
    } else if (n === "href") {
      if (t === "LINK") return onLinkHref(el, value);
      if (el.namespaceURI === SVG_NS && /^(image|script|use|feImage)$/.test(el.localName)) return onPixel(el, value);
    } else if (n === "poster") {
      if (t === "VIDEO") return onMedia(el, value);
    } else if (n === "ping") {
      if (t === "A" || t === "AREA") return onPing(el, value);
    } else if (n === "srcdoc") {
      if (t === "IFRAME") return bootSrcdoc(value);
    }
    return value;
  }

  // ---------- HTML strings -------------------------------------------------
  // innerHTML / outerHTML / insertAdjacentHTML / document.write / srcdoc can
  // carry a pixel, frame or style that starts loading the moment the string
  // is parsed, so tracker attributes are renamed before the browser sees them.
  var TAG_RE = /<([a-z][a-z0-9-]*)\b([^>]*)>/gi;
  var ATTR_RE = /(\s)([a-z][a-z:-]*)(\s*=\s*)("([^"]*)"|'([^']*)'|([^\s"'>]+))/gi;
  function needsRewrite(low) {
    if (listRule(low) || low.indexOf("collect") !== -1) return true;
    if (EMBEDS_CLICK && providerOf(EMBED_PROVIDERS, low)) return true;
    if (FONTS_BUNNY && low.indexOf("fonts.googleapis.com") !== -1) return true;
    return STRICT && low.indexOf("ping") !== -1;
  }
  function htmlAttr(tag, a, v, forWrite) {
    var r;
    if (a === "style") { var c = cleanCSS(v, true); return c === v ? null : { name: "style", value: c }; }
    if (a === "src" || a === "srcset" || a === "poster") {
      if (tag === "script") {
        if (a !== "src" || !forWrite || !(r = blockedRule(v))) return null;
        return { name: "data-gdrock-src", value: v, extra: " type=\"text/plain\" data-gdrock-category=\"" + r.category + "\"" };
      }
      if (tag === "iframe" && a === "src") {
        if ((r = blockedRule(v))) return { name: "data-gdrock-src", value: v, extra: " data-gdrock-category=\"" + r.category + "\"" };
        if (embedFor(v)) return { name: "data-gdrock-src", value: v, extra: " data-gdrock-category=\"marketing\"" };
        return null;
      }
      if (tag === "img" || tag === "source" || tag === "video" || tag === "audio" || tag === "track") {
        r = a === "srcset" ? srcsetRule(v) : blockedRule(v);
        if (!r) return null;
        record(tag === "img" || tag === "source" ? "img" : "media", v, r, "dropped", "html-string");
        return { name: "data-gdrock-blocked-src", value: v };
      }
      return null;
    }
    if (a === "href" && tag === "link") {
      if ((r = blockedRule(v))) return { name: "data-gdrock-href", value: v, extra: " data-gdrock-category=\"" + r.category + "\"" };
      var s = fontSwap(v, "html-string");
      return s === v ? null : { name: "href", value: s };
    }
    if (a === "ping" && (tag === "a" || tag === "area")) {
      var p = splitPing(v);
      if (!p.blocked) return null;
      return { name: "ping", value: p.keep, extra: " data-gdrock-ping=\"" + p.blocked.replace(/"/g, "&quot;") + "\" data-gdrock-category=\"" + p.category + "\"" };
    }
    return null;
  }
  function rewriteHTML(html, forWrite) {
    if (typeof html !== "string" || html.indexOf("<") === -1 || !needsRewrite(html.toLowerCase())) return html;
    html = html.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style\s*>)/gi, function (all, a, css, b) { return a + cleanCSS(css, true) + b; });
    return html.replace(TAG_RE, function (tag, name, attrs) {
      var n = name.toLowerCase(), extra = "", changed = false;
      if (n === "script" && !forWrite) return tag; // innerHTML scripts never run or load
      var out = attrs.replace(ATTR_RE, function (all, sp, an, eq, qv, d, s, bare) {
        var v = d != null ? d : (s != null ? s : bare), q = s != null ? "'" : "\"";
        var res = htmlAttr(n, an.toLowerCase(), v, forWrite);
        if (!res) return all;
        changed = true;
        if (res.extra) extra += res.extra;
        return sp + res.name + "=" + q + String(res.value).replace(q === "'" ? /'/g : /"/g, q === "'" ? "&#39;" : "&quot;") + q;
      });
      // Our type comes first: with duplicate attributes, the first one wins.
      return changed ? "<" + name + extra + out + ">" : tag;
    });
  }

  // ---------- elements the parser or the DOM brought in --------------------
  function inspectScript(node) {
    if (node.getAttribute("data-gdrock-held")) return;
    var type = (node.getAttribute("type") || "").toLowerCase();
    if (type === "text/plain") { registerTagged(node); return; }
    var url = node.getAttribute("src");
    var r = blockedRule(url);
    if (!r) { if (url) noteHost(url, "script"); return; }
    // External scripts only: their fetch leaves a gap the observer wins.
    // Neutralize before evaluation and leave an inert placeholder in place.
    origSetAttribute.call(node, "type", "text/plain");
    var ph = make(node, "script");
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
    var sd = node.getAttribute("srcdoc");
    if (sd != null && sd.indexOf("data-gdrock-boot") === -1) origSetAttribute.call(node, "srcdoc", bootSrcdoc(sd));
    patchFrame(node);
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
      if (EMBEDS_CLICK && prov && !knownRule(tagged)) { holdEmbed(node, tagged, prov, "html"); return; }
      holdIframe(node, tagged, { category: cat, vendor: (knownRule(tagged) || {}).vendor || "tagged iframe" }, "html");
      return;
    }
    var url = node.getAttribute("src");
    if (!url) return;
    var r = blockedRule(url);
    if (r) { origRemoveAttribute.call(node, "src"); holdIframe(node, url, r, "html"); return; }
    var p = embedFor(url);
    if (p) { origRemoveAttribute.call(node, "src"); holdEmbed(node, url, p, "html"); return; }
    noteHost(url, "iframe");
  }

  function inspectLink(node) {
    if (node.getAttribute("data-gdrock-held")) return;
    var tagged = node.getAttribute("data-gdrock-href");
    if (tagged) {
      var cat = node.getAttribute("data-gdrock-category") === "analytics" ? "analytics" : "marketing";
      if (granted(cat)) { setNative(nativeLinkHref, node, "href", tagged); clearMarks(node); }
      else holdLink(node, tagged, { category: cat, vendor: (knownRule(tagged) || {}).vendor || "tagged link" }, "html");
      return;
    }
    var url = node.getAttribute("href");
    var r = blockedRule(url);
    if (r) { origRemoveAttribute.call(node, "href"); holdLink(node, url, r, "html"); return; }
    if (url) noteHost(url, "link");
  }

  // Already parsed with its src: the request may have left before any script
  // could act. Removing the attribute stops the load where it hasn't.
  function inspectSrcs(node, attrs, type) {
    if (node.getAttribute("data-gdrock-blocked-src")) return;
    for (var i = 0; i < attrs.length; i++) {
      var url = node.getAttribute(attrs[i]);
      if (!url) continue;
      var r = attrs[i] === "srcset" ? srcsetRule(url) : blockedRule(url);
      if (!r) continue;
      for (var j = 0; j < attrs.length; j++) origRemoveAttribute.call(node, attrs[j]);
      drop(node, type, url, r, "html");
      return;
    }
  }

  function inspectAnchor(node) {
    var tagged = node.getAttribute("data-gdrock-ping");
    if (tagged && !node.getAttribute("data-gdrock-held")) {
      var cat = node.getAttribute("data-gdrock-category") === "analytics" ? "analytics" : "marketing";
      if (granted(cat)) activate({ kind: "ping", el: node, src: tagged });
      else holdPing(node, { blocked: tagged, category: cat }, "html");
    }
    var pv = node.getAttribute("ping");
    if (!pv) return;
    var s = splitPing(pv);
    if (!s.blocked) return;
    origSetAttribute.call(node, "ping", s.keep);
    holdPing(node, s, "html");
  }

  function inspectStyleEl(node) {
    var t = nativeText.get.call(node), c = cleanCSS(t, false);
    if (c !== t) nativeText.set.call(node, c);
  }

  function inspectOne(node) {
    switch (node.nodeName) {
      case "SCRIPT": inspectScript(node); break;
      case "IFRAME": inspectIframe(node); break;
      case "LINK": inspectLink(node); break;
      case "IMG": case "SOURCE": inspectSrcs(node, ["src", "srcset"], "img"); break;
      case "VIDEO": inspectSrcs(node, ["src", "poster"], "media"); break;
      case "AUDIO": case "TRACK": inspectSrcs(node, ["src"], "media"); break;
      case "A": case "AREA": inspectAnchor(node); break;
      case "STYLE": inspectStyleEl(node); break;
      case "image": case "use": case "feImage": inspectSrcs(node, ["href", "xlink:href"], "img"); break;
    }
    var st = node.getAttribute("style");
    if (st && st.indexOf("url(") !== -1) {
      var c = cleanCSS(st, false);
      if (c !== st) origSetAttribute.call(node, "style", c);
    }
  }
  var WATCH = "script,iframe,link,img,source,video,audio,track,a[ping],area[ping],a[data-gdrock-ping],style,image,use,feImage,[style*='url(']";
  function inspectNode(node) {
    if (!node || (node.nodeType !== 1 && node.nodeType !== 11)) return;
    if (node.nodeType === 1) inspectOne(node);
    // Subtrees: a container appended in one go carries its children with it.
    if (node.firstElementChild && node.querySelectorAll) {
      var list = node.querySelectorAll(WATCH);
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
    var rule = { category: cat, vendor: url ? ((knownRule(url) || {}).vendor || "tagged script") : "tagged inline code" };
    var rec = { kind: "script", el: node, src: url, text: url ? null : node.text, category: cat,
      entry: record("script", url || "(inline)", rule, "held", "tagged") };
    if (granted(cat)) activate(rec);
    else held.push(rec);
  }

  var TAGGED = 'script[type="text/plain"], iframe[data-gdrock-src], link[data-gdrock-href], a[data-gdrock-ping]';
  function sweepTagged(doc) {
    var list = doc.querySelectorAll(TAGGED);
    for (var i = 0; i < list.length; i++) inspectOne(list[i]);
  }
  // full: inspect everything already in the document (a frame this script
  // just reached). The top document only gets the tagged sweep: whatever was
  // parsed before this script has already run or loaded, and holding it now
  // would only replay it after consent.
  function observeDoc(doc, full) {
    if (!doc || doc.__gdrockObserved) return;
    try { doc.__gdrockObserved = true; } catch (e) {}
    var MO = (doc.defaultView && doc.defaultView.MutationObserver) || window.MutationObserver;
    if (MO) {
      // The document itself, not its root: document.open() replaces the root.
      new MO(function (muts) {
        for (var m = 0; m < muts.length; m++) {
          var mu = muts[m], t = mu.target;
          if (mu.type === "characterData") { if (t.parentNode && t.parentNode.nodeName === "STYLE") inspectStyleEl(t.parentNode); continue; }
          if (t && t.nodeName === "STYLE" && mu.addedNodes.length) inspectStyleEl(t);
          var added = mu.addedNodes;
          for (var n = 0; n < added.length; n++) inspectNode(added[n]);
        }
      }).observe(doc, { childList: true, subtree: true, characterData: true });
    }
    if (full && doc.documentElement) inspectNode(doc.documentElement);
    else sweepTagged(doc);
  }

  // ---------- frames -------------------------------------------------------
  var framesPatched = 0;
  function patchFrame(iframe) {
    try {
      var w = nativeContentWindow ? nativeContentWindow.get.call(iframe) : iframe.contentWindow;
      if (w) patchRealm(w);
    } catch (e) {}
    if (!iframe.__gdrockLoadHook) {
      iframe.__gdrockLoadHook = true;
      // A same-origin navigation inside the frame gets a fresh window.
      try { iframe.addEventListener("load", function () { patchFrame(iframe); }); } catch (e) {}
    }
  }

  // Installs every patch into one window (this one, or a same-origin frame).
  function patchRealm(W) {
    var doc;
    try { doc = W.document; if (!doc || !W.Element) return; } catch (e) { return; } // cross-origin
    var EP = W.Element.prototype;
    if (!EP.__gdrockPatched) {
      try { Object.defineProperty(EP, "__gdrockPatched", { value: true }); } catch (e) { return; }
      try { W.__gdrockPatch = patchRealm; } catch (e) {}
      if (W !== window) framesPatched++;
      patchPrototypes(W);
    }
    observeDoc(doc, W !== window);
  }

  function acc(proto, prop, heldAttr, onSet) {
    var nd = desc(proto, prop);
    if (!nd || !nd.set || !nd.configurable) return;
    try {
      Object.defineProperty(proto, prop, {
        configurable: true,
        enumerable: nd.enumerable,
        get: function () {
          if (heldAttr && this.getAttribute("data-gdrock-held")) { var h = this.getAttribute(heldAttr); if (h != null) return h; }
          return nd.get.call(this);
        },
        set: function (v) { var r = onSet(this, v); if (r !== SKIP) nd.set.call(this, r); }
      });
    } catch (e) { /* locked-down environment: the observer path still covers */ }
  }
  function afterGet(proto, prop, fn) {
    var nd = desc(proto, prop);
    if (!nd || !nd.get || !nd.configurable) return;
    try {
      Object.defineProperty(proto, prop, { configurable: true, enumerable: nd.enumerable,
        get: function () { var v = nd.get.call(this); try { fn(v); } catch (e) {} return v; } });
    } catch (e) {}
  }
  function wrapArgs(proto, name, index, fn) {
    var nat = proto && proto[name];
    if (typeof nat !== "function") return;
    proto[name] = function () {
      var a = Array.prototype.slice.call(arguments);
      for (var i = 0; i < a.length; i++) if (index < 0 || i === index) a[i] = fn(a[i], this);
      return nat.apply(this, a);
    };
  }
  function collectFrames(n, out) {
    if (n.nodeName === "IFRAME") { (out = out || []).push(n); return out; }
    if ((n.nodeType === 1 || n.nodeType === 11) && n.firstChild && n.querySelectorAll) {
      var f = n.querySelectorAll("iframe");
      for (var j = 0; j < f.length; j++) (out = out || []).push(f[j]);
    }
    return out;
  }
  // Insertion: content from another document (DOMParser, <template>, another
  // window) is inspected before adoption starts its loads, and an inserted
  // iframe is patched before the next line of page code can reach its window.
  function wrapInsert(proto, name) {
    var nat = proto && proto[name];
    if (typeof nat !== "function") return;
    proto[name] = function () {
      var frames = null, target = this.nodeType === 9 ? this : this.ownerDocument;
      for (var i = 0; i < arguments.length; i++) {
        var n = arguments[i];
        if (!n || typeof n !== "object" || !n.nodeType) continue;
        if (n.ownerDocument && n.ownerDocument !== target) inspectNode(n);
        frames = collectFrames(n, frames);
      }
      var r = nat.apply(this, arguments);
      if (frames) for (i = 0; i < frames.length; i++) if (frames[i].isConnected !== false) patchFrame(frames[i]);
      return r;
    };
  }
  function makeFake(W, props, events) {
    var t;
    try { t = new W.EventTarget(); } catch (e) { t = W.document.createElement("span"); }
    for (var k in props) { try { t[k] = props[k]; } catch (e) {} }
    later(function () {
      for (var i = 0; i < events.length; i++) {
        fire(t, events[i]);
        var h = t["on" + events[i]];
        if (typeof h === "function") { try { h.call(t, { type: events[i], target: t }); } catch (x) {} }
      }
    });
    return t;
  }
  var FAKES = {
    WebSocket: function (W, u) { return makeFake(W, { url: u, readyState: 3, protocol: "", extensions: "", bufferedAmount: 0, binaryType: "blob",
      CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3, send: noop, close: noop }, ["error", "close"]); },
    EventSource: function (W, u) { return makeFake(W, { url: u, readyState: 2, withCredentials: false, CONNECTING: 0, OPEN: 1, CLOSED: 2, close: noop }, ["error"]); },
    Worker: function (W) { return makeFake(W, { postMessage: noop, terminate: noop }, ["error"]); },
    SharedWorker: function (W) { return makeFake(W, { port: makeFake(W, { postMessage: noop, start: noop, close: noop }, []) }, ["error"]); }
  };
  function wrapCtor(W, name, type, strict) {
    var Nat = W[name];
    if (typeof Nat !== "function") return;
    var Wrapped = function (url, o) {
      var u = toUrl(url), r = strict ? beaconRule(u) : blockedRule(u);
      if (r) { record(type, u, r, "dropped"); return FAKES[name](W, u); }
      noteHost(u, type);
      return arguments.length > 1 ? new Nat(url, o) : new Nat(url);
    };
    Wrapped.prototype = Nat.prototype;
    var statics = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    for (var i = 0; i < statics.length; i++) if (statics[i] in Nat) Wrapped[statics[i]] = Nat[statics[i]];
    try { W[name] = Wrapped; } catch (e) {}
  }

  function patchPrototypes(W) {
    function WP(name) { return W[name] && W[name].prototype; }
    var D = WP("Document"), E = W.Element.prototype, N = WP("Node"), i;

    // Element URL properties: covers createElement, new Image(), cloneNode…
    acc(WP("HTMLScriptElement"), "src", "data-gdrock-src", onScriptSrc);
    acc(WP("HTMLIFrameElement"), "src", "data-gdrock-src", onIframeSrc);
    acc(WP("HTMLIFrameElement"), "srcdoc", null, function (el, v) { return bootSrcdoc(v); });
    acc(WP("HTMLLinkElement"), "href", "data-gdrock-href", onLinkHref);
    acc(WP("HTMLImageElement"), "src", null, onPixel);
    acc(WP("HTMLImageElement"), "srcset", null, onSrcset);
    acc(WP("HTMLSourceElement"), "src", null, onPixel);
    acc(WP("HTMLSourceElement"), "srcset", null, onSrcset);
    acc(WP("HTMLMediaElement"), "src", null, onMedia);
    acc(WP("HTMLVideoElement"), "poster", null, onMedia);
    acc(WP("HTMLTrackElement"), "src", null, onMedia);
    acc(WP("HTMLAnchorElement"), "ping", null, onPing);
    acc(WP("HTMLAreaElement"), "ping", null, onPing);
    afterGet(WP("HTMLIFrameElement"), "contentWindow", function (w) { if (w) patchRealm(w); });
    afterGet(WP("HTMLIFrameElement"), "contentDocument", function (d) { if (d && d.defaultView) patchRealm(d.defaultView); });

    // Attribute writes, in all their forms.
    var nSet = E.setAttribute, nSetNS = E.setAttributeNS;
    E.setAttribute = function (name, value) {
      var v = attrFilter(this, String(name).toLowerCase(), value);
      if (v === SKIP) return;
      return nSet.call(this, name, v);
    };
    if (nSetNS) E.setAttributeNS = function (ns, name, value) {
      var q = String(name), v = attrFilter(this, q.slice(q.indexOf(":") + 1).toLowerCase(), value);
      if (v === SKIP) return;
      return nSetNS.call(this, ns, name, v);
    };
    var nodeSetters = ["setAttributeNode", "setAttributeNodeNS"];
    for (i = 0; i < nodeSetters.length; i++) (function (nat) {
      if (typeof nat !== "function") return;
      E[nodeSetters[i]] = function (a) {
        if (a && a.name) {
          var v = attrFilter(this, String(a.name).toLowerCase().replace(/^.*:/, ""), a.value);
          if (v === SKIP) return null;
          if (v !== a.value && nativeAttrValue) nativeAttrValue.set.call(a, v);
        }
        return nat.apply(this, arguments);
      };
    })(E[nodeSetters[i]]);
    acc(WP("Attr"), "value", null, function (a, v) {
      var el = a.ownerElement;
      return el ? attrFilter(el, String(a.name).toLowerCase().replace(/^.*:/, ""), v) : v;
    });

    // HTML strings.
    var htmlSet = function (el, v) {
      if (el.nodeName === "STYLE") return cleanCSS(v, true);
      if (el.nodeName === "SCRIPT" || el.nodeName === "TEXTAREA") return v;
      return rewriteHTML(v, false);
    };
    acc(E, "innerHTML", null, htmlSet);
    acc(E, "outerHTML", null, htmlSet);
    acc(WP("ShadowRoot"), "innerHTML", null, htmlSet);
    wrapArgs(E, "insertAdjacentHTML", 1, function (v) { return rewriteHTML(v, false); });
    wrapArgs(E, "setHTMLUnsafe", 0, function (v) { return rewriteHTML(v, false); });
    wrapArgs(WP("ShadowRoot"), "setHTMLUnsafe", 0, function (v) { return rewriteHTML(v, false); });
    wrapArgs(WP("Range"), "createContextualFragment", 0, function (v) { return rewriteHTML(v, true); });
    wrapArgs(D, "write", -1, function (v) { return rewriteHTML(v, true); });
    wrapArgs(D, "writeln", -1, function (v) { return rewriteHTML(v, true); });
    var styleText = function (el, v) { return el.nodeName === "STYLE" ? cleanCSS(v, true) : v; };
    acc(N, "textContent", null, styleText);
    acc(WP("HTMLElement"), "innerText", null, styleText);

    // CSS from JavaScript.
    var CSD = WP("CSSStyleDeclaration");
    if (CSD) {
      wrapArgs(CSD, "setProperty", 1, function (v) { return cleanCSS(v, true); });
      var cssSet = function (s, v) { return cleanCSS(v, true); };
      var props = ["cssText", "background", "backgroundImage", "background-image", "borderImage", "border-image", "borderImageSource",
        "border-image-source", "listStyle", "list-style", "listStyleImage", "list-style-image", "content", "cursor",
        "mask", "maskImage", "mask-image", "webkitMaskImage", "WebkitMaskImage", "-webkit-mask-image"];
      var protos = [CSD, WP("CSS2Properties")];
      for (var p = 0; p < protos.length; p++) for (i = 0; i < props.length; i++) acc(protos[p], props[i], null, cssSet);
    }
    var SS = WP("CSSStyleSheet");
    wrapArgs(SS, "insertRule", 0, function (v) { return cleanCSS(v, true); });
    wrapArgs(SS, "replace", 0, function (v) { return cleanCSS(v, true); });
    wrapArgs(SS, "replaceSync", 0, function (v) { return cleanCSS(v, true); });

    // Insertion, import, adoption.
    var NI = ["appendChild", "insertBefore", "replaceChild"];
    for (i = 0; i < NI.length; i++) wrapInsert(N, NI[i]);
    var EI = ["append", "prepend", "after", "before", "replaceWith", "insertAdjacentElement"];
    for (i = 0; i < EI.length; i++) wrapInsert(E, EI[i]);
    wrapInsert(WP("DocumentFragment"), "append");
    wrapInsert(WP("DocumentFragment"), "prepend");
    var DI = ["importNode", "adoptNode"];
    for (i = 0; i < DI.length; i++) (function (nat) {
      if (typeof nat !== "function") return;
      D[DI[i]] = function () { var r = nat.apply(this, arguments); if (r && r.nodeType) inspectNode(r); return r; };
    })(D && D[DI[i]]);

    // Cookies.
    acc(desc(D, "cookie") ? D : WP("HTMLDocument"), "cookie", null, function (d, v) { return refuseCookie(v, "document.cookie") ? SKIP : v; });
    var CSP = WP("CookieStore");
    if (CSP && typeof CSP.set === "function") {
      var nCS = CSP.set;
      CSP.set = function (a) {
        var name = typeof a === "string" ? a : (a && a.name) || "", r = name ? cookieRule(String(name)) : null;
        if (r && !granted(r.category)) { record("cookie", name, r, "refused", "cookieStore"); return W.Promise.resolve(); }
        return nCS.apply(this, arguments);
      };
    }

    // Network APIs. Beacons are dropped, not queued: they describe a page
    // view that happened before consent.
    if (typeof W.fetch === "function") {
      var nFetch = W.fetch;
      W.fetch = function (input) {
        var r = beaconRule(input);
        if (r) {
          record("fetch", input, r, "dropped");
          // An empty 204 rather than a rejection: fire-and-forget code must
          // not surface an "Uncaught (in promise)" error.
          try { return W.Promise.resolve(new W.Response(null, { status: 204, statusText: "No Content" })); }
          catch (e) { return new W.Promise(noop); }
        }
        noteHost(input, "fetch");
        return nFetch.apply(this, arguments);
      };
    }
    var XP = WP("XMLHttpRequest");
    if (XP) {
      var nOpen = XP.open, nSend = XP.send;
      XP.open = function (method, url) {
        var r = beaconRule(url);
        this.__gdrockBlocked = r ? { url: toUrl(url), rule: r } : null;
        if (!r) noteHost(url, "xhr");
        return nOpen.apply(this, arguments);
      };
      XP.send = function () {
        var b = this.__gdrockBlocked;
        if (b) {
          var xhr = this;
          record("xhr", b.url, b.rule, "dropped");
          later(function () { fire(xhr, "error"); fire(xhr, "loadend"); });
          return;
        }
        return nSend.apply(this, arguments);
      };
    }
    var NP = WP("Navigator");
    if (NP && typeof NP.sendBeacon === "function") {
      var nBeacon = NP.sendBeacon;
      NP.sendBeacon = function (url) {
        var r = beaconRule(url);
        if (r) { record("beacon", url, r, "dropped"); return true; }
        noteHost(url, "beacon");
        return nBeacon.apply(this, arguments);
      };
    }
    wrapCtor(W, "WebSocket", "websocket", true);
    wrapCtor(W, "EventSource", "eventsource", true);
    wrapCtor(W, "Worker", "worker", false);
    wrapCtor(W, "SharedWorker", "worker", false);

    // <a ping> backstop: whatever set the attribute (a shadow root, a
    // framework writing it a way nothing above saw), a click can't send it.
    var onActivate = function (e) {
      if (granted("analytics") && granted("marketing")) return;
      var path = e.composedPath ? e.composedPath() : [e.target];
      for (var k = 0; k < path.length; k++) {
        var a = path[k];
        if (!a || (a.nodeName !== "A" && a.nodeName !== "AREA") || !a.getAttribute) continue;
        var s = splitPing(a.getAttribute("ping"));
        if (s.blocked) { origSetAttribute.call(a, "ping", s.keep); holdPing(a, s, "click"); }
        return;
      }
    };
    try { W.addEventListener("click", onActivate, true); W.addEventListener("auxclick", onActivate, true); } catch (e) {}
  }

  patchRealm(window);

  // ---------- Shopify Customer Privacy API ---------------------------------
  // Apps running in Shopify's pixel sandbox can't be reached by theme
  // scripts; Shopify's own consent state is what they obey.
  var shopify = { present: false, apiFound: false, loadRequested: false, updates: 0, lastSent: null, error: null,
    caughtAt: null, beforeChoice: null };

  function shopifyPayload() {
    return { analytics: granted("analytics"), marketing: granted("marketing"), preferences: granted("analytics"), sale_of_data: granted("marketing") };
  }
  function safeCall(o, fn) { try { return typeof o[fn] === "function" ? o[fn]() : null; } catch (e) { return null; } }
  function shopifyView(cp) {
    return { marketingAllowed: safeCall(cp, "marketingAllowed"), analyticsAllowed: safeCall(cp, "analyticsProcessingAllowed"),
      region: safeCall(cp, "getRegion"), shouldShowBanner: safeCall(cp, "shouldShowBanner") };
  }
  function shopifyApply(S) {
    var cp = S.customerPrivacy;
    if (!cp || typeof cp.setTrackingConsent !== "function") { shopify.error = "Shopify.customerPrivacy.setTrackingConsent not available"; return false; }
    shopify.apiFound = true;
    // What Shopify thought of this visitor before anyone had chosen.
    if (!state && !shopify.beforeChoice) shopify.beforeChoice = shopifyView(cp);
    var payload = shopifyPayload(), key = JSON.stringify(payload);
    // The trap can reach the same API twice (loadFeatures' callback and the
    // customerPrivacy assignment); Shopify hears each choice once.
    if (cp === shopify.sentTo && key === shopify.sentKey) return true;
    shopify.sentTo = cp;
    shopify.sentKey = key;
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
    return true;
  }
  function shopifySync() {
    var S = window.Shopify;
    if (!S || typeof S !== "object") return;
    shopify.present = true;
    if (S.customerPrivacy && typeof S.customerPrivacy.setTrackingConsent === "function") { shopifyApply(S); return; }
    if (typeof S.loadFeatures === "function") {
      if (shopify.loadRequested) return; // the callback applies
      shopify.loadRequested = true;
      try {
        S.loadFeatures([{ name: "consent-tracking-api", version: "0.1" }], function (err) {
          if (err) { shopify.error = "loadFeatures: " + String(err && err.message || err); return; }
          shopifyApply(S);
        });
      } catch (e) { shopify.error = String(e && e.message || e); }
      return;
    }
    shopify.error = "window.Shopify has no loadFeatures or customerPrivacy";
  }
  // Catch window.Shopify the moment Shopify's head script assigns it, and its
  // loadFeatures / customerPrivacy the moment they appear, then act right
  // after that script finishes — before the next script in <head> runs.
  function trap(obj, prop, onSet) {
    var d = desc(obj, prop);
    if (d && (!d.configurable || d.get || d.set)) return false;
    var value = d ? d.value : undefined;
    try {
      Object.defineProperty(obj, prop, { configurable: true, enumerable: true,
        get: function () { return value; },
        set: function (v) { value = v; onSet(v); } });
    } catch (e) { return false; }
    return true;
  }
  function watchShopify(S) {
    if (!S || typeof S !== "object" || S.__gdrockWatched) return;
    try { Object.defineProperty(S, "__gdrockWatched", { value: true }); } catch (e) {}
    shopify.present = true;
    if (!shopify.caughtAt) shopify.caughtAt = new Date().getTime() - T0;
    soon(shopifySync);
    trap(S, "loadFeatures", function () { soon(shopifySync); });
    trap(S, "customerPrivacy", function () { soon(shopifySync); });
  }
  trap(window, "Shopify", watchShopify);
  if (window.Shopify) watchShopify(window.Shopify);

  function onParsed() {
    sweepTagged(document);
    if (window.Shopify) { watchShopify(window.Shopify); if (!shopify.apiFound) shopifySync(); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onParsed);
  else onParsed();

  // ---------- withdrawal ---------------------------------------------------
  var withdrawal = null;
  try { withdrawal = JSON.parse(sessionStorage.getItem("gdrock_withdrawal")); sessionStorage.removeItem("gdrock_withdrawal"); } catch (e) {}

  // Expire a cookie on every host / path this page could have set it on.
  function expireCookie(name) {
    if (!nativeCookie) return;
    var parts = location.hostname.split("."), domains = [""], paths = ["/"], i;
    for (i = 0; i < parts.length - 1; i++) domains.push("; domain=." + parts.slice(i).join("."));
    domains.push("; domain=" + location.hostname);
    var segs = location.pathname.split("/");
    for (i = 2; i <= segs.length; i++) paths.push(segs.slice(0, i).join("/") || "/");
    for (i = 0; i < domains.length; i++) for (var j = 0; j < paths.length; j++) {
      try { nativeCookie.set.call(document, name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=" + paths[j] + domains[i]); } catch (e) {}
    }
  }
  function deleteTrackingCookies(cats) {
    var out = [], jar = nativeCookie ? String(nativeCookie.get.call(document) || "") : "";
    var names = jar.split(";");
    for (var i = 0; i < names.length; i++) {
      var n = cookieName(names[i]), r = n ? cookieRule(n) : null;
      if (r && cats[r.category] && out.indexOf(n) === -1) { expireCookie(n); out.push(n); }
    }
    return out;
  }
  function withdraw(prev) {
    var cats = {}, list = [];
    if (prev.analytics && !state.analytics) { cats.analytics = 1; list.push("analytics"); }
    if (prev.marketing && !state.marketing) { cats.marketing = 1; list.push("marketing"); }
    if (!list.length) return;
    withdrawal = { at: new Date().toISOString(), categories: list, cookiesDeleted: deleteTrackingCookies(cats), reloaded: RELOAD_ON_WITHDRAW };
    try { sessionStorage.setItem("gdrock_withdrawal", JSON.stringify(withdrawal)); } catch (e) {}
    // A tracker that already runs can't be unloaded; a reload starts clean.
    // The banner's consent log is sent with keepalive, so it survives this.
    if (RELOAD_ON_WITHDRAW) setTimeout(function () { location.reload(); }, 150);
  }

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

  function applyChange(prev) {
    pushConsentUpdate(state);
    release();
    shopifySync();
    fireChange();
    if (prev) withdraw(prev);
  }

  var applying = false;
  function set(v) {
    v = v || {};
    var prev = state;
    var next = {
      analytics: "analytics" in v ? !!v.analytics : !!(state && state.analytics),
      marketing: "marketing" in v ? !!v.marketing : !!(state && state.marketing)
    };
    next.accepted = next.analytics || next.marketing;
    next.timestamp = new Date().toISOString();
    state = next;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
    applyChange(prev);
    // Notify the banner/site. Consent LOGGING stays owned by the banner
    // (gdrock.js saveConsent); the engine does not POST to /api/consent.
    applying = true;
    try { window.dispatchEvent(new CustomEvent("gdrock:consent", { detail: next })); }
    catch (e) {}
    applying = false;
    return get();
  }

  // The gdrock.js banner dispatches this after it saves — the engine reacts
  // without any banner change.
  window.addEventListener("gdrock:consent", function (e) {
    if (applying) return;
    var prev = state;
    var d = (e && e.detail) || loadStored() || {};
    state = {
      analytics: !!d.analytics,
      marketing: !!d.marketing,
      accepted: !!d.analytics || !!d.marketing,
      timestamp: d.timestamp || new Date().toISOString()
    };
    // The banner saves before it dispatches; saving here too means a choice
    // (and a withdrawal) survives the reload even if a sender didn't.
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (x) {}
    applyChange(prev);
  });

  // ---------- diagnostics ---------------------------------------------------
  function openTag(s) {
    var t = "<script";
    for (var i = 0; i < s.attributes.length; i++) t += " " + s.attributes[i].name + (s.attributes[i].value ? "=\"" + s.attributes[i].value + "\"" : "");
    return t + ">";
  }
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
        var m = res[j][0].exec(text);
        if (m) {
          out.push({ vendor: res[j][1], snippet: text.slice(Math.max(0, m.index - 40), m.index + 80).replace(/\s+/g, " "),
            openTag: openTag(s), starts: text.replace(/^\s+/, "").slice(0, 60) });
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

  var perfSeen = 0; // resource entries already counted (the buffer only grows)
  function unknownHosts() {
    try {
      var entries = window.performance && performance.getEntriesByType ? performance.getEntriesByType("resource") : [];
      if (entries.length < perfSeen) perfSeen = 0; // the page cleared the buffer
      for (var i = perfSeen; i < entries.length; i++) noteHost(entries[i].name, entries[i].initiatorType || "resource");
      perfSeen = entries.length;
    } catch (e) {}
    var out = [];
    for (var h in hosts) if (hosts.hasOwnProperty(h) && !hosts[h].known) out.push({ host: h, count: hosts[h].count, via: hosts[h].via.slice(), droppedByStrict: hosts[h].dropped });
    out.sort(function (a, b) { return b.count - a.count; });
    return out;
  }

  function shopifyNow() {
    var S = window.Shopify, cp = S && S.customerPrivacy;
    return cp ? shopifyView(cp) : null;
  }
  // Trackable = Shopify said analytics or marketing was allowed, or that no
  // banner was needed, while this visitor had not chosen anything.
  function shopifyTrackableBeforeChoice() {
    var b = shopify.beforeChoice, n = !state ? shopifyNow() : null, hits = [];
    var views = [b, n];
    for (var i = 0; i < views.length; i++) {
      var v = views[i];
      if (!v) continue;
      if (v.marketingAllowed === true && hits.indexOf("marketingAllowed() = true") === -1) hits.push("marketingAllowed() = true");
      if (v.analyticsAllowed === true && hits.indexOf("analyticsProcessingAllowed() = true") === -1) hits.push("analyticsProcessingAllowed() = true");
      if (v.shouldShowBanner === false && hits.indexOf("shouldShowBanner() = false") === -1) hits.push("shouldShowBanner() = false");
    }
    return hits.length ? { signals: hits, region: (b && b.region) || (n && n.region) || null } : null;
  }

  function diagnostics() {
    var byCat = { analytics: [], marketing: [] }, counts = { held: 0, released: 0, dropped: 0, refused: 0, loadedByClick: 0 }, i;
    var cookies = [];
    for (i = 0; i < log.length; i++) {
      var e = log[i];
      (byCat[e.category] || (byCat[e.category] = [])).push({ type: e.type, vendor: e.vendor, url: e.url, action: e.action, via: e.via, ms: e.ms });
      if (e.action === "held") counts.held++;
      else if (e.action === "released") counts.released++;
      else if (e.action === "dropped") counts.dropped++;
      else if (e.action === "refused") { counts.refused++; if (cookies.indexOf(e.url) === -1) cookies.push(e.url); }
      else if (e.action === "loaded by click") counts.loadedByClick++;
    }
    var inline = inlineUntagged(), fonts = fontsSeen(), embeds = embedsSeen(), unknown = unknownHosts();
    var fromHtml = [], seenHtml = {};
    for (i = 0; i < log.length; i++) {
      var l = log[i];
      if (l.via === "html" && (l.type === "script" || l.type === "img" || l.type === "iframe" || l.type === "link") && !seenHtml[l.url]) {
        seenHtml[l.url] = 1;
        fromHtml.push({ type: l.type, vendor: l.vendor, url: l.url, category: l.category });
      }
    }
    var trackable = shopify.present ? shopifyTrackableBeforeChoice() : null;

    var todo = [];
    if (!install.foundOwnTag) todo.push("GDRock could not identify its own <script> tag. Load it with a plain <script src> tag, not from another script.");
    if (install.async) todo.push("Remove async/defer from the GDRock script tag: it has to run before everything else.");
    var trackersFirst = [];
    for (i = 0; i < install.ranBefore.length; i++) if (install.ranBefore[i].tracker) trackersFirst.push(install.ranBefore[i].tracker);
    if (install.ranBefore.length) todo.push("Move the GDRock script above the " + install.ranBefore.length + " script(s) that ran before it" +
      (trackersFirst.length ? ", including " + trackersFirst.join(", ") + ", which ran unblocked" : "") + ".");
    for (i = 0; i < inline.length; i++) todo.push("Inline " + inline[i].vendor + " code runs before anyone can block it. Tag that <script> type=\"text/plain\" data-gdrock-category=\"" +
      inlineCategory(inline[i].vendor) + "\" so it waits for consent.");
    for (i = 0; i < fromHtml.length; i++) todo.push("The " + fromHtml[i].vendor + " " + fromHtml[i].type + " is written directly in the HTML, so the browser may fetch it once before GDRock can act. " +
      (fromHtml[i].type === "img" ? "Delete that <img> tag." : "Change src to data-gdrock-src" + (fromHtml[i].type === "script" ? " and add type=\"text/plain\"" : "") + "."));
    var fontProviders = {};
    for (i = 0; i < fonts.length; i++) fontProviders[fonts[i].provider] = 1;
    for (var fp in fontProviders) todo.push(fp + " are loaded from " + fp.split(" ")[0] + "'s servers, which sends every visitor's IP address there. Host the font files on your own server.");
    for (i = 0; i < embeds.length; i++) if (embeds[i].state === "loaded" && !granted("marketing")) todo.push("A " + embeds[i].provider + " embed loaded before consent. Add data-gdrock-embeds=\"click\" to the GDRock script tag for a click-to-load placeholder.");
    if (shopify.present && !shopify.apiFound) todo.push("This is a Shopify store but the Customer Privacy API could not be reached (" + (shopify.error || "not loaded yet") + "), so app pixels are not told about consent.");
    if (trackable) todo.push("Shopify treated this visitor as trackable before any choice (" + trackable.signals.join(", ") + (trackable.region ? ", region " + trackable.region : "") +
      "). App pixels can act on that before GDRock's signal arrives. In Shopify admin > Settings > Customer privacy, require consent for this region.");
    else if (shopify.present) todo.push("In Shopify admin > Settings > Customer privacy, require consent for your visitors' regions, so app pixels wait for GDRock's signal instead of Shopify's regional default.");
    if (unknown.length) todo.push(unknown.length + " third-party host(s) are not on GDRock's list: " + unknown.slice(0, 5).map(function (u) { return u.host; }).join(", ") +
      (unknown.length > 5 ? " and more" : "") + ". Check what each one is; strict mode (data-gdrock-strict=\"true\") drops their beacons until consent.");

    return {
      version: VERSION,
      siteId: SITE_ID || null,
      advancedConsentMode: ADVANCED,
      embedsClickToLoad: EMBEDS_CLICK,
      fontsToBunny: FONTS_BUNNY,
      strict: { on: STRICT, allow: ALLOW.slice() },
      install: { firstScript: install.firstScript, foundOwnTag: install.foundOwnTag, asyncOrDefer: install.async, ranBefore: install.ranBefore, tag: me ? me.outerHTML : null },
      consent: get(),
      blocked: byCat,
      counts: counts,
      cookiesRefused: cookies,
      stillHeld: held.length,
      framesPatched: framesPatched,
      untaggedInline: inline,
      fromHtml: fromHtml,
      fonts: fonts,
      fontRewrites: fontRewrites.slice(),
      embeds: embeds,
      unknownThirdParty: unknown,
      shopify: {
        present: shopify.present, apiFound: shopify.apiFound, loadRequested: shopify.loadRequested, caughtAtMs: shopify.caughtAt,
        updated: shopify.updates > 0, updates: shopify.updates, lastSent: shopify.lastSent, error: shopify.error,
        beforeChoice: shopify.beforeChoice, trackableBeforeChoice: trackable
      },
      withdrawal: withdrawal,
      manualWork: todo
    };
  }
  function inlineCategory(vendor) { return /Google Analytics|Google Tag Manager|Google tag|Hotjar|Clarity|Yandex/.test(vendor) ? "analytics" : "marketing"; }

  // ---------- install fixer -------------------------------------------------
  // diagnostics() turned into the exact edits a merchant (or we, on a DFY
  // install) make: what to find in the page source and what to put there.
  function installFix() {
    var d = diagnostics(), fixes = [], i, SRC = (me && me.getAttribute("src")) || "https://cdn.gdrock.com/gdrock.js";
    var cleanTag = "<script src=\"" + SRC + "\" data-site-id=\"" + (SITE_ID || "YOUR_SITE_ID") + "\"></script>";
    var snippet = "{%- comment -%} GDRock: keep this the first line inside <head>, above {{ content_for_header }} {%- endcomment -%}\n" + cleanTag;
    function add(f) { fixes.push(f); }
    function tagWith(extra) { return d.install.tag ? d.install.tag.replace(/<script\b/i, "<script " + extra) : null; }

    if (!d.install.firstScript) {
      var ran = [];
      for (i = 0; i < d.install.ranBefore.length; i++) ran.push(d.install.ranBefore[i].src || "inline: " + d.install.ranBefore[i].inline);
      add({ id: "install-first", title: "Make GDRock the first script in <head>",
        why: !d.install.foundOwnTag ? "GDRock was loaded by another script, so it cannot tell what ran before it." :
          d.install.asyncOrDefer ? "The tag is async/defer, so other scripts can run before it." :
          "These ran before GDRock and were not blocked: " + ran.join(" | "),
        where: shopify.present ? "Shopify: layout/theme.liquid" : "the <head> of every page",
        steps: shopify.present ? [
          "Online Store > Themes > (current theme) > Edit code.",
          "Add a snippet named gdrock-blocker (snippets/gdrock-blocker.liquid) containing the code under Replace.",
          "In layout/theme.liquid, put {% render 'gdrock-blocker' %} on the first line after <head>, above {{ content_for_header }}.",
          "Delete the old GDRock tag (under Find) wherever it is now."
        ] : ["Delete the tag under Find.", "Paste the tag under Replace as the first line after <head>, before any other <script>."],
        find: d.install.tag, replace: shopify.present ? snippet : cleanTag });
    }

    var klaviyo = null;
    for (i = 0; i < d.fromHtml.length; i++) {
      var h = d.fromHtml[i], u = h.url, m;
      if (shopify.present && h.type === "script" && (m = /static\.klaviyo\.com\/onsite\/js\/([A-Za-z0-9]+)/.exec(u) || /company_id=([A-Za-z0-9]+)/.exec(u)) && /klaviyo/i.test(u)) {
        if (klaviyo) continue;
        klaviyo = m[1];
        var ksrc = "https://static.klaviyo.com/onsite/js/" + klaviyo + "/klaviyo.js?company_id=" + klaviyo;
        add({ id: "shopify-klaviyo", title: "Klaviyo: switch off the app embed and paste a tagged snippet",
          why: "Shopify writes Klaviyo's app embed straight into the HTML, so the browser fetches klaviyo.js before any script can stop it and Klaviyo sees the visitor's IP.",
          where: "Shopify: theme editor + layout/theme.liquid",
          steps: ["Online Store > Themes > Customize > App embeds: switch off Klaviyo (Onsite Javascript) and save.",
            "In layout/theme.liquid, paste the code under Replace on the line after {% render 'gdrock-blocker' %}.",
            "Klaviyo sign-up forms then appear after the visitor allows marketing."],
          find: "<script async src=\"" + u + "\"></script>  (written by the Klaviyo app embed)",
          replace: "<script type=\"text/plain\" data-gdrock-category=\"marketing\" data-gdrock-src=\"" + ksrc + "\"></script>" });
        continue;
      }
      if (h.type === "img") {
        add({ id: "delete-pixel", title: "Delete the " + h.vendor + " image pixel from the HTML",
          why: "An <img> pixel written in the HTML is requested as the page parses. Its library sends its own hit after consent.",
          where: "page source", steps: ["Find the <img> tag with this address and delete it (including a <noscript> wrapper around it)."],
          find: "src=\"" + u + "\"", replace: "(delete the whole <img> tag)" });
      } else {
        add({ id: "tag-html", title: "Tag the " + h.vendor + " " + h.type + " written in the HTML",
          why: "The browser's preloader fetches it before any script runs, so the vendor sees the visitor's IP even though GDRock stops it from running.",
          where: "page source", steps: ["Replace the src attribute as shown. In the source, & in the address may be written as &amp;."],
          find: (h.type === "link" ? "href=\"" : "src=\"") + u + "\"",
          replace: (h.type === "script" ? "type=\"text/plain\" " : "") + "data-gdrock-category=\"" + h.category + "\" " + (h.type === "link" ? "data-gdrock-href=\"" : "data-gdrock-src=\"") + u + "\"" });
      }
    }

    for (i = 0; i < d.untaggedInline.length; i++) {
      var s = d.untaggedInline[i];
      add({ id: "tag-inline", title: "Tag the inline " + s.vendor + " code",
        why: "Inline code runs the moment it is parsed; only its type attribute can make it wait.",
        where: "page source: the <script> that starts with " + JSON.stringify(s.starts),
        steps: ["Replace that script's opening tag as shown. Keep its content unchanged."],
        find: s.openTag, replace: s.openTag.replace(/\s+type="[^"]*"/i, "").replace(/^<script/i, "<script type=\"text/plain\" data-gdrock-category=\"" + inlineCategory(s.vendor) + "\"") });
    }

    var fontSeen = {};
    for (i = 0; i < d.fonts.length; i++) {
      if (fontSeen[d.fonts[i].provider] || !/\/css2?\?|typekit\.net\/[a-z0-9]+\.css/i.test(d.fonts[i].url)) continue;
      fontSeen[d.fonts[i].provider] = 1;
      add({ id: "self-host-fonts", title: "Self-host the " + d.fonts[i].provider,
        why: "Every visitor's browser asks " + d.fonts[i].provider.split(" ")[0] + " for the font files, which sends it their IP address (LG München I, 3 O 17493/20).",
        where: "page source (or the theme's font settings)",
        steps: ["Download the font files (google-webfonts-helper does this for Google Fonts), put them on your own server, and load them with @font-face.",
          "Then replace the stylesheet link under Find with your own stylesheet."],
        find: "href=\"" + d.fonts[i].url + "\"", replace: "href=\"/fonts/fonts.css\"  (your self-hosted @font-face rules)" });
    }

    var loadedEmbed = false;
    for (i = 0; i < d.embeds.length; i++) if (d.embeds[i].state === "loaded" && !d.consent.marketing) loadedEmbed = true;
    if (loadedEmbed && !EMBEDS_CLICK && d.install.tag) {
      add({ id: "embeds-click", title: "Make video and map embeds click-to-load", why: "They load (and set cookies) before consent.",
        where: "the GDRock script tag", steps: ["Add the attribute shown."], find: d.install.tag, replace: tagWith("data-gdrock-embeds=\"click\"") });
    }

    if (d.shopify.present) {
      add({ id: "shopify-customer-privacy", title: "Shopify: require consent before app pixels run",
        why: d.shopify.trackableBeforeChoice ? "Before any choice, Shopify reported " + d.shopify.trackableBeforeChoice.signals.join(", ") +
          (d.shopify.trackableBeforeChoice.region ? " for region " + d.shopify.trackableBeforeChoice.region : "") + ", so app pixels may act on Shopify's own default." :
          "App pixels follow Shopify's regional default until GDRock's signal arrives.",
        where: "Shopify admin", steps: ["Settings > Customer privacy.", "Turn on consent collection (\"require consent\") for the regions you sell to.", "Save, then reload this page and run GDRock.diagnostics() again."] });
    }

    if (d.unknownThirdParty.length) {
      var hostList = [];
      for (i = 0; i < d.unknownThirdParty.length && i < 12; i++) hostList.push(d.unknownThirdParty[i].host);
      add({ id: "unknown-hosts", title: "Review " + d.unknownThirdParty.length + " third-party host(s) GDRock doesn't know",
        why: "GDRock blocks by list. These hosts were contacted and are not on it: " + hostList.join(", ") + ".",
        where: "the GDRock script tag",
        steps: ["Look each host up. Tell GDRock about any tracker so it joins the list.",
          "Optional: turn on strict mode to drop beacons to unlisted hosts until marketing consent. List the hosts the site needs (payments, reviews, chat) in data-gdrock-allow."],
        find: d.install.tag, replace: tagWith("data-gdrock-strict=\"true\" data-gdrock-allow=\"(hosts your site needs, space-separated)\"") });
    }

    var lines = ["GDRock install check: " + (fixes.length ? fixes.length + " fix(es)" : "nothing to fix") + " on " + location.hostname];
    for (i = 0; i < fixes.length; i++) {
      var f = fixes[i];
      lines.push("", (i + 1) + ". " + f.title, "   Why: " + f.why, "   Where: " + f.where);
      for (var k = 0; f.steps && k < f.steps.length; k++) lines.push("   - " + f.steps[k]);
      if (f.find) lines.push("   Find:    " + f.find);
      if (f.replace) lines.push("   Replace: " + f.replace);
    }
    return { fixes: fixes, text: lines.join("\n") };
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
  ns.installFix = installFix;
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

  // Merge-safe namespace: a later `window.GDRock = {...}` (the banner does
  // this) merges in instead of clobbering the consent API.
  var OWN = { consent: 1, diagnostics: 1, installFix: 1, blocker: 1 };
  try {
    Object.defineProperty(window, "GDRock", {
      configurable: true,
      get: function () { return ns; },
      set: function (v) {
        if (v && typeof v === "object") {
          for (var k in v) { if (!OWN[k]) ns[k] = v[k]; }
        }
      }
    });
  } catch (e) {
    window.GDRock = ns;
  }
})(window, document);

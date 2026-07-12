/*!
 * GDRock Script-Blocking Engine v1.0.0 — cdn.gdrock.com
 * ======================================================
 * Automatic script interception + Google Consent Mode v2.
 *
 * MUST be the FIRST script in <head> — before GTM/gtag, before any pixel
 * loader, before gdrock.js (the banner UI):
 *
 *   <script src="https://cdn.gdrock.com/gdrock-blocker.js" data-site-id="YOUR_ID"></script>
 *
 * What it does
 *   1. Holds any script whose URL matches the tracker blocklist (Meta Pixel,
 *      TikTok, GA4/GTM, common ad tags) until the matching consent category
 *      is granted. Covers dynamically injected scripts (createElement /
 *      setAttribute / .src assignment) AND parser-inserted external scripts
 *      in the initial HTML (MutationObserver).
 *   2. Reactivates publisher-tagged inline scripts:
 *        <script type="text/plain" data-gdrock-category="analytics">…</script>
 *      (the only spec-guaranteed way to gate inline scripts that are already
 *      in the initial HTML — the parser executes those synchronously, before
 *      any observer microtask can run).
 *   3. Google Consent Mode v2: defaults ad_storage / analytics_storage /
 *      ad_user_data / ad_personalization to 'denied' (wait_for_update: 500),
 *      updates per category on consent.
 *   4. Public API for the banner UI:
 *        window.GDRock.consent.get()            -> current consent state
 *        window.GDRock.consent.set({analytics, marketing})
 *        window.GDRock.consent.onChange(fn)     -> unsubscribe fn
 *      Backward compatible: window.GDRock.consent() still returns the state
 *      (the old gdrock.js exposed consent as a function).
 *
 * Interop with the live gdrock.js banner (no banner change needed):
 *   - shares the same localStorage key: gdrock_consent_<siteId>
 *   - listens for the banner's "gdrock:consent" CustomEvent and releases
 *     scripts / updates Consent Mode when the user chooses.
 *   - merge-safe window.GDRock: a later `window.GDRock = {...}` assignment
 *     (the current banner does exactly that) merges into the namespace
 *     instead of clobbering consent.get/set.
 *
 * Categories: "analytics" | "marketing". "necessary" is always granted.
 *
 * Optional attributes on the engine's own <script> tag:
 *   data-site-id="X"              site id (storage key suffix; matches banner)
 *   data-gdrock-advanced="true"   Advanced Consent Mode: do NOT hard-block
 *                                 Google tags (gtag/GTM/ads) — let them load
 *                                 with denied defaults and send cookieless
 *                                 pings. Default is OFF (hard block = the
 *                                 "nothing fires before consent" guarantee
 *                                 GDRock's verify rig checks for).
 *
 * Known limitations (documented, by design — see vault notes):
 *   - Inline parser scripts that are NOT tagged text/plain cannot be blocked.
 *   - document.write()-injected scripts are not intercepted.
 *   - Inline event handlers (onclick="fbq(...)") are not blocked; however the
 *     standard fbq/ttq/gtag stub snippets QUEUE such calls, and the queue
 *     flushes correctly when the real script is released after consent.
 *   - Consent revocation updates Consent Mode + storage but cannot unload an
 *     already-running tracker; a page reload is required (standard CMP
 *     behavior — the banner UI may choose to reload).
 */
(function (window, document) {
  "use strict";
  if (window.__gdrockBlocker) return;
  window.__gdrockBlocker = { version: "1.0.0" };

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

  // ---------- blocklist ----------------------------------------------------
  // Kept in sync with verify_consent.js TRACKERS — the engine must block
  // exactly what the rig detects. [urlSubstring, category, isGoogleTag]
  var BLOCKLIST = [
    // Google (exempted from hard-blocking in Advanced Consent Mode)
    ["googletagmanager.com", "analytics", true],
    ["google-analytics.com", "analytics", true],
    ["analytics.google.com", "analytics", true],
    ["doubleclick.net", "marketing", true],
    ["googleadservices.com", "marketing", true],
    ["googlesyndication.com", "marketing", true],
    // Analytics / session recording
    ["hotjar.com", "analytics", false],
    ["clarity.ms", "analytics", false],
    ["mouseflow.com", "analytics", false],
    ["fullstory.com", "analytics", false],
    // Ad / marketing pixels
    ["connect.facebook.net", "marketing", false],
    ["facebook.com/tr", "marketing", false],
    ["analytics.tiktok.com", "marketing", false],
    ["static.klaviyo.com", "marketing", false],
    ["klaviyo.com/onsite", "marketing", false],
    ["px.ads.linkedin.com", "marketing", false],
    ["snap.licdn.com", "marketing", false],
    ["ct.pinterest.com", "marketing", false],
    ["s.pinimg.com/ct", "marketing", false],
    ["sc-static.net", "marketing", false],
    ["tr.snapchat.com", "marketing", false],
    ["static.ads-twitter.com", "marketing", false],
    ["analytics.twitter.com", "marketing", false],
    ["criteo.com", "marketing", false],
    ["criteo.net", "marketing", false],
    ["bat.bing.com", "marketing", false],
    ["taboola.com", "marketing", false],
    ["outbrain.com", "marketing", false]
  ];

  function matchCategory(url) {
    if (!url) return null;
    var u = String(url).toLowerCase();
    for (var i = 0; i < BLOCKLIST.length; i++) {
      if (u.indexOf(BLOCKLIST[i][0]) !== -1) {
        if (ADVANCED && BLOCKLIST[i][2]) return null; // consent mode governs
        return BLOCKLIST[i][1];
      }
    }
    return null;
  }

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

  // ---------- held-script registry -----------------------------------------
  var held = []; // {el, src, text, category}

  function holdElement(el, url, cat) {
    origSetAttribute.call(el, "type", "text/plain");
    origSetAttribute.call(el, "data-gdrock-held", "1");
    if (url) origSetAttribute.call(el, "data-gdrock-src", url);
    origSetAttribute.call(el, "data-gdrock-category", cat);
    held.push({ el: el, src: url || null, text: null, category: cat });
  }

  function activate(h) {
    var el = h.el;
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
        origSetAttribute.call(s, "src", h.src);
      } else if (h.text != null) {
        s.text = h.text;
      }
      el.parentNode.insertBefore(s, el);
      el.parentNode.removeChild(el);
    } else if (h.src) {
      // Created but never inserted by the site: restore quietly so it runs
      // IF the site inserts it later — never self-insert on its behalf.
      el.removeAttribute("type");
      el.removeAttribute("data-gdrock-held");
      el.removeAttribute("data-gdrock-src");
      el.removeAttribute("data-gdrock-category");
      try { delete el.src; } catch (e) {} // drop per-instance accessor
      origSetAttribute.call(el, "src", h.src);
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

  // ---------- interception: dynamically created scripts --------------------
  var origCreateElement = Document.prototype.createElement;
  var origSetAttribute = Element.prototype.setAttribute;
  var nativeSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");

  Document.prototype.createElement = function (name) {
    var el = origCreateElement.apply(this, arguments);
    if (el && el.nodeName === "SCRIPT") hookScript(el);
    return el;
  };

  function hookScript(el) {
    try {
      Object.defineProperty(el, "src", {
        configurable: true,
        get: function () {
          return el.getAttribute("data-gdrock-src") || nativeSrc.get.call(el);
        },
        set: function (v) {
          var cat = matchCategory(v);
          if (cat && !granted(cat)) { holdElement(el, String(v), cat); return; }
          nativeSrc.set.call(el, v);
        }
      });
    } catch (e) { /* locked-down env: setAttribute + observer paths still cover */ }
  }

  Element.prototype.setAttribute = function (name, value) {
    if (this.nodeName === "SCRIPT" && String(name).toLowerCase() === "src") {
      var cat = matchCategory(value);
      if (cat && !granted(cat)) { holdElement(this, String(value), cat); return; }
    }
    return origSetAttribute.apply(this, arguments);
  };

  // ---------- interception: parser-inserted / third-party-injected ---------
  // External scripts only: their fetch yields a microtask gap the observer
  // wins. Inline parser scripts execute synchronously before observers run —
  // those must use the tagged text/plain path.
  function inspectNode(node) {
    if (node.nodeType !== 1 || node.nodeName !== "SCRIPT") return;
    if (node.getAttribute("data-gdrock-held")) return; // ours
    var type = (node.getAttribute("type") || "").toLowerCase();
    if (type === "text/plain") { registerTagged(node); return; }
    var url = node.getAttribute("src");
    var cat = matchCategory(url);
    if (!cat || granted(cat)) return;
    // Neutralize before evaluation: belt (type) + braces (remove from DOM),
    // leaving an inert placeholder that preserves position + attributes.
    origSetAttribute.call(node, "type", "text/plain");
    var ph = origCreateElement.call(document, "script");
    for (var i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i];
      if (a.name === "src" || a.name === "type") continue;
      origSetAttribute.call(ph, a.name, a.value);
    }
    holdElement(ph, url, cat);
    if (node.parentNode) {
      node.parentNode.insertBefore(ph, node);
      node.parentNode.removeChild(node);
    }
  }

  // Publisher-tagged scripts: <script type="text/plain"
  //   data-gdrock-category="analytics|marketing" [src=… | inline code]>
  function registerTagged(node) {
    if (node.getAttribute("data-gdrock-held")) return;
    var cat = node.getAttribute("data-gdrock-category");
    if (!cat && !node.getAttribute("data-gdrock-src")) return; // unrelated text/plain
    cat = cat === "analytics" ? "analytics" : "marketing"; // safe default
    var url = node.getAttribute("data-gdrock-src") || node.getAttribute("src") || null;
    origSetAttribute.call(node, "data-gdrock-held", "1");
    origSetAttribute.call(node, "data-gdrock-category", cat);
    var rec = { el: node, src: url, text: url ? null : node.text, category: cat };
    if (granted(cat)) activate(rec);
    else held.push(rec);
  }

  new MutationObserver(function (muts) {
    for (var m = 0; m < muts.length; m++) {
      var added = muts[m].addedNodes;
      for (var n = 0; n < added.length; n++) inspectNode(added[n]);
    }
  }).observe(document.documentElement || document, { childList: true, subtree: true });

  // Sweep anything already parsed before the engine ran (engine should be the
  // first script, but don't depend on it), and re-sweep at DOMContentLoaded
  // for tagged scripts in case the observer was attached late.
  function sweepTagged() {
    var list = document.querySelectorAll('script[type="text/plain"]');
    for (var i = 0; i < list.length; i++) registerTagged(list[i]);
  }
  sweepTagged();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", sweepTagged);
  }

  // ---------- public API ----------------------------------------------------
  var listeners = [];
  function fireChange(c) {
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
    pushConsentUpdate(next);
    release();
    fireChange(next);
    // Notify the banner/site. NOTE: the engine does NOT POST to
    // /api/consent — consent logging stays owned by the banner (gdrock.js
    // saveConsent), out of this module's scope.
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
    pushConsentUpdate(state);
    release();
    fireChange(state);
  });

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
  ns.blocker = {
    version: "1.0.0",
    // Agencies/tests can extend the blocklist before trackers load.
    add: function (pattern, category) {
      BLOCKLIST.push([String(pattern).toLowerCase(), category === "analytics" ? "analytics" : "marketing", false]);
    },
    held: function () {
      var out = [];
      for (var i = 0; i < held.length; i++) {
        out.push({ src: held[i].src, category: held[i].category, inline: held[i].src == null });
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
          for (var k in v) { if (k !== "consent") ns[k] = v[k]; }
        }
      }
    });
  } catch (e) {
    window.GDRock = ns;
  }
})(window, document);

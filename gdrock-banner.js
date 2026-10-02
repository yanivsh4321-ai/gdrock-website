/*!
 * GDRock Cookie Banner v2.0.0 — cdn.gdrock.com
 * ==============================================
 * The consent UI. Served by the worker as the second half of /gdrock.js, right
 * after the blocker (gdrock-blocker.js), so one tag installs both:
 *
 *   <script src="https://cdn.gdrock.com/gdrock.js" data-site-id="YOUR_ID"></script>
 *
 * First in <head>, not async (the blocker half needs that). The banner itself
 * waits for the page to parse.
 *
 * What the visitor gets
 *   - First screen: "Reject all" and "Accept all" side by side, same size, same
 *     style, at every width, plus "Customize". Nothing is pre-ticked.
 *   - Customize: Necessary (always on), Analytics, Marketing — off unless the
 *     visitor turned them on before.
 *   - After a choice, a small "Cookie settings" button (bottom left) reopens
 *     the choices. Any element with data-gdrock-manage, class gdrock-manage or
 *     href="#gdrock-manage" does the same, and window.GDRock.manage() too.
 *   - Taking consent back is as easy as giving it; the blocker then deletes
 *     that category's tracking cookies and reloads the page.
 *   - Keyboard: real buttons and switches, visible focus, Escape closes the
 *     settings it opened, focus returns where it came from. The banner is
 *     first in the tab order. WCAG AA contrast is enforced on the merchant's
 *     own colours (text colour is corrected when the pair fails 4.5:1).
 *   - Language: data-lang, else <html lang>, else the browser.
 *     en, de, fr, nl, es, it, he.
 *
 * Attributes on the script tag
 *   data-site-id="X"         required; matches the blocker's storage key
 *   data-api="https://…"     API origin (default https://cdn.gdrock.com);
 *                            "off" = self-hosted (Core Pack): no config
 *                            request and no consent log, nothing leaves the site
 *   data-lang="de"           force a language
 *   data-policy-url="/…"     privacy policy link in the banner (else the
 *                            saved config, else a privacy link found on the page)
 *   data-manage-button="off" no floating button (the site links to
 *                            #gdrock-manage itself)
 *   data-branding="off"      no "Consent by GDRock" line (white-label)
 *
 * Contract with the blocker (unchanged): localStorage gdrock_consent_<siteId>
 * = {accepted, analytics, marketing, timestamp}; a "gdrock:consent" event
 * with that record after every choice; window.GDRock stays merge-safe and
 * consent.get/set/onChange stay the blocker's.
 */
(function () {
  "use strict";
  var SCRIPT = document.currentScript || (function () { var s = document.getElementsByTagName("script"); return s[s.length - 1]; })();
  function opt(n) { return SCRIPT ? SCRIPT.getAttribute(n) : null; }
  var SITE_ID = opt("data-site-id");
  if (!SITE_ID) { if (window.console) console.warn("[GDRock] Missing data-site-id"); return; }
  var API_BASE = String(opt("data-api") != null ? opt("data-api") : "https://cdn.gdrock.com").replace(/\/+$/, "");
  var API_OFF = API_BASE === "off";
  var STORAGE_KEY = "gdrock_consent_" + SITE_ID;
  var MANAGE_BUTTON = opt("data-manage-button") !== "off";
  var BRANDING = opt("data-branding") !== "off";

  // ---------- language ------------------------------------------------------
  var I18N = {
    en: { title: "We use cookies",
      desc: "Necessary cookies keep this site running. With your permission we also use analytics cookies to understand how the site is used, and marketing cookies to measure and personalise ads. You can change your choice at any time.",
      reject: "Reject all", accept: "Accept all", customize: "Customize", save: "Save my choices", back: "Back",
      necessary: "Necessary", necessaryDesc: "Needed for the site to work, such as your basket and remembering this choice.", alwaysOn: "Always on",
      analytics: "Analytics", analyticsDesc: "Counts visits and shows how the site is used, so it can be improved.",
      marketing: "Marketing", marketingDesc: "Measures ads and lets advertising partners show you relevant ads.",
      manage: "Cookie settings", policy: "Privacy policy", close: "Close", poweredBy: "Consent by GDRock", settingsTitle: "Your cookie choices" },
    de: { title: "Wir verwenden Cookies",
      desc: "Notwendige Cookies halten diese Website am Laufen. Mit Ihrer Einwilligung nutzen wir außerdem Analyse-Cookies, um zu verstehen, wie die Website genutzt wird, und Marketing-Cookies, um Werbung zu messen und zu personalisieren. Sie können Ihre Wahl jederzeit ändern.",
      reject: "Alle ablehnen", accept: "Alle akzeptieren", customize: "Anpassen", save: "Auswahl speichern", back: "Zurück",
      necessary: "Notwendig", necessaryDesc: "Für den Betrieb der Website nötig, etwa für den Warenkorb und um diese Auswahl zu speichern.", alwaysOn: "Immer aktiv",
      analytics: "Analyse", analyticsDesc: "Zählt Besuche und zeigt, wie die Website genutzt wird, damit sie verbessert werden kann.",
      marketing: "Marketing", marketingDesc: "Misst Werbung und lässt Werbepartner Ihnen passende Anzeigen zeigen.",
      manage: "Cookie-Einstellungen", policy: "Datenschutzerklärung", close: "Schließen", poweredBy: "Einwilligung über GDRock", settingsTitle: "Ihre Cookie-Auswahl" },
    fr: { title: "Nous utilisons des cookies",
      desc: "Les cookies nécessaires font fonctionner ce site. Avec votre accord, nous utilisons aussi des cookies de mesure d'audience pour comprendre comment le site est utilisé, et des cookies marketing pour mesurer et personnaliser la publicité. Vous pouvez changer d'avis à tout moment.",
      reject: "Tout refuser", accept: "Tout accepter", customize: "Personnaliser", save: "Enregistrer mes choix", back: "Retour",
      necessary: "Nécessaires", necessaryDesc: "Indispensables au fonctionnement du site, par exemple pour votre panier et pour mémoriser ce choix.", alwaysOn: "Toujours actifs",
      analytics: "Mesure d'audience", analyticsDesc: "Compte les visites et montre comment le site est utilisé, pour pouvoir l'améliorer.",
      marketing: "Marketing", marketingDesc: "Mesure la publicité et permet à nos partenaires publicitaires de vous montrer des annonces pertinentes.",
      manage: "Paramètres des cookies", policy: "Politique de confidentialité", close: "Fermer", poweredBy: "Consentement géré par GDRock", settingsTitle: "Vos choix de cookies" },
    nl: { title: "Wij gebruiken cookies",
      desc: "Noodzakelijke cookies houden deze website draaiende. Met uw toestemming gebruiken we ook analytische cookies om te begrijpen hoe de site wordt gebruikt, en marketingcookies om advertenties te meten en te personaliseren. U kunt uw keuze altijd wijzigen.",
      reject: "Alles weigeren", accept: "Alles accepteren", customize: "Aanpassen", save: "Keuze opslaan", back: "Terug",
      necessary: "Noodzakelijk", necessaryDesc: "Nodig om de website te laten werken, bijvoorbeeld voor uw winkelmand en om deze keuze te onthouden.", alwaysOn: "Altijd aan",
      analytics: "Analytisch", analyticsDesc: "Telt bezoeken en laat zien hoe de site wordt gebruikt, zodat hij beter kan worden.",
      marketing: "Marketing", marketingDesc: "Meet advertenties en laat advertentiepartners u relevante advertenties tonen.",
      manage: "Cookie-instellingen", policy: "Privacyverklaring", close: "Sluiten", poweredBy: "Toestemming via GDRock", settingsTitle: "Uw cookiekeuze" },
    es: { title: "Usamos cookies",
      desc: "Las cookies necesarias hacen funcionar este sitio. Con tu permiso, también usamos cookies analíticas para entender cómo se usa el sitio y cookies de marketing para medir y personalizar la publicidad. Puedes cambiar tu elección en cualquier momento.",
      reject: "Rechazar todo", accept: "Aceptar todo", customize: "Configurar", save: "Guardar mi elección", back: "Volver",
      necessary: "Necesarias", necessaryDesc: "Imprescindibles para que el sitio funcione, por ejemplo para tu cesta y para recordar esta elección.", alwaysOn: "Siempre activas",
      analytics: "Analíticas", analyticsDesc: "Cuentan las visitas y muestran cómo se usa el sitio, para poder mejorarlo.",
      marketing: "Marketing", marketingDesc: "Miden la publicidad y permiten a nuestros socios publicitarios mostrarte anuncios relevantes.",
      manage: "Configuración de cookies", policy: "Política de privacidad", close: "Cerrar", poweredBy: "Consentimiento gestionado por GDRock", settingsTitle: "Tus preferencias de cookies" },
    it: { title: "Utilizziamo i cookie",
      desc: "I cookie necessari fanno funzionare questo sito. Con il tuo consenso usiamo anche cookie analitici per capire come viene usato il sito e cookie di marketing per misurare e personalizzare la pubblicità. Puoi cambiare la tua scelta in qualsiasi momento.",
      reject: "Rifiuta tutto", accept: "Accetta tutto", customize: "Personalizza", save: "Salva le mie scelte", back: "Indietro",
      necessary: "Necessari", necessaryDesc: "Indispensabili per il funzionamento del sito, ad esempio per il carrello e per ricordare questa scelta.", alwaysOn: "Sempre attivi",
      analytics: "Analitici", analyticsDesc: "Contano le visite e mostrano come viene usato il sito, per migliorarlo.",
      marketing: "Marketing", marketingDesc: "Misurano la pubblicità e permettono ai partner pubblicitari di mostrarti annunci pertinenti.",
      manage: "Impostazioni cookie", policy: "Informativa sulla privacy", close: "Chiudi", poweredBy: "Consenso gestito da GDRock", settingsTitle: "Le tue scelte sui cookie" },
    he: { title: "אנחנו משתמשים בעוגיות",
      desc: "עוגיות הכרחיות מפעילות את האתר. בהסכמתך נשתמש גם בעוגיות ניתוח כדי להבין איך משתמשים באתר, ובעוגיות שיווק כדי למדוד ולהתאים פרסום. אפשר לשנות את הבחירה בכל עת.",
      reject: "דחייה של הכל", accept: "אישור של הכל", customize: "התאמה אישית", save: "שמירת הבחירה", back: "חזרה",
      necessary: "הכרחיות", necessaryDesc: "נדרשות לפעולת האתר, למשל לסל הקניות ולשמירת הבחירה הזו.", alwaysOn: "תמיד פעילות",
      analytics: "ניתוח", analyticsDesc: "סופרות ביקורים ומראות איך משתמשים באתר, כדי שאפשר יהיה לשפר אותו.",
      marketing: "שיווק", marketingDesc: "מודדות פרסום ומאפשרות לשותפי פרסום להציג לך מודעות רלוונטיות.",
      manage: "הגדרות עוגיות", policy: "מדיניות פרטיות", close: "סגירה", poweredBy: "הסכמה באמצעות GDRock", settingsTitle: "הבחירות שלך לגבי עוגיות" }
  };
  function pickLang() {
    var tries = [opt("data-lang"), document.documentElement.getAttribute("lang")];
    var nav = navigator.languages || [navigator.language || navigator.userLanguage || ""];
    for (var i = 0; i < nav.length; i++) tries.push(nav[i]);
    for (i = 0; i < tries.length; i++) {
      var l = String(tries[i] || "").toLowerCase().slice(0, 2);
      if (l === "iw") l = "he";
      if (I18N[l]) return l;
    }
    return "en";
  }
  var LANG = pickLang();
  var T = I18N[LANG];
  var RTL = LANG === "he";

  // ---------- consent record --------------------------------------------------
  function loadConsent() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; } }
  function sendConsent(c) {
    if (API_OFF) return;
    try {
      fetch(API_BASE + "/api/consent", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_id: SITE_ID, accepted: c.accepted, analytics: c.analytics, marketing: c.marketing }), keepalive: true })
        .catch(function () {});
    } catch (e) {}
  }
  function saveConsent(c) {
    c.timestamp = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch (e) {}
    // Logged before the event: a withdrawal makes the blocker reload the page,
    // and keepalive lets this request finish across that reload.
    sendConsent(c);
    try { window.dispatchEvent(new CustomEvent("gdrock:consent", { detail: c })); } catch (e) {}
  }

  // ---------- colours and contrast --------------------------------------------
  function rgb(hex) {
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || "").replace(/\s/g, ""));
    if (!m) return null;
    var h = m[1].length === 3 ? m[1].replace(/(.)/g, "$1$1") : m[1];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function lum(c) {
    var a = [];
    for (var i = 0; i < 3; i++) { var v = c[i] / 255; a.push(v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); }
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function ratio(a, b) {
    var x = rgb(a), y = rgb(b);
    if (!x || !y) return 21;
    var l1 = lum(x), l2 = lum(y);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  // The merchant's text colour if it passes AA on that background, else
  // whichever of near-black / white reads better.
  function readable(fg, bg, min) {
    if (fg && rgb(fg) && ratio(fg, bg) >= (min || 4.5)) return fg;
    return ratio("#ffffff", bg) >= ratio("#0b1220", bg) ? "#ffffff" : "#0b1220";
  }
  function deepen(c) {
    for (var t = 0; t <= 0.4001; t += 0.04) { var d = t ? mix(c, "#000000", t) : c; if (ratio("#ffffff", d) >= 4.5) return d; }
    return null;
  }
  function mix(a, b, t) {
    var x = rgb(a), y = rgb(b);
    if (!x || !y) return a;
    var o = "#";
    for (var i = 0; i < 3; i++) { var v = Math.round(x[i] + (y[i] - x[i]) * t).toString(16); o += v.length < 2 ? "0" + v : v; }
    return o;
  }

  var config = { theme: "auto", accent: "#2563eb", bg: null, fg: null, radius: 16, logoSize: 28, titleSize: 17, customLogoB64: null };
  function num(v, lo, hi, d) { v = parseFloat(v); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; }
  function palette(cfg) {
    var dark = cfg.theme === "dark" || (cfg.theme !== "light" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var bg = rgb(cfg.bg) ? cfg.bg : (dark ? "#0b1220" : "#ffffff");
    var fg = readable(cfg.fg, bg);
    var muted = readable(mix(fg, bg, 0.28), bg);
    var accent = rgb(cfg.accentBtn) ? cfg.accentBtn : (rgb(cfg.accent) ? cfg.accent : "#2563eb"), onAccent;
    if (rgb(cfg.btntext) && ratio(cfg.btntext, accent) >= 4.5) onAccent = cfg.btntext;
    else {
      // Keep the brand's hue: deepen the accent until white text passes AA;
      // only a light accent that can't get there gets dark text instead.
      var deep = deepen(accent);
      if (deep) { accent = deep; onAccent = "#ffffff"; } else onAccent = readable(null, accent);
    }
    // A button must stand out from the banner too (WCAG 1.4.11, 3:1).
    var edge = ratio(accent, bg) >= 3 ? accent : fg;
    return { bg: bg, fg: fg, muted: muted, accent: accent, onAccent: onAccent, edge: edge,
      line: rgb(cfg.border) ? cfg.border : mix(fg, bg, 0.82), soft: mix(fg, bg, 0.92), dark: dark };
  }

  // ---------- styles ------------------------------------------------------------
  var CSS = "" +
    ".gdr,.gdr *{box-sizing:border-box}" +
    ".gdr{--r:16px;--br:10px;font:15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:var(--fg);-webkit-text-size-adjust:100%}" +
    ".gdr-panel{position:fixed;z-index:2147483646;left:var(--gap);right:var(--gap);bottom:var(--gap);max-width:var(--mw);margin:0 auto;background:var(--bg);color:var(--fg);" +
      "border:1px solid var(--line);border-radius:var(--r);box-shadow:0 24px 64px rgba(2,6,23,.34),0 2px 8px rgba(2,6,23,.16);padding:var(--pad);" +
      "max-height:calc(100vh - 2 * var(--gap));max-height:calc(100dvh - 2 * var(--gap));overflow-y:auto;overscroll-behavior:contain;" +
      "transform:translateY(16px);opacity:0;transition:transform .22s cubic-bezier(.2,.8,.2,1),opacity .18s ease-out}" +
    ".gdr-panel.gdr-in{transform:none;opacity:1}" +
    ".gdr[data-pos=left] .gdr-panel{right:auto;margin:0}.gdr[data-pos=right] .gdr-panel{left:auto;margin:0}" +
    ".gdr-noborder .gdr-panel{border-color:transparent}" +
    ".gdr-blur .gdr-panel{-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}" +
    ".gdr-head{display:flex;align-items:center;gap:10px;margin:0 0 8px}" +
    ".gdr-logo{width:var(--logo);height:var(--logo);object-fit:contain;flex:none;border-radius:6px}" +
    ".gdr-title{margin:0;font-size:var(--ts);line-height:1.25;font-weight:700;letter-spacing:-.01em;color:var(--fg)}" +
    ".gdr-desc{margin:0 0 16px;font-size:var(--bs);line-height:1.55;color:var(--muted)}" +
    ".gdr-desc a{color:var(--fg);text-decoration:underline;text-underline-offset:2px}" +
    ".gdr-foot a{color:var(--muted);text-decoration:underline;text-underline-offset:2px;text-decoration-thickness:1px}" +
    ".gdr-choice{display:grid;grid-template-columns:1fr 1fr;gap:10px}" +
    ".gdr-btn{display:flex;align-items:center;justify-content:center;min-height:46px;margin:0;padding:10px 12px;border-radius:var(--br);border:1px solid var(--edge);" +
      "background:var(--accent);color:var(--on-accent);font:inherit;font-size:15px;font-weight:650;line-height:1.2;text-align:center;cursor:pointer;" +
      "-webkit-appearance:none;appearance:none;transition:filter .15s ease-out,transform .1s ease-out;word-break:normal;overflow-wrap:anywhere}" +
    ".gdr-btn:hover{filter:brightness(1.08)}.gdr-btn:active{transform:scale(.98)}" +
    ".gdr-link{display:block;width:100%;margin:10px 0 0;padding:10px 4px;min-height:44px;background:none;border:0;color:var(--fg);font:inherit;font-size:14px;font-weight:600;" +
      "text-decoration:underline;text-underline-offset:3px;cursor:pointer;border-radius:8px}" +
    ".gdr :focus{outline:none}.gdr :focus-visible{outline:3px solid var(--fg);outline-offset:2px}" +
    ".gdr-cats{margin:4px 0 14px;padding:0;list-style:none}" +
    ".gdr-cat{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:12px 0;border-top:1px solid var(--line)}" +
    ".gdr-cat:first-child{border-top:0}" +
    ".gdr-cat label{flex:1;cursor:pointer}.gdr-cat-name{display:block;font-weight:650;font-size:15px}" +
    ".gdr-cat-desc{display:block;margin-top:2px;font-size:13px;line-height:1.45;color:var(--muted)}" +
    ".gdr-sw{position:relative;flex:none;width:46px;height:28px;margin-top:2px}" +
    ".gdr-sw input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer;z-index:1}" +
    ".gdr-sw span{position:absolute;inset:0;border-radius:28px;background:var(--soft);border:2px solid var(--muted);transition:background .15s,border-color .15s}" +
    ".gdr-sw span:before{content:'';position:absolute;width:18px;height:18px;left:3px;top:3px;border-radius:50%;background:var(--muted);transition:transform .15s ease-out,background .15s}" +
    ".gdr-sw input:checked+span{background:var(--accent);border-color:var(--edge)}" +
    ".gdr-sw input:checked+span:before{transform:translateX(18px);background:var(--on-accent)}" +
    ".gdr-sw input:disabled{cursor:not-allowed}.gdr-sw input:disabled+span{opacity:.6}" +
    ".gdr-sw input:focus-visible+span{outline:3px solid var(--fg);outline-offset:2px}" +
    ".gdr-always{font-size:12px;font-weight:650;color:var(--muted);white-space:nowrap;margin-top:6px}" +
    ".gdr-save{width:100%;margin:0 0 10px}" +
    ".gdr-foot{margin:12px 0 0;font-size:12px;color:var(--muted);text-align:center}" +
    ".gdr-x{position:absolute;top:10px;right:10px;width:44px;height:44px;border:0;border-radius:10px;background:none;color:var(--fg);font:inherit;font-size:22px;line-height:1;cursor:pointer}" +
    "[dir=rtl] .gdr-x{right:auto;left:10px}" +
    ".gdr-has-x .gdr-head{padding-right:40px}[dir=rtl] .gdr-has-x .gdr-head{padding-right:0;padding-left:40px}" +
    ".gdr-manage{position:fixed;z-index:2147483645;left:16px;bottom:16px;width:44px;height:44px;padding:0;border-radius:50%;border:1px solid var(--line);" +
      "background:var(--bg);color:var(--fg);box-shadow:0 6px 20px rgba(2,6,23,.22);cursor:pointer;display:flex;align-items:center;justify-content:center}" +
    "[dir=rtl].gdr-manage{left:auto;right:16px}" +
    ".gdr-manage svg{width:22px;height:22px}" +
    ".gdr-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}" +
    "@media (max-width:480px){.gdr-panel{--gap:8px !important;padding:18px 16px;border-radius:14px}.gdr-btn{font-size:14.5px;padding:10px 8px}}" +
    ".gdr-still .gdr-panel{transition:none;transform:none}" +
    "@media (prefers-reduced-motion:reduce){.gdr-panel{transition:none;transform:none}}";

  function injectCSS() {
    if (document.getElementById("gdrock-css")) return;
    var el = document.createElement("style");
    el.id = "gdrock-css";
    el.textContent = CSS;
    (document.head || document.documentElement).appendChild(el);
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]; }); }
  function policyUrl() {
    var u = opt("data-policy-url") || config.policyUrl;
    if (u) return u;
    var links = document.querySelectorAll("a[href]");
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute("href") || "", t = (links[i].textContent || "").toLowerCase();
      if (/privacy|datenschutz|confidentialit|privacidad|privacybeleid|informativa|privacy-policy/.test(h.toLowerCase() + " " + t)) return h;
    }
    return null;
  }

  // ---------- rendering ---------------------------------------------------------
  var root = null, manageBtn = null, returnFocus = null;
  var LOGO_SVG = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3l7 3v5c0 4.4-3 8.3-7 9.5C8 19.3 5 15.4 5 11V6l7-3z\"/><path d=\"M9.2 12.2l1.9 1.9 3.7-3.9\"/></svg>";

  function applyVars(el) {
    var p = palette(config), s = el.style;
    s.setProperty("--bg", p.bg); s.setProperty("--fg", p.fg); s.setProperty("--muted", p.muted);
    s.setProperty("--accent", p.accent); s.setProperty("--on-accent", p.onAccent); s.setProperty("--edge", p.edge);
    s.setProperty("--line", p.line); s.setProperty("--soft", p.soft);
    s.setProperty("--r", num(config.radius, 0, 32, 16) + "px");
    s.setProperty("--br", num(config.btnRadius, 0, 28, 10) + "px");
    s.setProperty("--ts", num(config.titleSize, 13, 26, 17) + "px");
    s.setProperty("--bs", num(config.bodySize, 12, 18, 14) + "px");
    s.setProperty("--logo", num(config.logoSize, 16, 64, 28) + "px");
    s.setProperty("--mw", num(config.maxWidth, 320, 760, 560) + "px");
    s.setProperty("--pad", num(config.padding, 12, 40, 22) + "px");
    s.setProperty("--gap", num(config.gap, 0, 40, 16) + "px");
  }

  function logoHtml() {
    var src = config.customLogoB64 && String(config.customLogoB64).length > 10 && /^data:image\/(png|jpe?g|gif|webp|svg\+xml);/i.test(config.customLogoB64) ? config.customLogoB64 : null;
    return src ? "<img class=\"gdr-logo\" src=\"" + esc(src) + "\" alt=\"\">" : "";
  }

  function build(view, opts) {
    close(true);
    injectCSS();
    var existing = loadConsent() || {};
    root = document.createElement("div");
    root.id = "gdrock-root";
    root.className = "gdr" + (config.showBorder === false ? " gdr-noborder" : "") + (config.blur === false ? "" : " gdr-blur") + (config.animate === false ? " gdr-still" : "");
    root.setAttribute("lang", LANG);
    root.setAttribute("dir", RTL ? "rtl" : "ltr");
    root.setAttribute("data-pos", config.position === "left" || config.position === "right" ? config.position : "center");
    applyVars(root);
    var pol = policyUrl();
    var h = "<div class=\"gdr-panel gdrock-banner" + (opts.closable ? " gdr-has-x" : "") + "\" role=\"dialog\" aria-modal=\"false\" aria-labelledby=\"gdr-t\" aria-describedby=\"gdr-d\">";
    if (opts.closable) h += "<button type=\"button\" class=\"gdr-x\" data-action=\"close\" aria-label=\"" + esc(T.close) + "\">&times;</button>";
    h += "<div class=\"gdr-head\">" + logoHtml() + "<h2 class=\"gdr-title\" id=\"gdr-t\">" + esc(view === "settings" ? T.settingsTitle : T.title) + "</h2></div>";
    h += "<p class=\"gdr-desc\" id=\"gdr-d\">" + esc(T.desc) + (pol ? " <a href=\"" + esc(pol) + "\">" + esc(T.policy) + "</a>" : "") + "</p>";
    if (view === "settings") {
      h += "<ul class=\"gdr-cats\">" +
        "<li class=\"gdr-cat\"><div><span class=\"gdr-cat-name\">" + esc(T.necessary) + "</span><span class=\"gdr-cat-desc\">" + esc(T.necessaryDesc) + "</span></div>" +
          "<span class=\"gdr-always\">" + esc(T.alwaysOn) + "</span></li>" +
        cat("analytics", T.analytics, T.analyticsDesc, existing.analytics === true) +
        cat("marketing", T.marketing, T.marketingDesc, existing.marketing === true) +
        "</ul>" +
        "<button type=\"button\" class=\"gdr-btn gdr-save\" data-action=\"save\">" + esc(T.save) + "</button>";
    }
    // The same two buttons, the same size and style, on every screen.
    h += "<div class=\"gdr-choice\"><button type=\"button\" class=\"gdr-btn\" data-action=\"reject\">" + esc(T.reject) + "</button>" +
      "<button type=\"button\" class=\"gdr-btn\" data-action=\"accept\">" + esc(T.accept) + "</button></div>";
    if (view !== "settings") h += "<button type=\"button\" class=\"gdr-link\" data-action=\"customize\">" + esc(T.customize) + "</button>";
    else if (!opts.closable) h += "<button type=\"button\" class=\"gdr-link\" data-action=\"back\">" + esc(T.back) + "</button>";
    var href = "https://gdrock.com/?utm_source=banner&utm_medium=poweredby&utm_campaign=site_" + encodeURIComponent(SITE_ID);
    if (BRANDING) h += "<p class=\"gdr-foot\"><a href=\"" + href + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + esc(T.poweredBy) + "</a></p>";
    h += "</div>";
    root.innerHTML = h;
    // First in the tab order, wherever it sits on screen.
    var body = document.body || document.documentElement;
    body.insertBefore(root, body.firstChild);
    var panel = root.firstChild;
    if (window.requestAnimationFrame) requestAnimationFrame(function () { requestAnimationFrame(function () { panel.className += " gdr-in"; }); });
    else panel.className += " gdr-in";
    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKey);
    if (opts.focus) {
      var first = view === "settings" ? root.querySelector("input[data-key]") : root.querySelector("[data-action=reject]");
      if (first) first.focus();
    }
    root.__view = view;
    root.__closable = !!opts.closable;
  }

  function cat(key, name, desc, checked) {
    var id = "gdr-" + key;
    return "<li class=\"gdr-cat\"><label for=\"" + id + "\"><span class=\"gdr-cat-name\">" + esc(name) + "</span><span class=\"gdr-cat-desc\">" + esc(desc) + "</span></label>" +
      "<span class=\"gdr-sw\"><input type=\"checkbox\" role=\"switch\" id=\"" + id + "\" data-key=\"" + key + "\"" + (checked ? " checked" : "") + "><span aria-hidden=\"true\"></span></span></li>";
  }

  function onClick(e) {
    var t = e.target;
    while (t && t !== root && !(t.getAttribute && t.getAttribute("data-action"))) t = t.parentNode;
    var a = t && t !== root ? t.getAttribute("data-action") : null;
    if (!a) return;
    if (a === "accept") finish({ accepted: true, analytics: true, marketing: true });
    else if (a === "reject") finish({ accepted: false, analytics: false, marketing: false });
    else if (a === "customize") build("settings", { focus: true, closable: false });
    else if (a === "back") build("first", { focus: true, closable: false });
    else if (a === "close") close(false);
    else if (a === "save") {
      var an = !!(root.querySelector("input[data-key=analytics]") || {}).checked, mk = !!(root.querySelector("input[data-key=marketing]") || {}).checked;
      finish({ accepted: an || mk, analytics: an, marketing: mk });
    }
  }
  function onKey(e) {
    if ((e.key === "Escape" || e.keyCode === 27) && root) {
      if (root.__closable) { e.preventDefault(); close(false); }
      else if (root.__view === "settings") { e.preventDefault(); build("first", { focus: true, closable: false }); }
    }
  }

  // Removes the panel. quiet: being replaced by another view.
  function close(quiet) {
    if (!root) return;
    var had = root.contains(document.activeElement);
    if (root.parentNode) root.parentNode.removeChild(root);
    root = null;
    if (quiet) return;
    showManage();
    var back = returnFocus && document.contains(returnFocus) ? returnFocus : manageBtn;
    returnFocus = null;
    if (had && back && back.focus) back.focus();
  }

  function finish(c) {
    saveConsent(c);
    close(false);
  }

  // After a choice: one small, labelled way back to the choices.
  function showManage() {
    if (!MANAGE_BUTTON || !loadConsent() || root) return;
    injectCSS();
    if (!manageBtn) {
      manageBtn = document.createElement("button");
      manageBtn.type = "button";
      manageBtn.className = "gdr gdr-manage";
      manageBtn.setAttribute("aria-label", T.manage);
      manageBtn.setAttribute("title", T.manage);
      manageBtn.setAttribute("lang", LANG);
      if (RTL) manageBtn.setAttribute("dir", "rtl");
      manageBtn.innerHTML = LOGO_SVG + "<span class=\"gdr-sr\">" + esc(T.manage) + "</span>";
      manageBtn.addEventListener("click", function () { openSettings(manageBtn); });
    }
    applyVars(manageBtn);
    if (!manageBtn.parentNode) (document.body || document.documentElement).appendChild(manageBtn);
  }

  function openSettings(from) {
    returnFocus = from && from.focus ? from : document.activeElement;
    if (manageBtn && manageBtn.parentNode) manageBtn.parentNode.removeChild(manageBtn);
    build("settings", { focus: true, closable: !!loadConsent() });
  }

  // Links the site adds itself: data-gdrock-manage, .gdrock-manage, #gdrock-manage.
  document.addEventListener("click", function (e) {
    var t = e.target;
    while (t && t.nodeType === 1) {
      if (t.hasAttribute("data-gdrock-manage") || /(^|\s)gdrock-manage(\s|$)/.test(t.className || "") || t.getAttribute("href") === "#gdrock-manage") {
        e.preventDefault();
        openSettings(t);
        return;
      }
      t = t.parentNode;
    }
  });

  // ---------- start ---------------------------------------------------------------
  var started = false;
  function start(cfg) {
    if (started) return;
    started = true;
    if (cfg && cfg.blocked) {
      if (window.console) console.warn("[GDRock] Not authorised: " + SITE_ID);
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      return;
    }
    for (var k in cfg) if (cfg.hasOwnProperty(k) && cfg[k] != null) config[k] = cfg[k];
    if (!loadConsent()) build("first", { focus: false, closable: false });
    else showManage();
  }
  function init() {
    if (API_OFF) { start({}); return; }
    var done = false;
    // A slow or failed config request must never leave a visitor without a way to choose.
    var t = setTimeout(function () { if (!done) { done = true; start({}); } }, 2500);
    fetch(API_BASE + "/api/banner-config/" + encodeURIComponent(SITE_ID))
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
      .then(function (cfg) { if (done) return; done = true; clearTimeout(t); start(cfg || {}); });
  }

  // Merge-safe: with the blocker in front, this assignment merges into its
  // namespace and leaves consent.get/set/onChange alone.
  window.GDRock = {
    show: function () { build("first", { focus: true, closable: !!loadConsent() }); },
    manage: function () { openSettings(document.activeElement); },
    consent: loadConsent,
    reset: function () { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

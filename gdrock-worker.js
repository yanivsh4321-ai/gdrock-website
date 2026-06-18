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
var LOGO_B64="data:image/png;base64,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";
if(!SITE_ID){console.warn("[GDRock] Missing data-site-id");return;}
var I18N={
  en:{title:"We value your privacy",desc:"We use cookies to improve your experience, analyze traffic, and personalize content. You can accept all, reject non-essential, or customize your preferences.",accept:"Accept all",reject:"Reject all",customize:"Customize",save:"Save preferences",necessary:"Necessary",necessaryDesc:"Required for the site to work. Always on.",analytics:"Analytics",analyticsDesc:"Helps us understand how visitors use our site.",marketing:"Marketing",marketingDesc:"Used to deliver relevant ads and measure campaigns.",poweredBy:"Powered by GDRock � GDPR Compliance"},
  he:{title:"????? ?????? ?? ??????? ???",desc:"????? ??????? ??????? ?????? ??????, ????? ????? ?????? ?????.",accept:"????? ???",reject:"??? ???",customize:"????? ?????",save:"???? ??????",necessary:"?????",necessaryDesc:"???? ?????? ????.",analytics:"????????",analyticsDesc:"????? ????? ??? ??????? ????.",marketing:"?????",marketingDesc:"?????? ?????????.",poweredBy:"????? ??? GDRock"},
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
  var logoSrc=(config.customLogoB64&&config.customLogoB64.length>10)?config.customLogoB64:LOGO_B64;
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

// -- Router --------------------------------------------------------
export default {
  async fetch(request, env) {
    const url  = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") return cors("", 204);

    // -- GET /gdrock.js ------------------------------------------
    if (path === "/gdrock.js" || path === "/gdrock.min.js") {
      return cors(GDROCK_JS, 200, {
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
          `${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(siteId)}&active=eq.true&select=config,access_code,plan`,
          { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
        );
        const rows = await r.json();
        if (!rows || rows.length === 0) return json({ blocked: false, theme: "auto", primary: "#3b82f6" });
        const row = rows[0];
        const cfg = row.config || {};
        return json({
          blocked: false, plan: row.plan,
          theme: cfg.theme || "auto", primary: cfg.accent || "#3b82f6",
          accentBtn: cfg.accent || "#3b82f6", bg: cfg.bg || null, fg: cfg.fg || null,
          radius: cfg.radius ?? 16, titleSize: cfg.titleSize ?? 16, logoSize: cfg.logoSize ?? 32,
          customLogoB64: cfg.customLogoB64 || null, accessCode: row.access_code || null,
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
        await fetch(`${env.SUPABASE_URL}/rest/v1/consent_logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "return=minimal" },
          body: JSON.stringify({ site_id, accepted: !!accepted, analytics: !!analytics, marketing: !!marketing, ip: request.headers.get("CF-Connecting-IP") || null, user_agent: request.headers.get("User-Agent") || null }),
        }).catch(() => {});
      }
      return json({ ok: true });
    }

    // -- POST /api/lead ------------------------------------------
    if (path === "/api/lead" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { source = "unknown", name = "", email = "", website_url = "", service = "", notes = "", plan = "" } = body;
      if (!email || !email.includes("@")) return json({ error: "Valid email required" }, 400);

      const SOURCE_LABELS = { modal_free: "?? Free Download", modal_paid: "?? Paid Modal", hero: "?? Hero Email", dfy_booking: "?? DFY Booking", checkout: "?? Checkout Started" };

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
  const hasCookieWords = /cookie|consent/.test(s.low);
  const hasCMP = s.cmps.length > 0;
  const hasTrackers = s.trackers.length > 0;
  if (hasTrackers && !hasCMP) { score -= 35; issues.push({ severity: "critical", text: "Trackers detected (" + s.trackers.join(", ") + ") but no recognised consent manager - cookies likely fire before consent (top GDPR violation)." }); }
  else if (hasTrackers && hasCMP) { issues.push({ severity: "good", text: "Consent manager detected (" + s.cmps.join(", ") + ") alongside trackers." }); }
  else if (!hasTrackers) { issues.push({ severity: "good", text: "No third-party trackers detected in the homepage source." }); }
  if (!hasPrivacy) { score -= 25; issues.push({ severity: "critical", text: "No privacy policy link found on the homepage." }); }
  else issues.push({ severity: "good", text: "Privacy policy link is present." });
  if (!hasCookieWords) { score -= 20; issues.push({ severity: "critical", text: "No cookie/consent banner detected in the page source." }); }
  else if (!hasCMP) issues.push({ severity: "warning", text: "Cookie wording present but no standard consent platform detected - verify reject-before-consent actually works." });
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

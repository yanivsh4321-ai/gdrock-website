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
 *   OWNER_EMAIL           (optional) where scan alerts go, default office@gdrock.com
 */

// -- Embedded script-blocking engine (gdrock-blocker.js v1.0.0, rig-verified 29/29) --
// Served BEFORE the banner inside /gdrock.js so interception patches run first.
const GDROCK_BLOCKER_JS = "/*! GDRock Consent Blocker v2.1.0 | cdn.gdrock.com | source: gdrock-blocker.js */\n!function(e,t){\"use strict\";if(!e.__gdrockBlocker){var r=\"2.1.0\";e.__gdrockBlocker={version:r};var n=(new Date).getTime(),a={},o=t.currentScript,i=re(\"data-site-id\")||e.GDRockConfig&&e.GDRockConfig.siteId||\"\";if(!i){var c=t.querySelector(\"script[data-site-id]\");c&&(i=c.getAttribute(\"data-site-id\")||\"\")}var s=\"gdrock_consent_\"+(i||\"default\"),l=\"true\"===re(\"data-gdrock-advanced\"),d=\"click\"===re(\"data-gdrock-embeds\"),u=\"bunny\"===re(\"data-gdrock-fonts\"),g=\"true\"===re(\"data-gdrock-strict\"),f=\"false\"!==re(\"data-gdrock-reload\"),p=[\"gdrock.com\"];String(re(\"data-gdrock-allow\")||\"\").replace(/[^,\\s]+/g,function(e){return p.push(e.toLowerCase().replace(/^\\*\\./,\"\")),e});var h=[[\"google.com/pagead/1p-user-list\",\"marketing\",!0,\"Google Ads / DoubleClick\"],[\"google.de/pagead/1p-user-list\",\"marketing\",!0,\"Google Ads / DoubleClick\"],[\"google.com/pagead/1p-conversion\",\"marketing\",!0,\"Google Ads / DoubleClick\"],[\"google.com/ccm/collect\",\"marketing\",!0,\"Google Ads / DoubleClick\"],[\"facebook.com/tr\",\"marketing\",!1,\"Meta Pixel\"],[\"facebook.com/privacy_sandbox/pixel\",\"marketing\",!1,\"Meta Pixel\"],[\"tr-shadow.snapchat.com/\",\"marketing\",!1,\"Snapchat Pixel\"],[\"t.co/i/adsct\",\"marketing\",!1,\"X (Twitter) Pixel\"],[\"ads-twitter.com/i/adsct\",\"marketing\",!1,\"X (Twitter) Pixel\"],[\"a.klaviyo.com/client/events\",\"marketing\",!1,\"Klaviyo onsite tracking\"],[\"a.klaviyo.com/api/track\",\"marketing\",!1,\"Klaviyo onsite tracking\"],[\"s.amazon-adsystem.com/\",\"marketing\",!1,\"Amazon Ads\"],[\"aax.amazon-adsystem.com/\",\"marketing\",!1,\"Amazon Ads\"],[\"alb.reddit.com/\",\"marketing\",!1,\"Reddit Pixel\"],[\"mc.yandex.ru/watch\",\"analytics\",!1,\"Yandex Metrica\"],[\"mc.yandex.com/watch\",\"analytics\",!1,\"Yandex Metrica\"],[\"mc.yandex.ru/webvisor\",\"analytics\",!1,\"Yandex Metrica\"],[\"mc.yandex.com/webvisor\",\"analytics\",!1,\"Yandex Metrica\"],[\"q.quora.com/\",\"marketing\",!1,\"Quora Pixel\"],[\"d.adroll.com/\",\"marketing\",!1,\"AdRoll\"],[\"static-tracking.klaviyo.com/\",\"marketing\",!1,\"Klaviyo onsite\"],[\"c.amazon-adsystem.com/\",\"marketing\",!1,\"Amazon Ads\"],[\"redditstatic.com/ads/\",\"marketing\",!1,\"Reddit Pixel\"],[\"mc.yandex.ru/metrika/\",\"analytics\",!1,\"Yandex Metrica\"],[\"mc.yandex.com/metrika/\",\"analytics\",!1,\"Yandex Metrica\"],[\"a.quora.com/qevents.js\",\"marketing\",!1,\"Quora Pixel\"],[\"s.adroll.com/\",\"marketing\",!1,\"AdRoll\"],[\"dwin1.com/\",\"marketing\",!1,\"Awin\"],[\"googletagmanager.com\",\"analytics\",!0,\"Google Tag Manager\"],[\"google-analytics.com\",\"analytics\",!0,\"Google Analytics\"],[\"analytics.google.com\",\"analytics\",!0,\"Google Analytics\"],[\"doubleclick.net\",\"marketing\",!0,\"Google Ads / DoubleClick\"],[\"googleadservices.com\",\"marketing\",!0,\"Google Ads\"],[\"googlesyndication.com\",\"marketing\",!0,\"Google Ads\"],[\"hotjar.com\",\"analytics\",!1,\"Hotjar\"],[\"hotjar.io\",\"analytics\",!1,\"Hotjar\"],[\"clarity.ms\",\"analytics\",!1,\"Microsoft Clarity\"],[\"mouseflow.com\",\"analytics\",!1,\"Mouseflow\"],[\"fullstory.com\",\"analytics\",!1,\"FullStory\"],[\"connect.facebook.net\",\"marketing\",!1,\"Meta Pixel\"],[\"analytics.tiktok.com\",\"marketing\",!1,\"TikTok Pixel\"],[\"analytics-sg.tiktok.com\",\"marketing\",!1,\"TikTok Pixel\"],[\"static.klaviyo.com\",\"marketing\",!1,\"Klaviyo\"],[\"klaviyo.com/onsite\",\"marketing\",!1,\"Klaviyo\"],[\"px.ads.linkedin.com\",\"marketing\",!1,\"LinkedIn Insight Tag\"],[\"snap.licdn.com\",\"marketing\",!1,\"LinkedIn Insight Tag\"],[\"ct.pinterest.com\",\"marketing\",!1,\"Pinterest Tag\"],[\"s.pinimg.com/ct\",\"marketing\",!1,\"Pinterest Tag\"],[\"sc-static.net\",\"marketing\",!1,\"Snapchat Pixel\"],[\"tr.snapchat.com\",\"marketing\",!1,\"Snapchat Pixel\"],[\"static.ads-twitter.com\",\"marketing\",!1,\"X (Twitter) Pixel\"],[\"analytics.twitter.com\",\"marketing\",!1,\"X (Twitter) Pixel\"],[\"criteo.com\",\"marketing\",!1,\"Criteo\"],[\"criteo.net\",\"marketing\",!1,\"Criteo\"],[\"bat.bing.com\",\"marketing\",!1,\"Microsoft Ads (UET)\"],[\"taboola.com\",\"marketing\",!1,\"Taboola\"],[\"outbrain.com\",\"marketing\",!1,\"Outbrain\"]],m=[[\"\\\\/g\\\\/collect$\",\"(^|&)tid=G-\",\"analytics\",!0,\"Google Analytics 4 (via the site's own server)\"]],y=[[\"Google Fonts\",[\"fonts.googleapis.com/\",\"fonts.gstatic.com/\"]],[\"Adobe Fonts\",[\"use.typekit.net/\",\"p.typekit.net/\"]]],k=[[\"YouTube\",\"Google\",\"video player\",[\"youtube.com/embed\",\"youtube.com/iframe_api\",\"youtube.com/s/player\",\"youtube-nocookie.com/\",\"ytimg.com/\",\"googlevideo.com/\"]],[\"Vimeo\",\"Vimeo\",\"video player\",[\"player.vimeo.com/\",\"vimeocdn.com/\"]],[\"Google Maps\",\"Google\",\"map\",[\"maps.googleapis.com/\",\"maps.gstatic.com/\",\"google.com/maps/embed\",\"google.com/maps/api\",\"google.de/maps/embed\"]]],v=[[\"fbq\\\\(\\\\s*['\\\"]init\",\"Meta Pixel\"],[\"gtag\\\\(\\\\s*['\\\"]config\",\"Google tag\"],[\"googletagmanager\\\\.com\\\\/gtm\\\\.js|['\\\"]gtm\\\\.start['\\\"]\",\"Google Tag Manager\"],[\"ttq\\\\.(?:load|page)\\\\(\",\"TikTok Pixel\"],[\"_hjSettings|static\\\\.hotjar\\\\.com\",\"Hotjar\"],[\"clarity\\\\.ms\\\\/tag|\\\\bclarity\\\\(\\\\s*['\\\"]\",\"Microsoft Clarity\"],[\"pintrk\\\\(\",\"Pinterest Tag\"],[\"snaptr\\\\(\",\"Snapchat Pixel\"],[\"\\\\btwq\\\\(\",\"X (Twitter) Pixel\"],[\"_linkedin_partner_id\",\"LinkedIn Insight Tag\"],[\"\\\\buetq\\\\b\",\"Microsoft Ads (UET)\"],[\"static\\\\.klaviyo\\\\.com|_learnq\",\"Klaviyo\"],[\"\\\\bym\\\\(\\\\s*\\\\d+\",\"Yandex Metrica\"],[\"\\\\brdt\\\\(\",\"Reddit Pixel\"]],b=[[\"_ga\",!0,\"analytics\",\"Google Analytics\"],[\"_gid\",!1,\"analytics\",\"Google Analytics\"],[\"_gat\",!0,\"analytics\",\"Google Analytics\"],[\"_dc_gtm_\",!0,\"analytics\",\"Google Analytics\"],[\"_gcl_\",!0,\"marketing\",\"Google Ads\"],[\"_fbp\",!1,\"marketing\",\"Meta Pixel\"],[\"_fbc\",!1,\"marketing\",\"Meta Pixel\"],[\"_ttp\",!1,\"marketing\",\"TikTok Pixel\"],[\"_tt_enable_cookie\",!1,\"marketing\",\"TikTok Pixel\"],[\"_pin_unauth\",!1,\"marketing\",\"Pinterest Tag\"],[\"_epik\",!1,\"marketing\",\"Pinterest Tag\"],[\"_derived_epik\",!1,\"marketing\",\"Pinterest Tag\"],[\"_scid\",!0,\"marketing\",\"Snapchat Pixel\"],[\"li_fat_id\",!1,\"marketing\",\"LinkedIn Insight Tag\"],[\"_uetsid\",!1,\"marketing\",\"Microsoft Ads (UET)\"],[\"_uetvid\",!1,\"marketing\",\"Microsoft Ads (UET)\"],[\"_clck\",!1,\"analytics\",\"Microsoft Clarity\"],[\"_clsk\",!1,\"analytics\",\"Microsoft Clarity\"],[\"_hj\",!0,\"analytics\",\"Hotjar\"],[\"__kla_id\",!1,\"marketing\",\"Klaviyo\"],[\"cto_bundle\",!1,\"marketing\",\"Criteo\"],[\"_rdt_uuid\",!1,\"marketing\",\"Reddit Pixel\"],[\"_ym_\",!0,\"analytics\",\"Yandex Metrica\"],[\"_pk_\",!0,\"analytics\",\"Matomo\"],[\"ajs_anonymous_id\",!1,\"marketing\",\"Segment\"]],w=de(location.hostname),x={},S=0,T=[],A=/^(|text\\/javascript|application\\/javascript|module|text\\/ecmascript|application\\/ecmascript)$/i,_=[];!function(){if(o)for(var e=t.getElementsByTagName(\"script\"),r=0;r<e.length&&e[r]!==o;r++)A.test(e[r].getAttribute(\"type\")||\"\")&&_.push(be(e[r]))}();var C={firstScript:!!o&&0===_.length&&!o.async&&!o.defer,foundOwnTag:!!o,async:!(!o||!o.async&&!o.defer),ranBefore:_},E=we();e.dataLayer=e.dataLayer||[],\"function\"!=typeof e.gtag&&(e.gtag=Se),Se(\"consent\",\"default\",{ad_storage:\"denied\",analytics_storage:\"denied\",ad_user_data:\"denied\",ad_personalization:\"denied\",wait_for_update:500}),Se(\"set\",\"ads_data_redaction\",!0),E&&Te(E);var L=Document.prototype.createElement,M=Element.prototype.setAttribute,P=Element.prototype.removeAttribute,I=Ae(_e(\"HTMLScriptElement\"),\"src\"),O=Ae(_e(\"HTMLIFrameElement\"),\"src\"),R=Ae(_e(\"HTMLIFrameElement\"),\"contentWindow\"),D=Ae(_e(\"HTMLLinkElement\"),\"href\"),N=Ae(_e(\"Node\"),\"textContent\"),G=Ae(_e(\"Attr\"),\"value\"),j=Ae(_e(\"Document\"),\"cookie\")||Ae(_e(\"HTMLDocument\"),\"cookie\"),H=[],B=[],q=/url\\(\\s*(['\"]?)([^'\")\\s]+)\\1\\s*\\)/gi,F=/@import\\s+(['\"])([^'\"]+)\\1/gi,K=/<([a-z][a-z0-9-]*)\\b([^>]*)>/gi,z=/(\\s)([a-z][a-z:-]*)(\\s*=\\s*)(\"([^\"]*)\"|'([^']*)'|([^\\s\"'>]+))/gi,U=\"script,iframe,link,img,source,video,audio,track,a[ping],area[ping],a[data-gdrock-ping],style,image,use,feImage,[style*='url(']\",W='script[type=\"text/plain\"], iframe[data-gdrock-src], link[data-gdrock-href], a[data-gdrock-ping]',Y=0,V={WebSocket:function(e,t){return ft(e,{url:t,readyState:3,protocol:\"\",extensions:\"\",bufferedAmount:0,binaryType:\"blob\",CONNECTING:0,OPEN:1,CLOSING:2,CLOSED:3,send:ve,close:ve},[\"error\",\"close\"])},EventSource:function(e,t){return ft(e,{url:t,readyState:2,withCredentials:!1,CONNECTING:0,OPEN:1,CLOSED:2,close:ve},[\"error\"])},Worker:function(e){return ft(e,{postMessage:ve,terminate:ve},[\"error\"])},SharedWorker:function(e){return ft(e,{port:ft(e,{postMessage:ve,start:ve,close:ve},[])},[\"error\"])}};ct(e);var J={present:!1,apiFound:!1,loadRequested:!1,updates:0,lastSent:null,error:null,caughtAt:null,beforeChoice:null};vt(e,\"Shopify\",bt),e.Shopify&&bt(e.Shopify),\"loading\"===t.readyState?t.addEventListener(\"DOMContentLoaded\",wt):wt();var $=null;try{$=JSON.parse(sessionStorage.getItem(\"gdrock_withdrawal\")),sessionStorage.removeItem(\"gdrock_withdrawal\")}catch(e){}var X=[],Q=!1;e.addEventListener(\"gdrock:consent\",function(e){if(!Q){var t=E,r=e&&e.detail||we()||{};E={analytics:!!r.analytics,marketing:!!r.marketing,accepted:!!r.analytics||!!r.marketing,timestamp:r.timestamp||(new Date).toISOString()};try{localStorage.setItem(s,JSON.stringify(E))}catch(e){}At(t)}});var Z=0;Lt.get=Tt,Lt.set=function(t){var r=E,n={analytics:\"analytics\"in(t=t||{})?!!t.analytics:!(!E||!E.analytics),marketing:\"marketing\"in t?!!t.marketing:!(!E||!E.marketing)};n.accepted=n.analytics||n.marketing,n.timestamp=(new Date).toISOString(),E=n;try{localStorage.setItem(s,JSON.stringify(n))}catch(e){}At(r),Q=!0;try{e.dispatchEvent(new CustomEvent(\"gdrock:consent\",{detail:n}))}catch(e){}return Q=!1,Tt()},Lt.onChange=function(e){return\"function\"==typeof e&&X.push(e),function(){var t=X.indexOf(e);-1!==t&&X.splice(t,1)}};var ee=\"object\"==typeof e.GDRock&&e.GDRock||{};ee.consent=Lt,ee.diagnostics=Ct,ee.installFix=function(){var e,t,r=Ct(),n=[],a=o&&o.getAttribute(\"src\")||\"https://cdn.gdrock.com/gdrock.js\",c=\"\";if(o)for(e=0;e<o.attributes.length;e++)t=o.attributes[e].name,/^data-/.test(t)&&\"data-site-id\"!==t&&(c+=\" \"+t+'=\"'+String(o.attributes[e].value).replace(/\"/g,\"&quot;\")+'\"');var s='<script src=\"'+a+'\" data-site-id=\"'+(i||\"YOUR_SITE_ID\")+'\"'+c+\"><\\/script>\",l=\"{%- comment -%} GDRock: keep this the first line inside <head>, above {{ content_for_header }} {%- endcomment -%}\\n\"+s;function u(e){n.push(e)}function g(e){return r.install.tag?r.install.tag.replace(/<script\\b/i,\"<script \"+e):null}if(!r.install.firstScript){var f=[];for(e=0;e<r.install.ranBefore.length;e++)f.push(r.install.ranBefore[e].src||\"inline: \"+r.install.ranBefore[e].inline);u({id:\"install-first\",title:\"Make GDRock the first script in <head>\",why:r.install.foundOwnTag?r.install.asyncOrDefer?\"The tag is async/defer, so other scripts can run before it.\":\"These ran before GDRock and were not blocked: \"+f.join(\" | \"):\"GDRock was loaded by another script, so it cannot tell what ran before it.\",where:J.present?\"Shopify: layout/theme.liquid\":\"the <head> of every page\",steps:J.present?[\"Online Store > Themes > (current theme) > Edit code.\",\"Add a snippet named gdrock-blocker (snippets/gdrock-blocker.liquid) containing the code under Replace.\",\"In layout/theme.liquid, put {% render 'gdrock-blocker' %} on the first line after <head>, above {{ content_for_header }}.\",\"Delete the old GDRock tag (under Find) wherever it is now.\"]:[\"Delete the tag under Find.\",\"Paste the tag under Replace as the first line after <head>, before any other <script>.\"],find:r.install.tag,replace:J.present?l:s})}var p=null;for(e=0;e<r.fromHtml.length;e++){var h,m=r.fromHtml[e],y=m.url;if(J.present&&\"script\"===m.type&&(h=/static\\.klaviyo\\.com\\/onsite\\/js\\/([A-Za-z0-9]+)/.exec(y)||/company_id=([A-Za-z0-9]+)/.exec(y))&&/klaviyo/i.test(y)){if(p)continue;u({id:\"shopify-klaviyo\",title:\"Klaviyo: switch off the app embed and paste a tagged snippet\",why:\"Shopify writes Klaviyo's app embed straight into the HTML, so the browser fetches klaviyo.js before any script can stop it and Klaviyo sees the visitor's IP.\",where:\"Shopify: theme editor + layout/theme.liquid\",steps:[\"Online Store > Themes > Customize > App embeds: switch off Klaviyo (Onsite Javascript) and save.\",\"In layout/theme.liquid, paste the code under Replace on the line after {% render 'gdrock-blocker' %}.\",\"Klaviyo sign-up forms then appear after the visitor allows marketing.\"],find:'<script async src=\"'+y+'\"><\\/script>  (written by the Klaviyo app embed)',replace:'<script type=\"text/plain\" data-gdrock-category=\"marketing\" data-gdrock-src=\"https://static.klaviyo.com/onsite/js/'+(p=h[1])+\"/klaviyo.js?company_id=\"+p+'\"><\\/script>'})}else\"img\"===m.type?u({id:\"delete-pixel\",title:\"Delete the \"+m.vendor+\" image pixel from the HTML\",why:\"An <img> pixel written in the HTML is requested as the page parses. Its library sends its own hit after consent.\",where:\"page source\",steps:[\"Find the <img> tag with this address and delete it (including a <noscript> wrapper around it).\"],find:'src=\"'+y+'\"',replace:\"(delete the whole <img> tag)\"}):u({id:\"tag-html\",title:\"Tag the \"+m.vendor+\" \"+m.type+\" written in the HTML\",why:\"The browser's preloader fetches it before any script runs, so the vendor sees the visitor's IP even though GDRock stops it from running.\",where:\"page source\",steps:[\"Replace the src attribute as shown. In the source, & in the address may be written as &amp;.\"],find:(\"link\"===m.type?'href=\"':'src=\"')+y+'\"',replace:(\"script\"===m.type?'type=\"text/plain\" ':\"\")+'data-gdrock-category=\"'+m.category+'\" '+(\"link\"===m.type?'data-gdrock-href=\"':'data-gdrock-src=\"')+y+'\"'})}for(e=0;e<r.untaggedInline.length;e++){var k=r.untaggedInline[e];u({id:\"tag-inline\",title:\"Tag the inline \"+k.vendor+\" code\",why:\"Inline code runs the moment it is parsed; only its type attribute can make it wait.\",where:\"page source: the <script> that starts with \"+JSON.stringify(k.starts),steps:[\"Replace that script's opening tag as shown. Keep its content unchanged.\"],find:k.openTag,replace:k.openTag.replace(/\\s+type=\"[^\"]*\"/i,\"\").replace(/^<script/i,'<script type=\"text/plain\" data-gdrock-category=\"'+Et(k.vendor)+'\"')})}var v={};for(e=0;e<r.fonts.length;e++)!v[r.fonts[e].provider]&&/\\/css2?\\?|typekit\\.net\\/[a-z0-9]+\\.css/i.test(r.fonts[e].url)&&(v[r.fonts[e].provider]=1,u({id:\"self-host-fonts\",title:\"Self-host the \"+r.fonts[e].provider,why:\"Every visitor's browser asks \"+r.fonts[e].provider.split(\" \")[0]+\" for the font files, which sends it their IP address (LG M\\xfcnchen I, 3 O 17493/20).\",where:\"page source (or the theme's font settings)\",steps:[\"Download the font files (google-webfonts-helper does this for Google Fonts), put them on your own server, and load them with @font-face.\",\"Then replace the stylesheet link under Find with your own stylesheet.\"],find:'href=\"'+r.fonts[e].url+'\"',replace:'href=\"/fonts/fonts.css\"  (your self-hosted @font-face rules)'}));var b=!1;for(e=0;e<r.embeds.length;e++)\"loaded\"!==r.embeds[e].state||r.consent.marketing||(b=!0);if(b&&!d&&r.install.tag&&u({id:\"embeds-click\",title:\"Make video and map embeds click-to-load\",why:\"They load (and set cookies) before consent.\",where:\"the GDRock script tag\",steps:[\"Add the attribute shown.\"],find:r.install.tag,replace:g('data-gdrock-embeds=\"click\"')}),r.shopify.present&&u({id:\"shopify-customer-privacy\",title:\"Shopify: require consent before app pixels run\",why:r.shopify.trackableBeforeChoice?\"Before any choice, Shopify reported \"+r.shopify.trackableBeforeChoice.signals.join(\", \")+(r.shopify.trackableBeforeChoice.region?\" for region \"+r.shopify.trackableBeforeChoice.region:\"\")+\", so app pixels may act on Shopify's own default.\":\"App pixels follow Shopify's regional default until GDRock's signal arrives.\",where:\"Shopify admin\",steps:[\"Settings > Customer privacy.\",'Turn on consent collection (\"require consent\") for the regions you sell to.',\"Save, then reload this page and run GDRock.diagnostics() again.\"]}),r.unknownThirdParty.length){var w=[];for(e=0;e<r.unknownThirdParty.length&&e<12;e++)w.push(r.unknownThirdParty[e].host);u({id:\"unknown-hosts\",title:\"Review \"+r.unknownThirdParty.length+\" third-party host(s) GDRock doesn't know\",why:\"GDRock blocks by list. These hosts were contacted and are not on it: \"+w.join(\", \")+\".\",where:\"the GDRock script tag\",steps:[\"Look each host up. Tell GDRock about any tracker so it joins the list.\",\"Optional: turn on strict mode to drop beacons to unlisted hosts until marketing consent. List the hosts the site needs (payments, reviews, chat) in data-gdrock-allow.\"],find:r.install.tag,replace:g('data-gdrock-strict=\"true\" data-gdrock-allow=\"(hosts your site needs, space-separated)\"')})}var x=[\"GDRock install check: \"+(n.length?n.length+\" fix(es)\":\"nothing to fix\")+\" on \"+location.hostname];for(e=0;e<n.length;e++){var S=n[e];x.push(\"\",e+1+\". \"+S.title,\"   Why: \"+S.why,\"   Where: \"+S.where);for(var T=0;S.steps&&T<S.steps.length;T++)x.push(\"   - \"+S.steps[T]);S.find&&x.push(\"   Find:    \"+S.find),S.replace&&x.push(\"   Replace: \"+S.replace)}return{fixes:n,text:x.join(\"\\n\")}},ee.blocker={version:r,add:function(e,t){h.push([String(e).toLowerCase(),\"analytics\"===t?\"analytics\":\"marketing\",!1,\"custom rule\"])},held:function(){for(var e=[],t=0;t<H.length;t++)e.push({kind:H[t].kind,src:H[t].src,category:H[t].category,inline:null==H[t].src});return e}};var te={consent:1,diagnostics:1,installFix:1,blocker:1};try{Object.defineProperty(e,\"GDRock\",{configurable:!0,get:function(){return ee},set:function(e){if(e&&\"object\"==typeof e)for(var t in e)te[t]||(ee[t]=e[t])}})}catch(t){e.GDRock=ee}}function re(e){return o?o.getAttribute(e):null}function ne(e){return null==e?\"\":\"string\"==typeof e?e:e.url?String(e.url):String(e)}function ae(e){for(var t=0;t<h.length;t++)if(-1!==e.indexOf(h[t][0]))return h[t];return null}function oe(e){var t=ne(e);if(!t)return null;var r,n=t.toLowerCase(),a=ae(n);if(a)return l&&a[2]||xe(a[1])?null:{category:a[1],vendor:a[3]};if(-1!==n.indexOf(\"collect\")){var o=t.indexOf(\"?\"),i=(-1===o?t:t.slice(0,o)).replace(/^[a-z][a-z0-9+.\\-]*:\\/\\/[^\\/]*/i,\"\"),c=-1===o?\"\":t.slice(o+1);for(r=0;r<m.length;r++){var s=m[r];if(new RegExp(s[0],\"i\").test(i)&&new RegExp(s[1],\"i\").test(c))return l&&s[3]||xe(s[2])?null:{category:s[2],vendor:s[4]}}}return null}function ie(e){var t=ae(ne(e).toLowerCase());return t?{category:t[1],vendor:t[3]}:null}function ce(e,t){var r=ne(t).toLowerCase();if(!r)return null;for(var n=0;n<e.length;n++)for(var a=e[n][e[n].length-1],o=0;o<a.length;o++)if(-1!==r.indexOf(a[o]))return e[n];return null}function se(e){for(var t=String(e||\"\").split(\",\"),r=0;r<t.length;r++){var n=oe(t[r].replace(/^\\s+/,\"\").split(/\\s+/)[0]);if(n)return n}return null}function le(e){try{return new URL(ne(e),t.baseURI).hostname.toLowerCase()}catch(e){return\"\"}}function de(e){if(/^[\\d.]+$|:/.test(e))return e;var t=String(e||\"\").split(\".\"),r=t.length>2&&2===t[t.length-1].length&&/^(co|com|org|net|ac|gov|or|ne|gv|ltd|plc)$/.test(t[t.length-2])?3:2;return t.slice(-r).join(\".\")}function ue(e){return!!e&&de(e)!==w}function ge(e){for(var t=0;t<p.length;t++)if(e===p[t]||e.slice(-p[t].length-1)===\".\"+p[t])return!0;return!1}function fe(e){return oe(e)||function(e){if(!g||xe(\"marketing\"))return null;var t=le(e);return!ue(t)||ge(t)?null:{category:\"marketing\",vendor:\"unlisted host \"+t,strict:!0}}(e)}function pe(e,t){if((e=ne(e))&&!/^(data|blob|about|javascript|mailto|tel):/i.test(e)){var r=le(e);if(ue(r)){var n=x[r];if(!n){if(S>=150)return;S++;var a=e.toLowerCase(),o=ae(a),i=ce(y,a)||ce(k,a);n=x[r]={host:r,count:0,via:[],known:o?o[3]:i?i[0]:ge(r)?\"allowed\":null,dropped:0}}n.count++,-1===n.via.indexOf(t)&&n.via.push(t)}}}function he(e,t,r,a,o){var i={type:e,url:ne(t).slice(0,300),category:r.category,vendor:r.vendor,action:a,via:o||\"js\",ms:(new Date).getTime()-n};if(T.length<500&&T.push(i),r.strict){pe(t,e);var c=x[le(t)];c&&c.dropped++}return i}function me(e,r){try{var n;\"function\"==typeof Event?n=new Event(r):(n=t.createEvent(\"Event\")).initEvent(r,!1,!1),e.dispatchEvent(n)}catch(e){}}function ye(e){setTimeout(e,0)}function ke(t){e.Promise?Promise.resolve().then(t):ye(t)}function ve(){}function be(e){var t=e.getAttribute(\"src\"),r={src:t||null,inline:t?null:String(e.text||\"\").replace(/\\s+/g,\" \").slice(0,100),tracker:null},n=t?ie(t):null;return n&&(r.tracker=n.vendor),r}function we(){try{return JSON.parse(localStorage.getItem(s))}catch(e){return null}}function xe(e){return\"necessary\"===e||!(!E||!E[e])}function Se(){e.dataLayer.push(arguments)}function Te(e){Se(\"consent\",\"update\",{analytics_storage:e.analytics?\"granted\":\"denied\",ad_storage:e.marketing?\"granted\":\"denied\",ad_user_data:e.marketing?\"granted\":\"denied\",ad_personalization:e.marketing?\"granted\":\"denied\"}),Se(\"set\",\"ads_data_redaction\",!e.marketing)}function Ae(e,t){try{return e&&Object.getOwnPropertyDescriptor(e,t)}catch(e){return null}}function _e(t){return e[t]&&e[t].prototype}function Ce(e,t,r,n){e&&e.set?e.set.call(t,n):M.call(t,r,n)}function Ee(e,r){return L.call(e.ownerDocument||t,r)}function Le(e){for(var t=0;t<b.length;t++){var r=b[t];if(r[1]?0===e.indexOf(r[0]):e===r[0])return{category:r[2],vendor:r[3]}}return null}function Me(e){return String(e).split(\";\")[0].split(\"=\")[0].replace(/^\\s+|\\s+$/g,\"\")}function Pe(e,t,r,n){M.call(e,\"data-gdrock-held\",\"1\"),t&&M.call(e,n||\"data-gdrock-src\",t),M.call(e,\"data-gdrock-category\",r)}function Ie(e,t,r,n){M.call(e,\"type\",\"text/plain\"),Pe(e,t,r.category),H.push({kind:\"script\",el:e,src:t||null,text:null,category:r.category,entry:he(\"script\",t,r,\"held\",n)})}function Oe(e,t,r,n){Pe(e,t,r.category),H.push({kind:\"iframe\",el:e,src:t,category:r.category,entry:he(\"iframe\",t,r,\"held\",n)})}function Re(e,t,r,n){Pe(e,t,r.category,\"data-gdrock-href\"),H.push({kind:\"link\",el:e,src:t,category:r.category,entry:he(\"link\",t,r,\"held\",n)})}function De(e,t,r,n,a){he(t,r,n,\"dropped\",a),M.call(e,\"data-gdrock-blocked-src\",ne(r).slice(0,300)),ye(function(){me(e,\"error\")})}function Ne(e){for(var t=[\"data-gdrock-held\",\"data-gdrock-src\",\"data-gdrock-href\",\"data-gdrock-category\",\"data-gdrock-embed\",\"data-gdrock-ping\"],r=0;r<t.length;r++)P.call(e,t[r])}function Ge(e){var t=e.el;if(e.entry&&(e.entry.action=\"embed\"===e.kind&&e.clicked?\"loaded by click\":\"released\"),\"script\"===e.kind)if(t.parentNode){for(var r=Ee(t,\"script\"),n=0;n<t.attributes.length;n++){var a=t.attributes[n];\"type\"!==a.name&&\"src\"!==a.name&&0!==a.name.indexOf(\"data-gdrock-\")&&M.call(r,a.name,a.value)}e.src?(r.async=t.hasAttribute(\"async\"),Ce(I,r,\"src\",e.src)):null!=e.text&&(r.text=e.text),t.parentNode.insertBefore(r,t),t.parentNode.removeChild(t)}else e.src&&(P.call(t,\"type\"),Ne(t),Ce(I,t,\"src\",e.src));else if(\"iframe\"===e.kind||\"embed\"===e.kind)Ne(t),M.call(t,\"data-gdrock-loaded\",\"1\"),e.placeholder&&e.placeholder.parentNode&&(e.placeholder.parentNode.insertBefore(t,e.placeholder),e.placeholder.parentNode.removeChild(e.placeholder)),Ce(O,t,\"src\",e.src);else if(\"link\"===e.kind)Ne(t),Ce(D,t,\"href\",e.src);else if(\"ping\"===e.kind){var o=t.getAttribute(\"ping\");Ne(t),M.call(t,\"ping\",(o?o+\" \":\"\")+e.src)}}function je(e){for(var t=String(e||\"\").split(/\\s+/),r=[],n=[],a=\"analytics\",o=0;o<t.length;o++)if(t[o]){var i=fe(t[o]);i?(n.push(t[o]),\"marketing\"===i.category&&(a=\"marketing\")):r.push(t[o])}return{keep:r.join(\" \"),blocked:n.join(\" \"),category:a}}function He(e,t,r){M.call(e,\"data-gdrock-ping\",t.blocked),M.call(e,\"data-gdrock-held\",\"1\"),H.push({kind:\"ping\",el:e,src:t.blocked,category:t.category,entry:he(\"ping\",t.blocked,{category:t.category,vendor:(ie(t.blocked)||{}).vendor||\"ping\"},\"held\",r)})}function Be(e){return d&&!xe(\"marketing\")?ce(k,e):null}function qe(e,t,r,n){Pe(e,t,\"marketing\"),M.call(e,\"data-gdrock-embed\",r[0]);var a={kind:\"embed\",el:e,src:t,category:\"marketing\",provider:r,entry:he(\"embed\",t,{category:\"marketing\",vendor:r[0]},\"held\",n)};return H.push(a),e.parentNode&&Fe(a),a}function Fe(e){var t=e.el,r=e.provider;if(!e.placeholder&&t.parentNode){var n=t.getAttribute(\"width\"),a=t.getAttribute(\"height\"),o=Ee(t,\"div\");M.call(o,\"class\",\"gdrock-embed-placeholder\"),M.call(o,\"role\",\"region\"),M.call(o,\"aria-label\",r[0]+\" \"+r[2]+\" not loaded\"),o.style.cssText=\"display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;box-sizing:border-box;max-width:100%;padding:20px;border-radius:8px;background:#111418;color:#e8eaee;text-align:center;font:14px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;width:\"+(n?/^\\d+$/.test(n)?n+\"px\":n:\"100%\")+\";height:\"+(a?/^\\d+$/.test(a)?a+\"px\":a:\"315px\")+\";\";var i=Ee(t,\"p\");i.style.cssText=\"margin:0;max-width:44ch;\",i.textContent=\"This \"+r[2]+\" is hosted by \"+r[1]+\" (\"+r[0]+\"). Loading it lets \"+r[1]+\" set cookies and see your IP address.\";var c=Ee(t,\"button\");M.call(c,\"type\",\"button\"),c.style.cssText=\"border:0;border-radius:6px;padding:10px 18px;background:#fff;color:#111418;font:600 14px/1 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;cursor:pointer;\",c.textContent=\"Load \"+r[2],c.addEventListener(\"click\",function(){var t=H.indexOf(e);-1!==t&&H.splice(t,1),e.clicked=!0,Ge(e)}),o.appendChild(i),o.appendChild(c),t.parentNode.insertBefore(o,t),t.parentNode.removeChild(t),e.placeholder=o}}function Ke(e,t){if(!u||\"string\"!=typeof e||!/fonts\\.googleapis\\.com\\/css/i.test(e))return e;var r=e.replace(/fonts\\.googleapis\\.com/i,\"fonts.bunny.net\");return B.length<50&&B.push({from:e.slice(0,200),to:r.slice(0,200),via:t}),r}function ze(e,t){if(\"string\"!=typeof e||-1===e.indexOf(\"url(\")&&-1===e.indexOf(\"@import\"))return e;var r=t?\"js\":\"html\";return e.replace(q,function(e,n,a){var o=oe(a);if(o)return he(\"css\",a,o,\"dropped\",r),\"url(about:invalid)\";var i=t?Ke(a,\"css\"):a;return i===a?e:\"url(\"+n+i+n+\")\"}).replace(F,function(e,n,a){var o=oe(a);if(o)return he(\"css\",a,o,\"dropped\",r),\"@import url(about:invalid)\";var i=t?Ke(a,\"css\"):a;return i===a?e:\"@import \"+n+i+n})}function Ue(e){return\"string\"!=typeof e||-1!==e.indexOf(\"data-gdrock-boot\")?e:\"<script data-gdrock-boot>try{parent.__gdrockPatch(window)}catch(e){}<\\/script>\"+et(e,!0)}function We(e,t){var r=oe(t);return r?(Ie(e,ne(t),r,\"js\"),a):(pe(t,\"script\"),t)}function Ye(e,t){var r=oe(t);if(r)return Oe(e,ne(t),r,\"js\"),a;var n=Be(t);return n?(qe(e,ne(t),n,\"js\"),a):(pe(t,\"iframe\"),t)}function Ve(e,t){var r=oe(t);if(r)return Re(e,ne(t),r,\"js\"),a;var n=Ke(t,\"link\");return pe(n,\"link\"),n}function Je(e,t){var r=oe(t);return r?(De(e,\"img\",t,r,\"js\"),a):(pe(t,\"img\"),t)}function $e(e,t){var r=se(t);return r?(De(e,\"img\",t,r,\"js\"),a):t}function Xe(e,t){var r=oe(t);return r?(De(e,\"media\",t,r,\"js\"),a):(pe(t,\"media\"),t)}function Qe(e,t){var r=je(t);return r.blocked?(He(e,r,\"js\"),r.keep):t}function Ze(e,t,r){var n=e.nodeName;if(\"style\"===t)return ze(r,!0);if(\"src\"===t){if(\"SCRIPT\"===n)return We(e,r);if(\"IFRAME\"===n)return Ye(e,r);if(\"IMG\"===n||\"SOURCE\"===n)return Je(e,r);if(\"VIDEO\"===n||\"AUDIO\"===n||\"TRACK\"===n)return Xe(e,r)}else if(\"srcset\"===t){if(\"IMG\"===n||\"SOURCE\"===n)return $e(e,r)}else if(\"href\"===t){if(\"LINK\"===n)return Ve(e,r);if(\"http://www.w3.org/2000/svg\"===e.namespaceURI&&/^(image|script|use|feImage)$/.test(e.localName))return Je(e,r)}else if(\"poster\"===t){if(\"VIDEO\"===n)return Xe(e,r)}else if(\"ping\"===t){if(\"A\"===n||\"AREA\"===n)return Qe(e,r)}else if(\"srcdoc\"===t&&\"IFRAME\"===n)return Ue(r);return r}function et(e,t){return\"string\"==typeof e&&-1!==e.indexOf(\"<\")&&(ae(r=e.toLowerCase())||-1!==r.indexOf(\"collect\")||d&&ce(k,r)||u&&-1!==r.indexOf(\"fonts.googleapis.com\")||g&&-1!==r.indexOf(\"ping\"))?(e=e.replace(/(<style\\b[^>]*>)([\\s\\S]*?)(<\\/style\\s*>)/gi,function(e,t,r,n){return t+ze(r,!0)+n})).replace(K,function(e,r,n){var a=r.toLowerCase(),o=\"\",i=!1;if(\"script\"===a&&!t)return e;var c=n.replace(z,function(e,r,n,c,s,l,d,u){var g=null!=l?l:null!=d?d:u,f=null!=d?\"'\":'\"',p=function(e,t,r,n){var a;if(\"style\"===t){var o=ze(r,!0);return o===r?null:{name:\"style\",value:o}}if(\"src\"===t||\"srcset\"===t||\"poster\"===t)return\"script\"===e?\"src\"===t&&n&&(a=oe(r))?{name:\"data-gdrock-src\",value:r,extra:' type=\"text/plain\" data-gdrock-category=\"'+a.category+'\"'}:null:\"iframe\"===e&&\"src\"===t?(a=oe(r))?{name:\"data-gdrock-src\",value:r,extra:' data-gdrock-category=\"'+a.category+'\"'}:Be(r)?{name:\"data-gdrock-src\",value:r,extra:' data-gdrock-category=\"marketing\"'}:null:\"img\"!==e&&\"source\"!==e&&\"video\"!==e&&\"audio\"!==e&&\"track\"!==e||!(a=\"srcset\"===t?se(r):oe(r))?null:(he(\"img\"===e||\"source\"===e?\"img\":\"media\",r,a,\"dropped\",\"html-string\"),{name:\"data-gdrock-blocked-src\",value:r});if(\"href\"===t&&\"link\"===e){if(a=oe(r))return{name:\"data-gdrock-href\",value:r,extra:' data-gdrock-category=\"'+a.category+'\"'};var i=Ke(r,\"html-string\");return i===r?null:{name:\"href\",value:i}}if(\"ping\"===t&&(\"a\"===e||\"area\"===e)){var c=je(r);return c.blocked?{name:\"ping\",value:c.keep,extra:' data-gdrock-ping=\"'+c.blocked.replace(/\"/g,\"&quot;\")+'\" data-gdrock-category=\"'+c.category+'\"'}:null}return null}(a,n.toLowerCase(),g,t);return p?(i=!0,p.extra&&(o+=p.extra),r+p.name+\"=\"+f+String(p.value).replace(\"'\"===f?/'/g:/\"/g,\"'\"===f?\"&#39;\":\"&quot;\")+f):e});return i?\"<\"+r+o+c+\">\":e}):e;var r}function tt(e,t,r){if(!e.getAttribute(\"data-gdrock-blocked-src\"))for(var n=0;n<t.length;n++){var a=e.getAttribute(t[n]);if(a){var o=\"srcset\"===t[n]?se(a):oe(a);if(o){for(var i=0;i<t.length;i++)P.call(e,t[i]);return void De(e,r,a,o,\"html\")}}}}function rt(e){var t=N.get.call(e),r=ze(t,!1);r!==t&&N.set.call(e,r)}function nt(e){switch(e.nodeName){case\"SCRIPT\":!function(e){if(!e.getAttribute(\"data-gdrock-held\"))if(\"text/plain\"!==(e.getAttribute(\"type\")||\"\").toLowerCase()){var t=e.getAttribute(\"src\"),r=oe(t);if(r){M.call(e,\"type\",\"text/plain\");for(var n=Ee(e,\"script\"),a=0;a<e.attributes.length;a++){var o=e.attributes[a];\"src\"!==o.name&&\"type\"!==o.name&&M.call(n,o.name,o.value)}Ie(n,t,r,\"html\"),e.parentNode&&(e.parentNode.insertBefore(n,e),e.parentNode.removeChild(e))}else t&&pe(t,\"script\")}else!function(e){if(!e.getAttribute(\"data-gdrock-held\")){var t=e.getAttribute(\"data-gdrock-category\");if(t||e.getAttribute(\"data-gdrock-src\")){t=\"analytics\"===t?\"analytics\":\"marketing\";var r=e.getAttribute(\"data-gdrock-src\")||e.getAttribute(\"src\")||null;M.call(e,\"data-gdrock-held\",\"1\"),M.call(e,\"data-gdrock-category\",t);var n={category:t,vendor:r?(ie(r)||{}).vendor||\"tagged script\":\"tagged inline code\"},a={kind:\"script\",el:e,src:r,text:r?null:e.text,category:t,entry:he(\"script\",r||\"(inline)\",n,\"held\",\"tagged\")};xe(t)?Ge(a):H.push(a)}}}(e)}(e);break;case\"IFRAME\":!function(e){var t=e.getAttribute(\"srcdoc\");if(null!=t&&-1===t.indexOf(\"data-gdrock-boot\")&&M.call(e,\"srcdoc\",Ue(t)),it(e),!e.getAttribute(\"data-gdrock-loaded\"))if(e.getAttribute(\"data-gdrock-held\"))for(var r=0;r<H.length;r++)H[r].el===e&&\"embed\"===H[r].kind&&Fe(H[r]);else{var n=e.getAttribute(\"data-gdrock-src\");if(n){var a=\"analytics\"===e.getAttribute(\"data-gdrock-category\")?\"analytics\":\"marketing\",o=ce(k,n);return xe(a)?(Ce(O,e,\"src\",n),void Ne(e)):d&&o&&!ie(n)?void qe(e,n,o,\"html\"):void Oe(e,n,{category:a,vendor:(ie(n)||{}).vendor||\"tagged iframe\"},\"html\")}var i=e.getAttribute(\"src\");if(i){var c=oe(i);if(c)return P.call(e,\"src\"),void Oe(e,i,c,\"html\");var s=Be(i);if(s)return P.call(e,\"src\"),void qe(e,i,s,\"html\");pe(i,\"iframe\")}}}(e);break;case\"LINK\":!function(e){if(!e.getAttribute(\"data-gdrock-held\")){var t=e.getAttribute(\"data-gdrock-href\");if(t){var r=\"analytics\"===e.getAttribute(\"data-gdrock-category\")?\"analytics\":\"marketing\";xe(r)?(Ce(D,e,\"href\",t),Ne(e)):Re(e,t,{category:r,vendor:(ie(t)||{}).vendor||\"tagged link\"},\"html\")}else{var n=e.getAttribute(\"href\"),a=oe(n);if(a)return P.call(e,\"href\"),void Re(e,n,a,\"html\");n&&pe(n,\"link\")}}}(e);break;case\"IMG\":case\"SOURCE\":tt(e,[\"src\",\"srcset\"],\"img\");break;case\"VIDEO\":tt(e,[\"src\",\"poster\"],\"media\");break;case\"AUDIO\":case\"TRACK\":tt(e,[\"src\"],\"media\");break;case\"A\":case\"AREA\":!function(e){var t=e.getAttribute(\"data-gdrock-ping\");if(t&&!e.getAttribute(\"data-gdrock-held\")){var r=\"analytics\"===e.getAttribute(\"data-gdrock-category\")?\"analytics\":\"marketing\";xe(r)?Ge({kind:\"ping\",el:e,src:t}):He(e,{blocked:t,category:r},\"html\")}var n=e.getAttribute(\"ping\");if(n){var a=je(n);a.blocked&&(M.call(e,\"ping\",a.keep),He(e,a,\"html\"))}}(e);break;case\"STYLE\":rt(e);break;case\"image\":case\"use\":case\"feImage\":tt(e,[\"href\",\"xlink:href\"],\"img\")}var t=e.getAttribute(\"style\");if(t&&-1!==t.indexOf(\"url(\")){var r=ze(t,!1);r!==t&&M.call(e,\"style\",r)}}function at(e){if(e&&(1===e.nodeType||11===e.nodeType)&&(1===e.nodeType&&nt(e),e.firstElementChild&&e.querySelectorAll))for(var t=e.querySelectorAll(U),r=0;r<t.length;r++)nt(t[r])}function ot(e){for(var t=e.querySelectorAll(W),r=0;r<t.length;r++)nt(t[r])}function it(e){try{var t=R?R.get.call(e):e.contentWindow;t&&ct(t)}catch(e){}if(!e.__gdrockLoadHook){e.__gdrockLoadHook=!0;try{e.addEventListener(\"load\",function(){it(e)})}catch(e){}}}function ct(t){var r;try{if(!(r=t.document)||!t.Element)return}catch(e){return}var n=t.Element.prototype;if(!n.__gdrockPatched){try{Object.defineProperty(n,\"__gdrockPatched\",{value:!0})}catch(e){return}try{t.__gdrockPatch=ct}catch(e){}t!==e&&Y++,function(e){function t(t){return e[t]&&e[t].prototype}var r,n=t(\"Document\"),o=e.Element.prototype,i=t(\"Node\");st(t(\"HTMLScriptElement\"),\"src\",\"data-gdrock-src\",We),st(t(\"HTMLIFrameElement\"),\"src\",\"data-gdrock-src\",Ye),st(t(\"HTMLIFrameElement\"),\"srcdoc\",null,function(e,t){return Ue(t)}),st(t(\"HTMLLinkElement\"),\"href\",\"data-gdrock-href\",Ve),st(t(\"HTMLImageElement\"),\"src\",null,Je),st(t(\"HTMLImageElement\"),\"srcset\",null,$e),st(t(\"HTMLSourceElement\"),\"src\",null,Je),st(t(\"HTMLSourceElement\"),\"srcset\",null,$e),st(t(\"HTMLMediaElement\"),\"src\",null,Xe),st(t(\"HTMLVideoElement\"),\"poster\",null,Xe),st(t(\"HTMLTrackElement\"),\"src\",null,Xe),st(t(\"HTMLAnchorElement\"),\"ping\",null,Qe),st(t(\"HTMLAreaElement\"),\"ping\",null,Qe),lt(t(\"HTMLIFrameElement\"),\"contentWindow\",function(e){e&&ct(e)}),lt(t(\"HTMLIFrameElement\"),\"contentDocument\",function(e){e&&e.defaultView&&ct(e.defaultView)});var c=o.setAttribute,s=o.setAttributeNS;o.setAttribute=function(e,t){var r=Ze(this,String(e).toLowerCase(),t);if(r!==a)return c.call(this,e,r)},s&&(o.setAttributeNS=function(e,t,r){var n=String(t),o=Ze(this,n.slice(n.indexOf(\":\")+1).toLowerCase(),r);if(o!==a)return s.call(this,e,t,o)});var l=[\"setAttributeNode\",\"setAttributeNodeNS\"];for(r=0;r<l.length;r++)(function(e){\"function\"==typeof e&&(o[l[r]]=function(t){if(t&&t.name){var r=Ze(this,String(t.name).toLowerCase().replace(/^.*:/,\"\"),t.value);if(r===a)return null;r!==t.value&&G&&G.set.call(t,r)}return e.apply(this,arguments)})})(o[l[r]]);st(t(\"Attr\"),\"value\",null,function(e,t){var r=e.ownerElement;return r?Ze(r,String(e.name).toLowerCase().replace(/^.*:/,\"\"),t):t});var d=function(e,t){return\"STYLE\"===e.nodeName?ze(t,!0):\"SCRIPT\"===e.nodeName||\"TEXTAREA\"===e.nodeName?t:et(t,!1)};st(o,\"innerHTML\",null,d),st(o,\"outerHTML\",null,d),st(t(\"ShadowRoot\"),\"innerHTML\",null,d),dt(o,\"insertAdjacentHTML\",1,function(e){return et(e,!1)}),dt(o,\"setHTMLUnsafe\",0,function(e){return et(e,!1)}),dt(t(\"ShadowRoot\"),\"setHTMLUnsafe\",0,function(e){return et(e,!1)}),dt(t(\"Range\"),\"createContextualFragment\",0,function(e){return et(e,!0)}),dt(n,\"write\",-1,function(e){return et(e,!0)}),dt(n,\"writeln\",-1,function(e){return et(e,!0)});var u=function(e,t){return\"STYLE\"===e.nodeName?ze(t,!0):t};st(i,\"textContent\",null,u),st(t(\"HTMLElement\"),\"innerText\",null,u);var g=t(\"CSSStyleDeclaration\");if(g){dt(g,\"setProperty\",1,function(e){return ze(e,!0)});for(var f=function(e,t){return ze(t,!0)},p=[\"cssText\",\"background\",\"backgroundImage\",\"background-image\",\"borderImage\",\"border-image\",\"borderImageSource\",\"border-image-source\",\"listStyle\",\"list-style\",\"listStyleImage\",\"list-style-image\",\"content\",\"cursor\",\"mask\",\"maskImage\",\"mask-image\",\"webkitMaskImage\",\"WebkitMaskImage\",\"-webkit-mask-image\"],h=[g,t(\"CSS2Properties\")],m=0;m<h.length;m++)for(r=0;r<p.length;r++)st(h[m],p[r],null,f)}var y=t(\"CSSStyleSheet\");dt(y,\"insertRule\",0,function(e){return ze(e,!0)}),dt(y,\"replace\",0,function(e){return ze(e,!0)}),dt(y,\"replaceSync\",0,function(e){return ze(e,!0)});var k=[\"appendChild\",\"insertBefore\",\"replaceChild\"];for(r=0;r<k.length;r++)gt(i,k[r]);var v=[\"append\",\"prepend\",\"after\",\"before\",\"replaceWith\",\"insertAdjacentElement\"];for(r=0;r<v.length;r++)gt(o,v[r]);gt(t(\"DocumentFragment\"),\"append\"),gt(t(\"DocumentFragment\"),\"prepend\");var b=[\"importNode\",\"adoptNode\"];for(r=0;r<b.length;r++)(function(e){\"function\"==typeof e&&(n[b[r]]=function(){var t=e.apply(this,arguments);return t&&t.nodeType&&at(t),t})})(n&&n[b[r]]);st(Ae(n,\"cookie\")?n:t(\"HTMLDocument\"),\"cookie\",null,function(e,t){return r=t,n=\"document.cookie\",o=Me(r=String(r)),(i=o?Le(o):null)&&!xe(i.category)&&!function(e){if(/;\\s*max-age\\s*=\\s*(?:0|-)/i.test(e))return!0;var t=/;\\s*expires\\s*=\\s*([^;]+)/i.exec(e);return!!(t&&Date.parse(t[1])<(new Date).getTime())}(r)&&(he(\"cookie\",o,i,\"refused\",n),i)?a:t;var r,n,o,i});var w=t(\"CookieStore\");if(w&&\"function\"==typeof w.set){var x=w.set;w.set=function(t){var r=\"string\"==typeof t?t:t&&t.name||\"\",n=r?Le(String(r)):null;return n&&!xe(n.category)?(he(\"cookie\",r,n,\"refused\",\"cookieStore\"),e.Promise.resolve()):x.apply(this,arguments)}}if(\"function\"==typeof e.fetch){var S=e.fetch;e.fetch=function(t){var r=fe(t);if(r){he(\"fetch\",t,r,\"dropped\");try{return e.Promise.resolve(new e.Response(null,{status:204,statusText:\"No Content\"}))}catch(t){return new e.Promise(ve)}}return pe(t,\"fetch\"),S.apply(this,arguments)}}var T=t(\"XMLHttpRequest\");if(T){var A=T.open,_=T.send;T.open=function(e,t){var r=fe(t);return this.__gdrockBlocked=r?{url:ne(t),rule:r}:null,r||pe(t,\"xhr\"),A.apply(this,arguments)},T.send=function(){var e=this.__gdrockBlocked;if(e){var t=this;return he(\"xhr\",e.url,e.rule,\"dropped\"),void ye(function(){me(t,\"error\"),me(t,\"loadend\")})}return _.apply(this,arguments)}}var C=t(\"Navigator\");if(C&&\"function\"==typeof C.sendBeacon){var E=C.sendBeacon;C.sendBeacon=function(e){var t=fe(e);return t?(he(\"beacon\",e,t,\"dropped\"),!0):(pe(e,\"beacon\"),E.apply(this,arguments))}}pt(e,\"WebSocket\",\"websocket\",!0),pt(e,\"EventSource\",\"eventsource\",!0),pt(e,\"Worker\",\"worker\",!1),pt(e,\"SharedWorker\",\"worker\",!1);var L=function(e){if(!xe(\"analytics\")||!xe(\"marketing\"))for(var t=e.composedPath?e.composedPath():[e.target],r=0;r<t.length;r++){var n=t[r];if(n&&(\"A\"===n.nodeName||\"AREA\"===n.nodeName)&&n.getAttribute){var a=je(n.getAttribute(\"ping\"));return void(a.blocked&&(M.call(n,\"ping\",a.keep),He(n,a,\"click\")))}}};try{e.addEventListener(\"click\",L,!0),e.addEventListener(\"auxclick\",L,!0)}catch(e){}}(t)}!function(t,r){if(t&&!t.__gdrockObserved){try{t.__gdrockObserved=!0}catch(e){}var n=t.defaultView&&t.defaultView.MutationObserver||e.MutationObserver;n&&new n(function(e){for(var t=0;t<e.length;t++){var r=e[t],n=r.target;if(\"characterData\"!==r.type){n&&\"STYLE\"===n.nodeName&&r.addedNodes.length&&rt(n);for(var a=r.addedNodes,o=0;o<a.length;o++)at(a[o])}else n.parentNode&&\"STYLE\"===n.parentNode.nodeName&&rt(n.parentNode)}}).observe(t,{childList:!0,subtree:!0,characterData:!0}),r&&t.documentElement?at(t.documentElement):ot(t)}}(r,t!==e)}function st(e,t,r,n){var o=Ae(e,t);if(o&&o.set&&o.configurable)try{Object.defineProperty(e,t,{configurable:!0,enumerable:o.enumerable,get:function(){if(r&&this.getAttribute(\"data-gdrock-held\")){var e=this.getAttribute(r);if(null!=e)return e}return o.get.call(this)},set:function(e){var t=n(this,e);t!==a&&o.set.call(this,t)}})}catch(e){}}function lt(e,t,r){var n=Ae(e,t);if(n&&n.get&&n.configurable)try{Object.defineProperty(e,t,{configurable:!0,enumerable:n.enumerable,get:function(){var e=n.get.call(this);try{r(e)}catch(e){}return e}})}catch(e){}}function dt(e,t,r,n){var a=e&&e[t];\"function\"==typeof a&&(e[t]=function(){for(var e=Array.prototype.slice.call(arguments),t=0;t<e.length;t++)(r<0||t===r)&&(e[t]=n(e[t],this));return a.apply(this,e)})}function ut(e,t){if(\"IFRAME\"===e.nodeName)return(t=t||[]).push(e),t;if((1===e.nodeType||11===e.nodeType)&&e.firstChild&&e.querySelectorAll)for(var r=e.querySelectorAll(\"iframe\"),n=0;n<r.length;n++)(t=t||[]).push(r[n]);return t}function gt(e,t){var r=e&&e[t];\"function\"==typeof r&&(e[t]=function(){for(var e=null,t=9===this.nodeType?this:this.ownerDocument,n=0;n<arguments.length;n++){var a=arguments[n];a&&\"object\"==typeof a&&a.nodeType&&(a.ownerDocument&&a.ownerDocument!==t&&at(a),e=ut(a,e))}var o=r.apply(this,arguments);if(e)for(n=0;n<e.length;n++)!1!==e[n].isConnected&&it(e[n]);return o})}function ft(e,t,r){var n;try{n=new e.EventTarget}catch(t){n=e.document.createElement(\"span\")}for(var a in t)try{n[a]=t[a]}catch(e){}return ye(function(){for(var e=0;e<r.length;e++){me(n,r[e]);var t=n[\"on\"+r[e]];if(\"function\"==typeof t)try{t.call(n,{type:r[e],target:n})}catch(e){}}}),n}function pt(e,t,r,n){var a=e[t];if(\"function\"==typeof a){var o=function(o,i){var c=ne(o),s=n?fe(c):oe(c);return s?(he(r,c,s,\"dropped\"),V[t](e,c)):(pe(c,r),arguments.length>1?new a(o,i):new a(o))};o.prototype=a.prototype;for(var i=[\"CONNECTING\",\"OPEN\",\"CLOSING\",\"CLOSED\"],c=0;c<i.length;c++)i[c]in a&&(o[i[c]]=a[i[c]]);try{e[t]=o}catch(e){}}}function ht(e,t){try{return\"function\"==typeof e[t]?e[t]():null}catch(e){return null}}function mt(e){return{marketingAllowed:ht(e,\"marketingAllowed\"),analyticsAllowed:ht(e,\"analyticsProcessingAllowed\"),region:ht(e,\"getRegion\"),shouldShowBanner:ht(e,\"shouldShowBanner\")}}function yt(e){var t=e.customerPrivacy;if(!t||\"function\"!=typeof t.setTrackingConsent)return J.error=\"Shopify.customerPrivacy.setTrackingConsent not available\",!1;J.apiFound=!0,E||J.beforeChoice||(J.beforeChoice=mt(t));var r={analytics:xe(\"analytics\"),marketing:xe(\"marketing\"),preferences:xe(\"analytics\"),sale_of_data:xe(\"marketing\")},n=JSON.stringify(r);if(t===J.sentTo&&n===J.sentKey)return!0;J.sentTo=t,J.sentKey=n;try{t.setTrackingConsent(r,function(e){e&&e.error?J.error=String(e.error):(J.updates++,J.lastSent=r,J.error=null)})}catch(e){J.error=String(e&&e.message||e)}return!0}function kt(){var t=e.Shopify;if(t&&\"object\"==typeof t)if(J.present=!0,t.customerPrivacy&&\"function\"==typeof t.customerPrivacy.setTrackingConsent)yt(t);else if(\"function\"!=typeof t.loadFeatures)J.error=\"window.Shopify has no loadFeatures or customerPrivacy\";else{if(J.loadRequested)return;J.loadRequested=!0;try{t.loadFeatures([{name:\"consent-tracking-api\",version:\"0.1\"}],function(e){e?J.error=\"loadFeatures: \"+String(e&&e.message||e):yt(t)})}catch(e){J.error=String(e&&e.message||e)}}}function vt(e,t,r){var n=Ae(e,t);if(n&&(!n.configurable||n.get||n.set))return!1;var a=n?n.value:void 0;try{Object.defineProperty(e,t,{configurable:!0,enumerable:!0,get:function(){return a},set:function(e){a=e,r(e)}})}catch(e){return!1}return!0}function bt(e){if(e&&\"object\"==typeof e&&!e.__gdrockWatched){try{Object.defineProperty(e,\"__gdrockWatched\",{value:!0})}catch(e){}J.present=!0,J.caughtAt||(J.caughtAt=(new Date).getTime()-n),ke(kt),vt(e,\"loadFeatures\",function(){ke(kt)}),vt(e,\"customerPrivacy\",function(){ke(kt)})}}function wt(){ot(t),e.Shopify&&(bt(e.Shopify),J.apiFound||kt())}function xt(e){if(j){var r,n=location.hostname.split(\".\"),a=[\"\"],o=[\"/\"];for(r=0;r<n.length-1;r++)a.push(\"; domain=.\"+n.slice(r).join(\".\"));a.push(\"; domain=\"+location.hostname);var i=location.pathname.split(\"/\");for(r=2;r<=i.length;r++)o.push(i.slice(0,r).join(\"/\")||\"/\");for(r=0;r<a.length;r++)for(var c=0;c<o.length;c++)try{j.set.call(t,e+\"=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=\"+o[c]+a[r])}catch(e){}}}function St(e){for(var r=[],n=(j?String(j.get.call(t)||\"\"):\"\").split(\";\"),a=0;a<n.length;a++){var o=Me(n[a]),i=o?Le(o):null;i&&e[i.category]&&-1===r.indexOf(o)&&(xt(o),r.push(o))}return r}function Tt(){var e=E||{};return{necessary:!0,analytics:!!e.analytics,marketing:!!e.marketing,choiceMade:!!E,timestamp:e.timestamp||null}}function At(e){Te(E),function(){for(var e=[],t=0;t<H.length;t++)xe(H[t].category)?Ge(H[t]):e.push(H[t]);H=e}(),kt(),function(){for(var e=0;e<X.length;e++)try{X[e](Tt())}catch(e){}}(),e&&function(e){var t={},r=[];if(e.analytics&&!E.analytics&&(t.analytics=1,r.push(\"analytics\")),e.marketing&&!E.marketing&&(t.marketing=1,r.push(\"marketing\")),r.length){$={at:(new Date).toISOString(),categories:r,cookiesDeleted:St(t),reloaded:f};try{sessionStorage.setItem(\"gdrock_withdrawal\",JSON.stringify($))}catch(e){}f&&setTimeout(function(){location.reload()},150)}}(e)}function _t(e){for(var t=\"<script\",r=0;r<e.attributes.length;r++)t+=\" \"+e.attributes[r].name+(e.attributes[r].value?'=\"'+e.attributes[r].value+'\"':\"\");return t+\">\"}function Ct(){var n,a={analytics:[],marketing:[]},c={held:0,released:0,dropped:0,refused:0,loadedByClick:0},s=[];for(n=0;n<T.length;n++){var f=T[n];(a[f.category]||(a[f.category]=[])).push({type:f.type,vendor:f.vendor,url:f.url,action:f.action,via:f.via,ms:f.ms}),\"held\"===f.action?c.held++:\"released\"===f.action?c.released++:\"dropped\"===f.action?c.dropped++:\"refused\"===f.action?(c.refused++,-1===s.indexOf(f.url)&&s.push(f.url)):\"loaded by click\"===f.action&&c.loadedByClick++}var h=function(){var e,r,n=[],a=[];for(e=0;e<v.length;e++)try{a.push([new RegExp(v[e][0],\"i\"),v[e][1]])}catch(e){}var i=t.getElementsByTagName(\"script\");for(e=0;e<i.length;e++){var c=i[e];if(!(c===o||c.getAttribute(\"src\")||c.getAttribute(\"data-gdrock-held\")||c.getAttribute(\"data-gdrock-category\"))&&A.test(c.getAttribute(\"type\")||\"\")){var s=String(c.text||\"\");for(r=0;r<a.length;r++){var l=a[r][0].exec(s);if(l){n.push({vendor:a[r][1],snippet:s.slice(Math.max(0,l.index-40),l.index+80).replace(/\\s+/g,\" \"),openTag:_t(c),starts:s.replace(/^\\s+/,\"\").slice(0,60)});break}}}}return n}(),m=function(){var r,n=[],a=[],o={},i=t.querySelectorAll(\"link[href]\");for(r=0;r<i.length;r++)n.push(i[r].getAttribute(\"href\"));var c=t.getElementsByTagName(\"style\");for(r=0;r<c.length;r++)for(var s,l=/@import\\s+(?:url\\()?\\s*[\"']?([^\"')\\s;]+)/gi;s=l.exec(c[r].textContent||\"\");)n.push(s[1]);try{var d=e.performance&&performance.getEntriesByType?performance.getEntriesByType(\"resource\"):[];for(r=0;r<d.length;r++)n.push(d[r].name)}catch(e){}for(r=0;r<n.length;r++){var u=ce(y,n[r]);u&&!o[n[r]]&&(o[n[r]]=1,a.push({provider:u[0],url:String(n[r]).slice(0,200)}))}return a}(),b=function(){var e,r=[],n=t.getElementsByTagName(\"iframe\");for(e=0;e<n.length;e++){var a=n[e].getAttribute(\"src\")||\"\",o=ce(k,a);o&&r.push({provider:o[0],src:a.slice(0,200),state:\"loaded\"})}for(e=0;e<H.length;e++)\"embed\"===H[e].kind&&r.push({provider:H[e].provider[0],src:H[e].src.slice(0,200),state:\"click-to-load\"});return r}(),w=function(){try{var t=e.performance&&performance.getEntriesByType?performance.getEntriesByType(\"resource\"):[];t.length<Z&&(Z=0);for(var r=Z;r<t.length;r++)pe(t[r].name,t[r].initiatorType||\"resource\");Z=t.length}catch(e){}var n=[];for(var a in x)x.hasOwnProperty(a)&&!x[a].known&&n.push({host:a,count:x[a].count,via:x[a].via.slice(),droppedByStrict:x[a].dropped});return n.sort(function(e,t){return t.count-e.count}),n}(),S=[],_={};for(n=0;n<T.length;n++){var L=T[n];\"html\"!==L.via||\"script\"!==L.type&&\"img\"!==L.type&&\"iframe\"!==L.type&&\"link\"!==L.type||_[L.url]||(_[L.url]=1,S.push({type:L.type,vendor:L.vendor,url:L.url,category:L.category}))}var M=J.present?function(){for(var t,r,n=J.beforeChoice,a=E?null:(r=(t=e.Shopify)&&t.customerPrivacy)?mt(r):null,o=[],i=[n,a],c=0;c<i.length;c++){var s=i[c];s&&(!0===s.marketingAllowed&&-1===o.indexOf(\"marketingAllowed() = true\")&&o.push(\"marketingAllowed() = true\"),!0===s.analyticsAllowed&&-1===o.indexOf(\"analyticsProcessingAllowed() = true\")&&o.push(\"analyticsProcessingAllowed() = true\"),!1===s.shouldShowBanner&&-1===o.indexOf(\"shouldShowBanner() = false\")&&o.push(\"shouldShowBanner() = false\"))}return o.length?{signals:o,region:n&&n.region||a&&a.region||null}:null}():null,P=[];C.foundOwnTag||P.push(\"GDRock could not identify its own <script> tag. Load it with a plain <script src> tag, not from another script.\"),C.async&&P.push(\"Remove async/defer from the GDRock script tag: it has to run before everything else.\");var I=[];for(n=0;n<C.ranBefore.length;n++)C.ranBefore[n].tracker&&I.push(C.ranBefore[n].tracker);for(C.ranBefore.length&&P.push(\"Move the GDRock script above the \"+C.ranBefore.length+\" script(s) that ran before it\"+(I.length?\", including \"+I.join(\", \")+\", which ran unblocked\":\"\")+\".\"),n=0;n<h.length;n++)P.push(\"Inline \"+h[n].vendor+' code runs before anyone can block it. Tag that <script> type=\"text/plain\" data-gdrock-category=\"'+Et(h[n].vendor)+'\" so it waits for consent.');for(n=0;n<S.length;n++)P.push(\"The \"+S[n].vendor+\" \"+S[n].type+\" is written directly in the HTML, so the browser may fetch it once before GDRock can act. \"+(\"img\"===S[n].type?\"Delete that <img> tag.\":\"Change src to data-gdrock-src\"+(\"script\"===S[n].type?' and add type=\"text/plain\"':\"\")+\".\"));var O={};for(n=0;n<m.length;n++)O[m[n].provider]=1;for(var R in O)P.push(R+\" are loaded from \"+R.split(\" \")[0]+\"'s servers, which sends every visitor's IP address there. Host the font files on your own server.\");for(n=0;n<b.length;n++)\"loaded\"!==b[n].state||xe(\"marketing\")||P.push(\"A \"+b[n].provider+' embed loaded before consent. Add data-gdrock-embeds=\"click\" to the GDRock script tag for a click-to-load placeholder.');return J.present&&!J.apiFound&&P.push(\"This is a Shopify store but the Customer Privacy API could not be reached (\"+(J.error||\"not loaded yet\")+\"), so app pixels are not told about consent.\"),M?P.push(\"Shopify treated this visitor as trackable before any choice (\"+M.signals.join(\", \")+(M.region?\", region \"+M.region:\"\")+\"). App pixels can act on that before GDRock's signal arrives. In Shopify admin > Settings > Customer privacy, require consent for this region.\"):J.present&&P.push(\"In Shopify admin > Settings > Customer privacy, require consent for your visitors' regions, so app pixels wait for GDRock's signal instead of Shopify's regional default.\"),w.length&&P.push(w.length+\" third-party host(s) are not on GDRock's list: \"+w.slice(0,5).map(function(e){return e.host}).join(\", \")+(w.length>5?\" and more\":\"\")+'. Check what each one is; strict mode (data-gdrock-strict=\"true\") drops their beacons until consent.'),{version:r,siteId:i||null,advancedConsentMode:l,embedsClickToLoad:d,fontsToBunny:u,strict:{on:g,allow:p.slice()},install:{firstScript:C.firstScript,foundOwnTag:C.foundOwnTag,asyncOrDefer:C.async,ranBefore:C.ranBefore,tag:o?o.outerHTML:null},consent:Tt(),blocked:a,counts:c,cookiesRefused:s,stillHeld:H.length,framesPatched:Y,untaggedInline:h,fromHtml:S,fonts:m,fontRewrites:B.slice(),embeds:b,unknownThirdParty:w,shopify:{present:J.present,apiFound:J.apiFound,loadRequested:J.loadRequested,caughtAtMs:J.caughtAt,updated:J.updates>0,updates:J.updates,lastSent:J.lastSent,error:J.error,beforeChoice:J.beforeChoice,trackableBeforeChoice:M},withdrawal:$,manualWork:P}}function Et(e){return/Google Analytics|Google Tag Manager|Google tag|Hotjar|Clarity|Yandex/.test(e)?\"analytics\":\"marketing\"}function Lt(){return Tt()}}(window,document);";

// -- Embedded GDRock banner (gdrock-banner.js, minified) -----------
// Generated by tools/build-cdn.js from gdrock-banner.js: edit that file, not this line.
const GDROCK_JS = "/*! GDRock Cookie Banner v2.0.0 | cdn.gdrock.com | source: gdrock-banner.js */\n!function(){\"use strict\";var e,t=document.currentScript||(e=document.getElementsByTagName(\"script\"))[e.length-1];function a(e){return t?t.getAttribute(e):null}var n=a(\"data-site-id\");if(n){var r=String(null!=a(\"data-api\")?a(\"data-api\"):\"https://cdn.gdrock.com\").replace(/\\/+$/,\"\"),i=\"off\"===r,o=\"gdrock_consent_\"+n,s=\"off\"!==a(\"data-manage-button\"),c=\"off\"!==a(\"data-branding\"),l={en:{title:\"We use cookies\",desc:\"Necessary cookies keep this site running. With your permission we also use analytics cookies to understand how the site is used, and marketing cookies to measure and personalise ads. You can change your choice at any time.\",reject:\"Reject all\",accept:\"Accept all\",customize:\"Customize\",save:\"Save my choices\",back:\"Back\",necessary:\"Necessary\",necessaryDesc:\"Needed for the site to work, such as your basket and remembering this choice.\",alwaysOn:\"Always on\",analytics:\"Analytics\",analyticsDesc:\"Counts visits and shows how the site is used, so it can be improved.\",marketing:\"Marketing\",marketingDesc:\"Measures ads and lets advertising partners show you relevant ads.\",manage:\"Cookie settings\",policy:\"Privacy policy\",close:\"Close\",poweredBy:\"Consent by GDRock\",settingsTitle:\"Your cookie choices\"},de:{title:\"Wir verwenden Cookies\",desc:\"Notwendige Cookies halten diese Website am Laufen. Mit Ihrer Einwilligung nutzen wir au\\xdferdem Analyse-Cookies, um zu verstehen, wie die Website genutzt wird, und Marketing-Cookies, um Werbung zu messen und zu personalisieren. Sie k\\xf6nnen Ihre Wahl jederzeit \\xe4ndern.\",reject:\"Alle ablehnen\",accept:\"Alle akzeptieren\",customize:\"Anpassen\",save:\"Auswahl speichern\",back:\"Zur\\xfcck\",necessary:\"Notwendig\",necessaryDesc:\"F\\xfcr den Betrieb der Website n\\xf6tig, etwa f\\xfcr den Warenkorb und um diese Auswahl zu speichern.\",alwaysOn:\"Immer aktiv\",analytics:\"Analyse\",analyticsDesc:\"Z\\xe4hlt Besuche und zeigt, wie die Website genutzt wird, damit sie verbessert werden kann.\",marketing:\"Marketing\",marketingDesc:\"Misst Werbung und l\\xe4sst Werbepartner Ihnen passende Anzeigen zeigen.\",manage:\"Cookie-Einstellungen\",policy:\"Datenschutzerkl\\xe4rung\",close:\"Schlie\\xdfen\",poweredBy:\"Einwilligung \\xfcber GDRock\",settingsTitle:\"Ihre Cookie-Auswahl\"},fr:{title:\"Nous utilisons des cookies\",desc:\"Les cookies n\\xe9cessaires font fonctionner ce site. Avec votre accord, nous utilisons aussi des cookies de mesure d'audience pour comprendre comment le site est utilis\\xe9, et des cookies marketing pour mesurer et personnaliser la publicit\\xe9. Vous pouvez changer d'avis \\xe0 tout moment.\",reject:\"Tout refuser\",accept:\"Tout accepter\",customize:\"Personnaliser\",save:\"Enregistrer mes choix\",back:\"Retour\",necessary:\"N\\xe9cessaires\",necessaryDesc:\"Indispensables au fonctionnement du site, par exemple pour votre panier et pour m\\xe9moriser ce choix.\",alwaysOn:\"Toujours actifs\",analytics:\"Mesure d'audience\",analyticsDesc:\"Compte les visites et montre comment le site est utilis\\xe9, pour pouvoir l'am\\xe9liorer.\",marketing:\"Marketing\",marketingDesc:\"Mesure la publicit\\xe9 et permet \\xe0 nos partenaires publicitaires de vous montrer des annonces pertinentes.\",manage:\"Param\\xe8tres des cookies\",policy:\"Politique de confidentialit\\xe9\",close:\"Fermer\",poweredBy:\"Consentement g\\xe9r\\xe9 par GDRock\",settingsTitle:\"Vos choix de cookies\"},nl:{title:\"Wij gebruiken cookies\",desc:\"Noodzakelijke cookies houden deze website draaiende. Met uw toestemming gebruiken we ook analytische cookies om te begrijpen hoe de site wordt gebruikt, en marketingcookies om advertenties te meten en te personaliseren. U kunt uw keuze altijd wijzigen.\",reject:\"Alles weigeren\",accept:\"Alles accepteren\",customize:\"Aanpassen\",save:\"Keuze opslaan\",back:\"Terug\",necessary:\"Noodzakelijk\",necessaryDesc:\"Nodig om de website te laten werken, bijvoorbeeld voor uw winkelmand en om deze keuze te onthouden.\",alwaysOn:\"Altijd aan\",analytics:\"Analytisch\",analyticsDesc:\"Telt bezoeken en laat zien hoe de site wordt gebruikt, zodat hij beter kan worden.\",marketing:\"Marketing\",marketingDesc:\"Meet advertenties en laat advertentiepartners u relevante advertenties tonen.\",manage:\"Cookie-instellingen\",policy:\"Privacyverklaring\",close:\"Sluiten\",poweredBy:\"Toestemming via GDRock\",settingsTitle:\"Uw cookiekeuze\"},es:{title:\"Usamos cookies\",desc:\"Las cookies necesarias hacen funcionar este sitio. Con tu permiso, tambi\\xe9n usamos cookies anal\\xedticas para entender c\\xf3mo se usa el sitio y cookies de marketing para medir y personalizar la publicidad. Puedes cambiar tu elecci\\xf3n en cualquier momento.\",reject:\"Rechazar todo\",accept:\"Aceptar todo\",customize:\"Configurar\",save:\"Guardar mi elecci\\xf3n\",back:\"Volver\",necessary:\"Necesarias\",necessaryDesc:\"Imprescindibles para que el sitio funcione, por ejemplo para tu cesta y para recordar esta elecci\\xf3n.\",alwaysOn:\"Siempre activas\",analytics:\"Anal\\xedticas\",analyticsDesc:\"Cuentan las visitas y muestran c\\xf3mo se usa el sitio, para poder mejorarlo.\",marketing:\"Marketing\",marketingDesc:\"Miden la publicidad y permiten a nuestros socios publicitarios mostrarte anuncios relevantes.\",manage:\"Configuraci\\xf3n de cookies\",policy:\"Pol\\xedtica de privacidad\",close:\"Cerrar\",poweredBy:\"Consentimiento gestionado por GDRock\",settingsTitle:\"Tus preferencias de cookies\"},it:{title:\"Utilizziamo i cookie\",desc:\"I cookie necessari fanno funzionare questo sito. Con il tuo consenso usiamo anche cookie analitici per capire come viene usato il sito e cookie di marketing per misurare e personalizzare la pubblicit\\xe0. Puoi cambiare la tua scelta in qualsiasi momento.\",reject:\"Rifiuta tutto\",accept:\"Accetta tutto\",customize:\"Personalizza\",save:\"Salva le mie scelte\",back:\"Indietro\",necessary:\"Necessari\",necessaryDesc:\"Indispensabili per il funzionamento del sito, ad esempio per il carrello e per ricordare questa scelta.\",alwaysOn:\"Sempre attivi\",analytics:\"Analitici\",analyticsDesc:\"Contano le visite e mostrano come viene usato il sito, per migliorarlo.\",marketing:\"Marketing\",marketingDesc:\"Misurano la pubblicit\\xe0 e permettono ai partner pubblicitari di mostrarti annunci pertinenti.\",manage:\"Impostazioni cookie\",policy:\"Informativa sulla privacy\",close:\"Chiudi\",poweredBy:\"Consenso gestito da GDRock\",settingsTitle:\"Le tue scelte sui cookie\"},he:{title:\"\\u05d0\\u05e0\\u05d7\\u05e0\\u05d5 \\u05de\\u05e9\\u05ea\\u05de\\u05e9\\u05d9\\u05dd \\u05d1\\u05e2\\u05d5\\u05d2\\u05d9\\u05d5\\u05ea\",desc:\"\\u05e2\\u05d5\\u05d2\\u05d9\\u05d5\\u05ea \\u05d4\\u05db\\u05e8\\u05d7\\u05d9\\u05d5\\u05ea \\u05de\\u05e4\\u05e2\\u05d9\\u05dc\\u05d5\\u05ea \\u05d0\\u05ea \\u05d4\\u05d0\\u05ea\\u05e8. \\u05d1\\u05d4\\u05e1\\u05db\\u05de\\u05ea\\u05da \\u05e0\\u05e9\\u05ea\\u05de\\u05e9 \\u05d2\\u05dd \\u05d1\\u05e2\\u05d5\\u05d2\\u05d9\\u05d5\\u05ea \\u05e0\\u05d9\\u05ea\\u05d5\\u05d7 \\u05db\\u05d3\\u05d9 \\u05dc\\u05d4\\u05d1\\u05d9\\u05df \\u05d0\\u05d9\\u05da \\u05de\\u05e9\\u05ea\\u05de\\u05e9\\u05d9\\u05dd \\u05d1\\u05d0\\u05ea\\u05e8, \\u05d5\\u05d1\\u05e2\\u05d5\\u05d2\\u05d9\\u05d5\\u05ea \\u05e9\\u05d9\\u05d5\\u05d5\\u05e7 \\u05db\\u05d3\\u05d9 \\u05dc\\u05de\\u05d3\\u05d5\\u05d3 \\u05d5\\u05dc\\u05d4\\u05ea\\u05d0\\u05d9\\u05dd \\u05e4\\u05e8\\u05e1\\u05d5\\u05dd. \\u05d0\\u05e4\\u05e9\\u05e8 \\u05dc\\u05e9\\u05e0\\u05d5\\u05ea \\u05d0\\u05ea \\u05d4\\u05d1\\u05d7\\u05d9\\u05e8\\u05d4 \\u05d1\\u05db\\u05dc \\u05e2\\u05ea.\",reject:\"\\u05d3\\u05d7\\u05d9\\u05d9\\u05d4 \\u05e9\\u05dc \\u05d4\\u05db\\u05dc\",accept:\"\\u05d0\\u05d9\\u05e9\\u05d5\\u05e8 \\u05e9\\u05dc \\u05d4\\u05db\\u05dc\",customize:\"\\u05d4\\u05ea\\u05d0\\u05de\\u05d4 \\u05d0\\u05d9\\u05e9\\u05d9\\u05ea\",save:\"\\u05e9\\u05de\\u05d9\\u05e8\\u05ea \\u05d4\\u05d1\\u05d7\\u05d9\\u05e8\\u05d4\",back:\"\\u05d7\\u05d6\\u05e8\\u05d4\",necessary:\"\\u05d4\\u05db\\u05e8\\u05d7\\u05d9\\u05d5\\u05ea\",necessaryDesc:\"\\u05e0\\u05d3\\u05e8\\u05e9\\u05d5\\u05ea \\u05dc\\u05e4\\u05e2\\u05d5\\u05dc\\u05ea \\u05d4\\u05d0\\u05ea\\u05e8, \\u05dc\\u05de\\u05e9\\u05dc \\u05dc\\u05e1\\u05dc \\u05d4\\u05e7\\u05e0\\u05d9\\u05d5\\u05ea \\u05d5\\u05dc\\u05e9\\u05de\\u05d9\\u05e8\\u05ea \\u05d4\\u05d1\\u05d7\\u05d9\\u05e8\\u05d4 \\u05d4\\u05d6\\u05d5.\",alwaysOn:\"\\u05ea\\u05de\\u05d9\\u05d3 \\u05e4\\u05e2\\u05d9\\u05dc\\u05d5\\u05ea\",analytics:\"\\u05e0\\u05d9\\u05ea\\u05d5\\u05d7\",analyticsDesc:\"\\u05e1\\u05d5\\u05e4\\u05e8\\u05d5\\u05ea \\u05d1\\u05d9\\u05e7\\u05d5\\u05e8\\u05d9\\u05dd \\u05d5\\u05de\\u05e8\\u05d0\\u05d5\\u05ea \\u05d0\\u05d9\\u05da \\u05de\\u05e9\\u05ea\\u05de\\u05e9\\u05d9\\u05dd \\u05d1\\u05d0\\u05ea\\u05e8, \\u05db\\u05d3\\u05d9 \\u05e9\\u05d0\\u05e4\\u05e9\\u05e8 \\u05d9\\u05d4\\u05d9\\u05d4 \\u05dc\\u05e9\\u05e4\\u05e8 \\u05d0\\u05d5\\u05ea\\u05d5.\",marketing:\"\\u05e9\\u05d9\\u05d5\\u05d5\\u05e7\",marketingDesc:\"\\u05de\\u05d5\\u05d3\\u05d3\\u05d5\\u05ea \\u05e4\\u05e8\\u05e1\\u05d5\\u05dd \\u05d5\\u05de\\u05d0\\u05e4\\u05e9\\u05e8\\u05d5\\u05ea \\u05dc\\u05e9\\u05d5\\u05ea\\u05e4\\u05d9 \\u05e4\\u05e8\\u05e1\\u05d5\\u05dd \\u05dc\\u05d4\\u05e6\\u05d9\\u05d2 \\u05dc\\u05da \\u05de\\u05d5\\u05d3\\u05e2\\u05d5\\u05ea \\u05e8\\u05dc\\u05d5\\u05d5\\u05e0\\u05d8\\u05d9\\u05d5\\u05ea.\",manage:\"\\u05d4\\u05d2\\u05d3\\u05e8\\u05d5\\u05ea \\u05e2\\u05d5\\u05d2\\u05d9\\u05d5\\u05ea\",policy:\"\\u05de\\u05d3\\u05d9\\u05e0\\u05d9\\u05d5\\u05ea \\u05e4\\u05e8\\u05d8\\u05d9\\u05d5\\u05ea\",close:\"\\u05e1\\u05d2\\u05d9\\u05e8\\u05d4\",poweredBy:\"\\u05d4\\u05e1\\u05db\\u05de\\u05d4 \\u05d1\\u05d0\\u05de\\u05e6\\u05e2\\u05d5\\u05ea GDRock\",settingsTitle:\"\\u05d4\\u05d1\\u05d7\\u05d9\\u05e8\\u05d5\\u05ea \\u05e9\\u05dc\\u05da \\u05dc\\u05d2\\u05d1\\u05d9 \\u05e2\\u05d5\\u05d2\\u05d9\\u05d5\\u05ea\"}},d=function(){for(var e=[a(\"data-lang\"),document.documentElement.getAttribute(\"lang\")],t=navigator.languages||[navigator.language||navigator.userLanguage||\"\"],n=0;n<t.length;n++)e.push(t[n]);for(n=0;n<e.length;n++){var r=String(e[n]||\"\").toLowerCase().slice(0,2);if(\"iw\"===r&&(r=\"he\"),l[r])return r}return\"en\"}(),u=l[d],p=\"he\"===d,g={theme:\"auto\",accent:\"#2563eb\",bg:null,fg:null,radius:16,logoSize:28,titleSize:17,customLogoB64:null},m=null,f=null,b=null;document.addEventListener(\"click\",function(e){for(var t=e.target;t&&1===t.nodeType;){if(t.hasAttribute(\"data-gdrock-manage\")||/(^|\\s)gdrock-manage(\\s|$)/.test(t.className||\"\")||\"#gdrock-manage\"===t.getAttribute(\"href\"))return e.preventDefault(),void T(t);t=t.parentNode}});var h=!1;window.GDRock={show:function(){j(\"first\",{focus:!0,closable:!!v()})},manage:function(){T(document.activeElement)},consent:v,reset:function(){try{localStorage.removeItem(o)}catch(e){}}},\"loading\"===document.readyState?document.addEventListener(\"DOMContentLoaded\",R):R()}else window.console&&console.warn(\"[GDRock] Missing data-site-id\");function v(){try{return JSON.parse(localStorage.getItem(o))}catch(e){return null}}function k(e){var t=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(e||\"\").replace(/\\s/g,\"\"));if(!t)return null;var a=3===t[1].length?t[1].replace(/(.)/g,\"$1$1\"):t[1];return[parseInt(a.slice(0,2),16),parseInt(a.slice(2,4),16),parseInt(a.slice(4,6),16)]}function y(e){for(var t=[],a=0;a<3;a++){var n=e[a]/255;t.push(n<=.03928?n/12.92:Math.pow((n+.055)/1.055,2.4))}return.2126*t[0]+.7152*t[1]+.0722*t[2]}function x(e,t){var a=k(e),n=k(t);if(!a||!n)return 21;var r=y(a),i=y(n);return(Math.max(r,i)+.05)/(Math.min(r,i)+.05)}function w(e,t,a){return e&&k(e)&&x(e,t)>=(a||4.5)?e:x(\"#ffffff\",t)>=x(\"#0b1220\",t)?\"#ffffff\":\"#0b1220\"}function z(e,t,a){var n=k(e),r=k(t);if(!n||!r)return e;for(var i=\"#\",o=0;o<3;o++){var s=Math.round(n[o]+(r[o]-n[o])*a).toString(16);i+=s.length<2?\"0\"+s:s}return i}function A(e,t,a,n){return e=parseFloat(e),isFinite(e)?Math.max(t,Math.min(a,e)):n}function C(){if(!document.getElementById(\"gdrock-css\")){var e=document.createElement(\"style\");e.id=\"gdrock-css\",e.textContent=\".gdr,.gdr *{box-sizing:border-box}.gdr{--r:16px;--br:10px;font:15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:var(--fg);-webkit-text-size-adjust:100%}.gdr-panel{position:fixed;z-index:2147483646;left:var(--gap);right:var(--gap);bottom:var(--gap);max-width:var(--mw);margin:0 auto;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:var(--r);box-shadow:0 24px 64px rgba(2,6,23,.34),0 2px 8px rgba(2,6,23,.16);padding:var(--pad);max-height:calc(100vh - 2 * var(--gap));max-height:calc(100dvh - 2 * var(--gap));overflow-y:auto;overscroll-behavior:contain;transform:translateY(16px);opacity:0;transition:transform .22s cubic-bezier(.2,.8,.2,1),opacity .18s ease-out}.gdr-panel.gdr-in{transform:none;opacity:1}.gdr[data-pos=left] .gdr-panel{right:auto;margin:0}.gdr[data-pos=right] .gdr-panel{left:auto;margin:0}.gdr-noborder .gdr-panel{border-color:transparent}.gdr-blur .gdr-panel{-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}.gdr-head{display:flex;align-items:center;gap:10px;margin:0 0 8px}.gdr-logo{width:var(--logo);height:var(--logo);object-fit:contain;flex:none;border-radius:6px}.gdr-title{margin:0;font-size:var(--ts);line-height:1.25;font-weight:700;letter-spacing:-.01em;color:var(--fg)}.gdr-desc{margin:0 0 16px;font-size:var(--bs);line-height:1.55;color:var(--muted)}.gdr-desc a{color:var(--fg);text-decoration:underline;text-underline-offset:2px}.gdr-foot a{color:var(--muted);text-decoration:underline;text-underline-offset:2px;text-decoration-thickness:1px}.gdr-choice{display:grid;grid-template-columns:1fr 1fr;gap:10px}.gdr-btn{display:flex;align-items:center;justify-content:center;min-height:46px;margin:0;padding:10px 12px;border-radius:var(--br);border:1px solid var(--edge);background:var(--accent);color:var(--on-accent);font:inherit;font-size:15px;font-weight:650;line-height:1.2;text-align:center;cursor:pointer;-webkit-appearance:none;appearance:none;transition:filter .15s ease-out,transform .1s ease-out;word-break:normal;overflow-wrap:anywhere}.gdr-btn:hover{filter:brightness(1.08)}.gdr-btn:active{transform:scale(.98)}.gdr-link{display:block;width:100%;margin:10px 0 0;padding:10px 4px;min-height:44px;background:none;border:0;color:var(--fg);font:inherit;font-size:14px;font-weight:600;text-decoration:underline;text-underline-offset:3px;cursor:pointer;border-radius:8px}.gdr :focus{outline:none}.gdr :focus-visible{outline:3px solid var(--fg);outline-offset:2px}.gdr-cats{margin:4px 0 14px;padding:0;list-style:none}.gdr-cat{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:12px 0;border-top:1px solid var(--line)}.gdr-cat:first-child{border-top:0}.gdr-cat label{flex:1;cursor:pointer}.gdr-cat-name{display:block;font-weight:650;font-size:15px}.gdr-cat-desc{display:block;margin-top:2px;font-size:13px;line-height:1.45;color:var(--muted)}.gdr-sw{position:relative;flex:none;width:46px;height:28px;margin-top:2px}.gdr-sw input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer;z-index:1}.gdr-sw span{position:absolute;inset:0;border-radius:28px;background:var(--soft);border:2px solid var(--muted);transition:background .15s,border-color .15s}.gdr-sw span:before{content:'';position:absolute;width:18px;height:18px;left:3px;top:3px;border-radius:50%;background:var(--muted);transition:transform .15s ease-out,background .15s}.gdr-sw input:checked+span{background:var(--accent);border-color:var(--edge)}.gdr-sw input:checked+span:before{transform:translateX(18px);background:var(--on-accent)}.gdr-sw input:disabled{cursor:not-allowed}.gdr-sw input:disabled+span{opacity:.6}.gdr-sw input:focus-visible+span{outline:3px solid var(--fg);outline-offset:2px}.gdr-always{font-size:12px;font-weight:650;color:var(--muted);white-space:nowrap;margin-top:6px}.gdr-save{width:100%;margin:0 0 10px}.gdr-foot{margin:12px 0 0;font-size:12px;color:var(--muted);text-align:center}.gdr-x{position:absolute;top:10px;right:10px;width:44px;height:44px;border:0;border-radius:10px;background:none;color:var(--fg);font:inherit;font-size:22px;line-height:1;cursor:pointer}[dir=rtl] .gdr-x{right:auto;left:10px}.gdr-has-x .gdr-head{padding-right:40px}[dir=rtl] .gdr-has-x .gdr-head{padding-right:0;padding-left:40px}.gdr-manage{position:fixed;z-index:2147483645;left:16px;bottom:16px;width:44px;height:44px;padding:0;border-radius:50%;border:1px solid var(--line);background:var(--bg);color:var(--fg);box-shadow:0 6px 20px rgba(2,6,23,.22);cursor:pointer;display:flex;align-items:center;justify-content:center}[dir=rtl].gdr-manage{left:auto;right:16px}.gdr-manage svg{width:22px;height:22px}.gdr-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media (max-width:480px){.gdr-panel{--gap:8px !important;padding:18px 16px;border-radius:14px}.gdr-btn{font-size:14.5px;padding:10px 8px}}.gdr-still .gdr-panel{transition:none;transform:none}@media (prefers-reduced-motion:reduce){.gdr-panel{transition:none;transform:none}}\",(document.head||document.documentElement).appendChild(e)}}function D(e){return String(e).replace(/[&<>\"']/g,function(e){return{\"&\":\"&amp;\",\"<\":\"&lt;\",\">\":\"&gt;\",'\"':\"&quot;\",\"'\":\"&#39;\"}[e]})}function S(e){var t=function(e){var t,a=\"dark\"===e.theme||\"light\"!==e.theme&&window.matchMedia&&window.matchMedia(\"(prefers-color-scheme: dark)\").matches,n=k(e.bg)?e.bg:a?\"#0b1220\":\"#ffffff\",r=w(e.fg,n),i=w(z(r,n,.28),n),o=k(e.accentBtn)?e.accentBtn:k(e.accent)?e.accent:\"#2563eb\";if(k(e.btntext)&&x(e.btntext,o)>=4.5)t=e.btntext;else{var s=function(e){for(var t=0;t<=.4001;t+=.04){var a=t?z(e,\"#000000\",t):e;if(x(\"#ffffff\",a)>=4.5)return a}return null}(o);s?(o=s,t=\"#ffffff\"):t=w(null,o)}return{bg:n,fg:r,muted:i,accent:o,onAccent:t,edge:x(o,n)>=3?o:r,line:k(e.border)?e.border:z(r,n,.82),soft:z(r,n,.92),dark:a}}(g),a=e.style;a.setProperty(\"--bg\",t.bg),a.setProperty(\"--fg\",t.fg),a.setProperty(\"--muted\",t.muted),a.setProperty(\"--accent\",t.accent),a.setProperty(\"--on-accent\",t.onAccent),a.setProperty(\"--edge\",t.edge),a.setProperty(\"--line\",t.line),a.setProperty(\"--soft\",t.soft),a.setProperty(\"--r\",A(g.radius,0,32,16)+\"px\"),a.setProperty(\"--br\",A(g.btnRadius,0,28,10)+\"px\"),a.setProperty(\"--ts\",A(g.titleSize,13,26,17)+\"px\"),a.setProperty(\"--bs\",A(g.bodySize,12,18,14)+\"px\"),a.setProperty(\"--logo\",A(g.logoSize,16,64,28)+\"px\"),a.setProperty(\"--mw\",A(g.maxWidth,320,760,560)+\"px\"),a.setProperty(\"--pad\",A(g.padding,12,40,22)+\"px\"),a.setProperty(\"--gap\",A(g.gap,0,40,16)+\"px\")}function j(e,t){B(!0),C();var r=v()||{};(m=document.createElement(\"div\")).id=\"gdrock-root\",m.className=\"gdr\"+(!1===g.showBorder?\" gdr-noborder\":\"\")+(!1===g.blur?\"\":\" gdr-blur\")+(!1===g.animate?\" gdr-still\":\"\"),m.setAttribute(\"lang\",d),m.setAttribute(\"dir\",p?\"rtl\":\"ltr\"),m.setAttribute(\"data-pos\",\"left\"===g.position||\"right\"===g.position?g.position:\"center\"),S(m);var i,o=function(){var e=a(\"data-policy-url\")||g.policyUrl;if(e)return e;for(var t=document.querySelectorAll(\"a[href]\"),n=0;n<t.length;n++){var r=t[n].getAttribute(\"href\")||\"\",i=(t[n].textContent||\"\").toLowerCase();if(/privacy|datenschutz|confidentialit|privacidad|privacybeleid|informativa|privacy-policy/.test(r.toLowerCase()+\" \"+i))return r}return null}(),s='<div class=\"gdr-panel gdrock-banner'+(t.closable?\" gdr-has-x\":\"\")+'\" role=\"dialog\" aria-modal=\"false\" aria-labelledby=\"gdr-t\" aria-describedby=\"gdr-d\">';t.closable&&(s+='<button type=\"button\" class=\"gdr-x\" data-action=\"close\" aria-label=\"'+D(u.close)+'\">&times;</button>'),s+='<div class=\"gdr-head\">'+((i=g.customLogoB64&&String(g.customLogoB64).length>10&&/^data:image\\/(png|jpe?g|gif|webp|svg\\+xml);/i.test(g.customLogoB64)?g.customLogoB64:null)?'<img class=\"gdr-logo\" src=\"'+D(i)+'\" alt=\"\">':\"\")+'<h2 class=\"gdr-title\" id=\"gdr-t\">'+D(\"settings\"===e?u.settingsTitle:u.title)+\"</h2></div>\",s+='<p class=\"gdr-desc\" id=\"gdr-d\">'+D(u.desc)+(o?' <a href=\"'+D(o)+'\">'+D(u.policy)+\"</a>\":\"\")+\"</p>\",\"settings\"===e&&(s+='<ul class=\"gdr-cats\"><li class=\"gdr-cat\"><div><span class=\"gdr-cat-name\">'+D(u.necessary)+'</span><span class=\"gdr-cat-desc\">'+D(u.necessaryDesc)+'</span></div><span class=\"gdr-always\">'+D(u.alwaysOn)+\"</span></li>\"+M(\"analytics\",u.analytics,u.analyticsDesc,!0===r.analytics)+M(\"marketing\",u.marketing,u.marketingDesc,!0===r.marketing)+'</ul><button type=\"button\" class=\"gdr-btn gdr-save\" data-action=\"save\">'+D(u.save)+\"</button>\"),s+='<div class=\"gdr-choice\"><button type=\"button\" class=\"gdr-btn\" data-action=\"reject\">'+D(u.reject)+'</button><button type=\"button\" class=\"gdr-btn\" data-action=\"accept\">'+D(u.accept)+\"</button></div>\",\"settings\"!==e?s+='<button type=\"button\" class=\"gdr-link\" data-action=\"customize\">'+D(u.customize)+\"</button>\":t.closable||(s+='<button type=\"button\" class=\"gdr-link\" data-action=\"back\">'+D(u.back)+\"</button>\");var l=\"https://gdrock.com/?utm_source=banner&utm_medium=poweredby&utm_campaign=site_\"+encodeURIComponent(n);c&&(s+='<p class=\"gdr-foot\"><a href=\"'+l+'\" target=\"_blank\" rel=\"noopener noreferrer\">'+D(u.poweredBy)+\"</a></p>\"),s+=\"</div>\",m.innerHTML=s;var f=document.body||document.documentElement;f.insertBefore(m,f.firstChild);var b=m.firstChild;if(window.requestAnimationFrame?requestAnimationFrame(function(){requestAnimationFrame(function(){b.className+=\" gdr-in\"})}):b.className+=\" gdr-in\",m.addEventListener(\"click\",N),m.addEventListener(\"keydown\",P),t.focus){var h=\"settings\"===e?m.querySelector(\"input[data-key]\"):m.querySelector(\"[data-action=reject]\");h&&h.focus()}m.__view=e,m.__closable=!!t.closable}function M(e,t,a,n){var r=\"gdr-\"+e;return'<li class=\"gdr-cat\"><label for=\"'+r+'\"><span class=\"gdr-cat-name\">'+D(t)+'</span><span class=\"gdr-cat-desc\">'+D(a)+'</span></label><span class=\"gdr-sw\"><input type=\"checkbox\" role=\"switch\" id=\"'+r+'\" data-key=\"'+e+'\"'+(n?\" checked\":\"\")+'><span aria-hidden=\"true\"></span></span></li>'}function N(e){for(var t=e.target;t&&t!==m&&(!t.getAttribute||!t.getAttribute(\"data-action\"));)t=t.parentNode;var a=t&&t!==m?t.getAttribute(\"data-action\"):null;if(a)if(\"accept\"===a)E({accepted:!0,analytics:!0,marketing:!0});else if(\"reject\"===a)E({accepted:!1,analytics:!1,marketing:!1});else if(\"customize\"===a)j(\"settings\",{focus:!0,closable:!1});else if(\"back\"===a)j(\"first\",{focus:!0,closable:!1});else if(\"close\"===a)B(!1);else if(\"save\"===a){var n=!!(m.querySelector(\"input[data-key=analytics]\")||{}).checked,r=!!(m.querySelector(\"input[data-key=marketing]\")||{}).checked;E({accepted:n||r,analytics:n,marketing:r})}}function P(e){\"Escape\"!==e.key&&27!==e.keyCode||!m||(m.__closable?(e.preventDefault(),B(!1)):\"settings\"===m.__view&&(e.preventDefault(),j(\"first\",{focus:!0,closable:!1})))}function B(e){if(m){var t=m.contains(document.activeElement);if(m.parentNode&&m.parentNode.removeChild(m),m=null,!e){I();var a=b&&document.contains(b)?b:f;b=null,t&&a&&a.focus&&a.focus()}}}function E(e){(function(e){e.timestamp=(new Date).toISOString();try{localStorage.setItem(o,JSON.stringify(e))}catch(e){}!function(e){if(!i)try{fetch(r+\"/api/consent\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify({site_id:n,accepted:e.accepted,analytics:e.analytics,marketing:e.marketing}),keepalive:!0}).catch(function(){})}catch(e){}}(e);try{window.dispatchEvent(new CustomEvent(\"gdrock:consent\",{detail:e}))}catch(e){}})(e),B(!1)}function I(){s&&v()&&!m&&(C(),f||((f=document.createElement(\"button\")).type=\"button\",f.className=\"gdr gdr-manage\",f.setAttribute(\"aria-label\",u.manage),f.setAttribute(\"title\",u.manage),f.setAttribute(\"lang\",d),p&&f.setAttribute(\"dir\",\"rtl\"),f.innerHTML='<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3l7 3v5c0 4.4-3 8.3-7 9.5C8 19.3 5 15.4 5 11V6l7-3z\"/><path d=\"M9.2 12.2l1.9 1.9 3.7-3.9\"/></svg><span class=\"gdr-sr\">'+D(u.manage)+\"</span>\",f.addEventListener(\"click\",function(){T(f)})),S(f),f.parentNode||(document.body||document.documentElement).appendChild(f))}function T(e){b=e&&e.focus?e:document.activeElement,f&&f.parentNode&&f.parentNode.removeChild(f),j(\"settings\",{focus:!0,closable:!!v()})}function L(e){if(!h)if(h=!0,e&&e.blocked){window.console&&console.warn(\"[GDRock] Not authorised: \"+n);try{localStorage.removeItem(o)}catch(e){}}else{for(var t in e)e.hasOwnProperty(t)&&null!=e[t]&&(g[t]=e[t]);v()?I():j(\"first\",{focus:!1,closable:!1})}}function R(){if(i)L({});else{var e=!1,t=setTimeout(function(){e||(e=!0,L({}))},2500);fetch(r+\"/api/banner-config/\"+encodeURIComponent(n)).then(function(e){return e.ok?e.json():{}}).catch(function(){return{}}).then(function(a){e||(e=!0,clearTimeout(t),L(a||{}))})}}}();";

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
// Where a visitor came from, as tagged in the ad or link that brought them (utm_source/campaign/content).
// The page reads it from its own URL and sends it along: no cookie, no storage, nothing third-party.
const cleanSrc = (v) => String(v || "").replace(/[^a-z0-9_.\/-]/gi, "").slice(0, 120);
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

// -- Banner look ---------------------------------------------------
// The /customize editor's settings, validated. Unknown keys and bad values are
// dropped, numbers are clamped, and the banner itself enforces AA contrast.
const HEX = /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i;
function bannerLook(src) {
  const c = src || {};
  const color = (v) => (typeof v === "string" && HEX.test(v.trim()) ? v.trim() : null);
  const n = (v, lo, hi) => (Number.isFinite(Number(v)) && v !== null && v !== "" ? Math.max(lo, Math.min(hi, Number(v))) : null);
  const bool = (v) => (typeof v === "boolean" ? v : null);
  const logo = typeof c.customLogoB64 === "string" && /^data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,/i.test(c.customLogoB64) && c.customLogoB64.length < 300000 ? c.customLogoB64 : null;
  const out = {
    theme: ["auto", "light", "dark"].includes(c.theme) ? c.theme : "auto",
    accent: color(c.accent), bg: color(c.bg), fg: color(c.fg), border: color(c.border), btntext: color(c.btntext),
    radius: n(c.radius, 0, 32), btnRadius: n(c.btnRadius, 0, 28), titleSize: n(c.titleSize, 13, 26), bodySize: n(c.bodySize, 12, 18),
    logoSize: n(c.logoSize, 16, 64), maxWidth: n(c.maxWidth, 320, 760), padding: n(c.padding, 12, 40), gap: n(c.gap, 0, 40),
    position: ["left", "center", "right"].includes(c.position) ? c.position : null,
    blur: bool(c.blur), showBorder: bool(c.showBorder), animate: bool(c.animate),
    policyUrl: typeof c.policyUrl === "string" && /^(https?:\/\/|\/)[^\s"'<>]{0,300}$/.test(c.policyUrl) ? c.policyUrl : null,
    customLogoB64: logo,
  };
  for (const k of Object.keys(out)) if (out[k] === null) delete out[k];
  return out;
}

// -- Router --------------------------------------------------------
export default {
  async fetch(request, env, ctx) {
    const url  = new URL(request.url);
    const path = url.pathname;

    // -- Customer accounts (credentialed: gdrock.com only) --------
    if (path.startsWith("/api/account/")) {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: acctHeaders(request) });
      if (path === "/api/account/start" && request.method === "POST") return handleAccountStart(request, env);
      if (path === "/api/account/verify" && request.method === "POST") return handleAccountVerify(request, env, ctx);
      if (path === "/api/account/me" && request.method === "GET") return handleAccountMe(request, env);
      if (path === "/api/account/signout" && request.method === "POST") return handleAccountSignOut(request);
      if (path === "/api/account/checkout" && request.method === "POST") return handleAccountCheckout(request, env);
      if (path === "/api/account/activate" && request.method === "POST") return handleAccountActivate(request, env);
      return acctJson(request, { error: "not_found" }, 404);
    }
    if (path.startsWith("/api/pack/")) {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: acctHeaders(request) });
      if (path === "/api/pack/zip" && request.method === "GET") return handlePackZip(request, env);
      if (path.startsWith("/api/pack/free/") && request.method === "GET") return handlePackFree(request, env, decodeURIComponent(path.slice("/api/pack/free/".length)));
      return acctJson(request, { error: "not_found" }, 404);
    }

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
        return json({ blocked: false, theme: "auto", primary: "#2563eb" });
      }

      try {
        const r = await fetch(
          `${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(siteId)}&active=eq.true&select=*`,
          { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
        );
        const rows = await r.json();
        if (!rows || rows.length === 0) return json({ blocked: false, theme: "auto", primary: "#2563eb" });
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
        const look = bannerLook(row.config);
        return json({
          blocked: false, plan: row.plan,
          primary: look.accent || "#2563eb", accentBtn: look.accent || "#2563eb",
          // Everything the /customize editor saves, validated; the banner enforces AA contrast on the colours.
          ...look,
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
      const { site_id, accessCode } = body;
      if (!site_id || !accessCode) return json({ error: "Missing site_id or accessCode" }, 400);

      const check = await fetch(
        `${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(site_id)}&active=eq.true&select=access_code,config`,
        { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
      );
      const rows = await check.json();
      if (!rows || rows.length === 0) return json({ error: "Site not found" }, 403);
      if (rows[0].access_code && rows[0].access_code.toUpperCase() !== accessCode.toUpperCase()) {
        return json({ error: "Invalid access code" }, 403);
      }

      // Every setting the editor offers is stored (validated), so what the preview shows is what the
      // live banner does. Merged into the saved config: the hosted privacy policy lives there too
      // (config.policy), and a banner save used to wipe it.
      const kept = { ...(rows[0].config || {}) };
      for (const k of ["theme", "accent", "bg", "fg", "border", "btntext", "radius", "btnRadius", "titleSize", "bodySize", "logoSize",
        "maxWidth", "padding", "gap", "position", "blur", "showBorder", "animate", "policyUrl", "customLogoB64"]) delete kept[k];
      const cfg = { ...kept, ...bannerLook(body), poweredByLocked: true, accessCode: rows[0].access_code };
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

    // -- GET /api/consent-export?site_id=X&code=Y -----------------
    // The customer's own consent log as CSV (date, choice, analytics, marketing):
    // no IP, no user agent. Needs the site's access code, like the customizer.
    if (path === "/api/consent-export" && request.method === "GET") {
      const siteId = (url.searchParams.get("site_id") || "").trim().toLowerCase();
      const code = (url.searchParams.get("code") || "").trim().toUpperCase();
      if (!siteId || !code) return json({ error: "site_id and code required" }, 400);
      if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return json({ error: "not configured" }, 503);
      const h = { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` };
      const sr = await fetch(`${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(siteId)}&select=access_code`, { headers: h });
      const site = sr.ok ? (await sr.json())[0] : null;
      if (!site || !site.access_code || site.access_code.toUpperCase() !== code) return json({ error: "Site ID or access code is wrong" }, 403);
      const rows = [];
      for (let off = 0; off < 50000; off += 1000) {
        const r = await fetch(`${env.SUPABASE_URL}/rest/v1/consent_logs_public?site_id=eq.${encodeURIComponent(siteId)}&select=created_at,accepted,analytics,marketing&order=created_at.asc&limit=1000&offset=${off}`, { headers: h });
        if (!r.ok) break;
        const page = await r.json();
        if (!Array.isArray(page) || !page.length) break;
        rows.push(...page);
        if (page.length < 1000) break;
      }
      const yn = (v) => (v ? "yes" : "no");
      const csv = "time_utc,choice,analytics,marketing\r\n" + rows.map((r) => `${r.created_at},${r.accepted ? "accepted" : "rejected or custom"},${yn(r.analytics)},${yn(r.marketing)}`).join("\r\n") + "\r\n";
      return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="gdrock-consent-log-${siteId}.csv"`, "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" } });
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

      // Telegram alert. Scanner leads are skipped: /api/scan already sent one alert
      // for that scan with the email and opt-in on it, and two pings per lead is noise.
      if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID && source !== "scanner") {
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
      const domain = String(rawUrl).replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[\/?#].*$/, "").replace(/:\d+$/, "").trim().toLowerCase();
      if (!DOMAIN_RE.test(domain)) return json({ error: "Enter a website address like yourstore.com" }, 400);
      const fullUrl = "https://" + domain;
      const ip = request.headers.get("CF-Connecting-IP") || "";
      const wantsReport = typeof email === "string" && EMAIL_RE.test(email.trim());

      // 0) The same domain within ~10 minutes: the stored result, no new scan. A visitor
      //    asking for the report by email still gets it, and that request still alerts.
      const cached = await scanCacheGet(domain);
      if (cached) {
        const out = { ...cached, cached: true };
        if (wantsReport) {
          later(ctx, alertScan(env, { domain, email, optin: body.optin === true, vantage: readVantage(request), result: out, ip, cached: true, src: cleanSrc(body.src) }));
          later(ctx, sendScanReport(env, email, domain, out).catch(() => {}));
        }
        return json(out);
      }
      if (!(await scanAllowed(env, ip))) {
        return json({ error: "rate_limited", message: "Too many scans from your connection. Try again in a few minutes.", retry_after_seconds: Math.round(SCAN_LIMIT.windowMs / 1000) }, 429);
      }

      // 1) Read the homepage source once, from wherever this Worker is running.
      const vantage = readVantage(request);
      const scraped = await scrapeSite(fullUrl, vantage);
      if (!scraped.ok || (scraped.text || "").length < 80) {
        later(ctx, alertScan(env, { domain, email, optin: body.optin === true, vantage, ip, src: cleanSrc(body.src), failed: scraped.status ? "HTTP " + scraped.status : (scraped.error || "no readable content") }));
        return json({ score: null, is_real_site: false, scan_method: "source",
          site_description: "Could not load this site.",
          summary: "The site did not respond, or returned no readable homepage content, so there is nothing to report on.",
          legal_disclaimer: SCAN_DISCLAIMER,
          issues: [{ severity: "warning", confidence: "observed", text: "The homepage could not be read" + (scraped.status ? " (HTTP " + scraped.status + ")" : "") + ". Check the address and that the site is live. Sites behind a bot check often refuse an automated request while working normally in a browser." }] });
      }

      // 2) Findings and score come from the rules, every time, for every domain.
      //    A language model cannot add a finding or move the number: that is what
      //    stopped the same site scoring 82 one day and 98 the next.
      const result = buildReport(domain, scraped);

      // 3) The AI writes prose only, and only prose that stays inside what a
      //    source scan can honestly claim (PROSE_OUT_OF_BOUNDS). Anything else
      //    is dropped and the rule-written sentence stands.
      if (env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY) {
        try {
          const written = await llmScan(env, buildScanPrompt(fullUrl, scraped, result));
          const desc = acceptProse(written.site_description, 200);
          const sum  = acceptProse(written.summary, 400);
          if (desc) result.site_description = desc;
          if (sum)  result.summary = sum + " " + result.limits[1];
        } catch (e) { console.error("scan: AI wording failed, keeping rule-written copy -", e.message); }
      }

      // Persist scan result for funnel analytics (best-effort)
      if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
        fetch(`${env.SUPABASE_URL}/rest/v1/scan_results`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "return=minimal" },
          body: JSON.stringify({ email: email || null, domain, score: result.score, summary: result.summary || null, issues: result.issues || [] }),
        }).catch(() => {});
      }

      // Every scan pings the owner (Telegram + email), anonymous or not, and the
      // report goes to the visitor when they asked for it. Both run after the
      // response is sent, so neither can slow the scan down or break it.
      scanCachePut(ctx, domain, result);
      later(ctx, alertScan(env, { domain, email, optin: body.optin === true, vantage, result, ip, src: cleanSrc(body.src) }));
      if (wantsReport) later(ctx, sendScanReport(env, email, domain, result).catch(() => {}));

      return json(result);
    }

    // -- Deep check (queue + runner) -----------------------------
    if (path === "/api/deep-scan" && request.method === "POST") return handleDeepScanRequest(request, env, ctx);
    if (path === "/api/deep-scan/next" && request.method === "GET") return handleDeepScanNext(request, env, url);
    if (path === "/api/deep-scan/result" && request.method === "POST") return handleDeepScanResult(request, env, ctx);
    if (path === "/api/deep-scan/status" && request.method === "GET") return handleDeepScanStatus(url, env);

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

    // -- POST /api/whop-checkout ---------------------------------
    // The checkout is created server-side so the buyer's site URL rides along
    // as metadata and comes back on the webhook that provisions the banner.
    // The Whop API key never leaves the Worker.
    if (path === "/api/whop-checkout" && request.method === "POST") {
      const b = await request.json().catch(() => ({}));
      const plan   = String(b.plan || "").toLowerCase();
      const email  = String(b.email || "").trim();
      const siteId = normDomain(b.website_url);
      const planId = whopPlanId(env, plan);

      if (!env.WHOP_API_KEY || !planId) return json({ error: "whop_not_configured" }, 503);
      if (!email || !email.includes("@")) return json({ error: "Valid email required" }, 400);
      if (!siteId) return json({ error: "Website URL required" }, 400);

      try {
        const r = await fetch("https://api.whop.com/api/v1/checkout_configurations", {
          method: "POST",
          headers: { Authorization: `Bearer ${env.WHOP_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "payment",
            plan_id: planId,
            redirect_url: "https://gdrock.com/thank-you.html",
            metadata: {
              gdrock_plan: plan,
              website_url: siteId,
              email,
              name:       String(b.name || "").slice(0, 120),
              country:    String(b.country || "").slice(0, 2),
              vat_number: String(b.vat_number || "").slice(0, 20),
            },
          }),
        });
        const data = await r.json().catch(() => ({}));
        const pu = data.purchase_url || "";
        if (!r.ok || !pu) return json({ error: "whop_error", status: r.status }, 502);
        return json({ url: pu.startsWith("http") ? pu : `https://whop.com${pu}` });
      } catch (e) {
        return json({ error: "whop_unreachable" }, 502);
      }
    }

    // -- POST /api/whop-webhook ----------------------------------
    // Provisioning happens here, not on the redirect back: the customer's
    // browser never has to survive the round trip for access to be granted.
    if (path === "/api/whop-webhook" && request.method === "POST") return handleWhopWebhook(request, env);

    // -- POST /api/whop-activate ---------------------------------
    // A buyer who paid on Whop itself (Discover, a whop.site page) never told
    // us their website. gdrock.com/activate.html posts it here, and the access
    // code goes to the email they bought with, never back to the page.
    if (path === "/api/whop-activate" && request.method === "POST") return handleWhopActivate(request, env);

    // -- GET /dl/core-pack ---------------------------------------
    // The Core Pack documents, behind a link only a buyer's email can produce.
    if (path === "/dl/core-pack" && request.method === "GET") return handleCorePackDownload(url, env, request);

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
// attachments: [{ name, type, content (base64) }]
async function sendEmail(env, to, subject, html, attachments) {
  const from = env.MAIL_FROM || "noreply@gdrock.com";
  const files = Array.isArray(attachments) ? attachments : [];
  if (env.ZEPTO_TOKEN) {
    const sent = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: { "Authorization": "Zoho-enczapikey " + env.ZEPTO_TOKEN, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        from: { address: from, name: "GDRock" },
        to: [{ email_address: { address: to } }],
        subject, htmlbody: html,
        ...(files.length ? { attachments: files.map((f) => ({ name: f.name, mime_type: f.type, content: f.content })) } : {}),
      }),
    });
    // A refused email used to vanish silently (one access code was lost on 2 Oct): tell the owner.
    if (!sent.ok) await telegram(env, `Email NOT sent (ZeptoMail ${sent.status})
To: ${to}
Subject: ${subject}`).catch(() => {});
    return sent;
  }
  if (env.RESEND_API_KEY) {
    return fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "GDRock <" + from + ">", to: [to], subject, html,
        ...(files.length ? { attachments: files.map((f) => ({ filename: f.name, content: f.content })) } : {}) }),
    });
  }
  return null; // no email provider configured yet
}

// Build + send the compliance scan report to the visitor, and notify office@gdrock.com
async function sendScanReport(env, email, domain, result) {

  const open = result.needs_browser_check === true;
  const score = result.score ?? "—";
  const color = open ? "#9CA3AF" : score >= 80 ? "#00a896" : score >= 60 ? "#f5c842" : "#e63946";
  const scoreHtml = open
    ? `<div style="text-align:center;font-size:48px;font-weight:800;color:${color};margin-bottom:4px;">?</div>
    <p style="text-align:center;color:#fff;font-size:15px;font-weight:700;margin:0 0 6px;">Needs a real-browser check</p>
    <p style="color:#cfd8ea;font-size:14px;text-align:center;line-height:1.6;margin:0 0 14px;">${escHtml(result.open_question ? result.open_question.text : "")}</p>
    <div style="text-align:center;margin:0 0 22px;"><a href="https://www.gdrock.com/#scan" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:10px;">Run the free deep check →</a></div>`
    : `<div style="text-align:center;font-size:48px;font-weight:800;color:${color};margin-bottom:8px;">${score}/100</div>`;
  const issues = (result.issues || []).map(i => {
    const c = i.severity === "critical" ? "#e63946" : i.severity === "good" ? "#00a896" : "#f5c842";
    const mark = i.severity === "critical" ? "✗" : i.severity === "good" ? "✓" : "!";
    // Everything site-derived is escaped: the domain, the evidence and the AI-written summary all come from outside.
    const ev = i.evidence ? `<div style="margin-top:6px;font-family:Consolas,Menlo,monospace;font-size:11px;color:#7c8494;word-break:break-all;">${escHtml(String(i.evidence).slice(0, 200))}</div>` : "";
    return `<tr><td style="padding:8px 12px;border-left:3px solid ${c};background:#0a1020;color:#cfd8ea;font-size:14px;border-radius:6px;">${mark} ${escHtml(i.text)}${ev}</td></tr><tr><td style="height:8px"></td></tr>`;
  }).join("");
  const limits = (result.limits || []).map((l) => `<li style="margin:0 0 6px;">${escHtml(l)}</li>`).join("");

  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#04081a;padding:32px;border-radius:16px;">
    <div style="text-align:center;margin-bottom:24px;"><span style="font-size:22px;font-weight:800;color:#fff;">GDRock</span><div style="color:#5b6a8a;font-size:12px;">GDPR Compliance</div></div>
    <h1 style="color:#fff;font-size:22px;text-align:center;margin:0 0 8px;">Your source scan</h1>
    <p style="text-align:center;color:#9CA3AF;font-size:14px;margin:0 0 20px;">for ${escHtml(domain)}</p>
    ${scoreHtml}
    <p style="color:#9CA3AF;font-size:14px;text-align:center;line-height:1.6;margin:0 0 24px;">${escHtml(result.summary || "")}</p>
    <table style="width:100%;border-collapse:collapse;">${issues}</table>
    ${limits ? `<div style="margin-top:18px;padding:14px 16px;border-radius:10px;background:#0a1020;"><p style="color:#cfd8ea;font-size:13px;font-weight:700;margin:0 0 8px;">What this scan can't see</p><ul style="color:#9CA3AF;font-size:12.5px;line-height:1.55;margin:0;padding-left:18px;">${limits}</ul></div>` : ""}
    <div style="background:rgba(0,201,177,.08);border:1px solid rgba(0,201,177,.25);border-radius:12px;padding:18px;margin-top:24px;">
      <p style="color:#fff;font-size:15px;font-weight:700;margin:0 0 4px;text-align:center;">Stay covered — Care, €15/mo</p>
      <p style="color:#9CA3AF;font-size:13px;line-height:1.6;margin:0 0 14px;text-align:center;">GDPR rules change. Care is a hosted banner (one script tag) that <b style="color:#fff;">auto-updates when the law changes</b>, and holds known analytics and ad scripts until a visitor opts in.</p>
      <div style="text-align:center;"><a href="https://www.gdrock.com/checkout.html?plan=care" style="display:inline-block;background:#00a896;color:#fff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:10px;">Get Care — €15/mo →</a></div>
    </div>
    <div style="text-align:center;margin-top:14px;">
      <a href="https://www.gdrock.com/checkout.html?plan=core" style="color:#9CA3AF;font-size:13px;text-decoration:underline;">Or just the DIY templates — Core Pack €29 one-time →</a>
    </div>
    <p style="color:#5b6a8a;font-size:12px;text-align:center;margin-top:20px;line-height:1.6;">Both include the 14-day money-back guarantee.<br>Questions? Just reply to this email.</p>
  </div>`;

  // The owner hears about this scan from alertScan, which fires for every scan.
  await sendEmail(env, email, `Your GDPR source scan for ${domain}: ${open ? "needs a browser check" : score + "/100"}`, html).catch(() => {});
}

// Run work after the response is sent when the runtime allows it (ctx.waitUntil),
// otherwise just let the promise run. Never throws into the request.
function later(ctx, promise) {
  const p = Promise.resolve(promise).catch((e) => console.error("background task failed -", e && e.message));
  if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(p);
  return p;
}

// Base64 of a UTF-8 string, in chunks (a report can be large).
function base64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

const escHtml = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// One alert per scan, to Telegram and to the owner's inbox. Anonymous scans are
// the warmest signal on the site — someone typed their own store in — so they
// alert too, not only the ones that left an email.
//   TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID  → Telegram
//   OWNER_EMAIL (default office@gdrock.com) via ZEPTO_TOKEN or RESEND_API_KEY → email
async function alertScan(env, { domain, email, optin, vantage, result, failed, ip, cached, src }) {
  const gate = alertGate(ip || "");
  if (!gate.send) return; // a burst from one connection, or across all of them: held back and counted
  const hasEmail = Boolean(email && String(email).includes("@"));
  const where = vantage && vantage.country ? vantage.country + (vantage.colo ? " / " + vantage.colo : "") : "unknown";
  const headline = failed ? "Scan failed to load" : hasEmail ? "Scan + email captured" : "Anonymous scan";
  const worst = result ? (result.issues || []).filter((i) => i.severity !== "good").slice(0, 3).map((i) => "- " + String(i.text).slice(0, 140)) : [];
  const open = !failed && result && result.needs_browser_check === true;
  const scoreLine = open
    ? "Score: none, needs a browser check (" + result.open_question.consent_tools.join(", ") + " + " + result.open_question.tags.length + " tags). Worth a deep check by hand: node verify_consent.js https://" + domain + " --geo=de"
    : failed ? null : "Score: " + result.score + "/100";
  const lines = [
    "GDRock scanner: " + headline,
    "",
    "Site: " + domain,
    failed ? "Could not read: " + failed : scoreLine + (result.platform ? " (" + result.platform.name + ")" : ""),
    hasEmail ? "Email: " + email + (optin ? " (opted in to alerts + news)" : " (no marketing opt-in)") : "Email: none given",
    "Visitor location: " + where,
    src ? "Came from: " + src : null,
    cached ? "(result from the 10-minute cache: not a new scan)" : null,
    gate.suppressed ? `(${gate.suppressed} alert${gate.suppressed === 1 ? "" : "s"} held back during a burst before this one)` : null,
    worst.length ? "" : null,
    ...worst,
  ].filter((l) => l !== null);
  const text = lines.join(String.fromCharCode(10));

  const jobs = [];
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    // Plain text: a domain or email with an underscore breaks Telegram's Markdown parser and the alert is lost.
    jobs.push(fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
    }));
  }
  const owner = env.OWNER_EMAIL || "office@gdrock.com";
  const subject = `[GDRock scan] ${domain}` + (failed ? " - failed" : open ? " - needs browser check" : ` - ${result.score}/100`) + (hasEmail ? ` - ${email}` : " - anonymous");
  jobs.push(Promise.resolve(sendEmail(env, owner, subject, `<pre style="font:14px/1.6 ui-monospace,Menlo,monospace;white-space:pre-wrap;">${escHtml(text)}</pre>`)));
  const settled = await Promise.allSettled(jobs);
  for (const r of settled) if (r.status === "rejected") console.error("scan alert failed -", r.reason && r.reason.message);
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

// -- Whop ----------------------------------------------------------
// Every plan sold on Whop (dashboard, 2026-09-13). core/care/agency can still be
// re-pointed with Worker vars; the rest are fixed ids. `kind` decides what a
// purchase delivers: "banner" = an access code per site (up to `sites`),
// "files" = the Core Pack download (documents + the self-hosted blocker; the
// site promises no hosting for it), "setup" = we do the install, so the buyer
// gets a booking email instead.
// `db` is the plan name the sites table and the banner understand.
const WHOP_PLANS = {
  core:      { id: "plan_gWq2g08EUZLAg", env: "WHOP_PLAN_CORE",   label: "Core Pack",                  kind: "files" },
  care:      { id: "plan_Hzt8oE2YfKseZ", env: "WHOP_PLAN_CARE",   label: "Care",                       kind: "banner", sites: 1,  db: "care" },
  agency:    { id: "plan_U4vLK0OIvMmrR", env: "WHOP_PLAN_AGENCY", label: "Portfolio (up to 25 sites)", kind: "banner", sites: 25, db: "agency" },
  agency50:  { id: "plan_ovQfuAhjkvcFn",                          label: "Portfolio (up to 50 sites)", kind: "banner", sites: 50, db: "agency" },
  essential: { id: "plan_rDl4G6eAcftqC",                          label: "Essential Setup",            kind: "setup" },
  pro:       { id: "plan_MuD4rYDQxu5MD",                          label: "Shopify Pro Setup",          kind: "setup" },
  saas:      { id: "plan_sgmAIlHhbMpuu",                          label: "SaaS Compliance",            kind: "setup" },
};
const planIdOf = (env, key) => { const p = WHOP_PLANS[key]; return p ? (p.env && env[p.env]) || p.id : ""; };
function whopPlanId(env, plan) {
  return planIdOf(env, plan);
}
function whopPlanName(env, planId) {
  if (!planId) return "";
  for (const key of Object.keys(WHOP_PLANS)) if (planId === planIdOf(env, key) || planId === WHOP_PLANS[key].id) return key;
  return "";
}

const WHOP_REVOKE = new Set(["membership.deactivated", "refund.created", "membership.went_invalid",
  "membership.cancelled", "membership.canceled", "payment.refunded"]);
const WHOP_GRANT = new Set(["payment.succeeded", "membership.went_valid", "membership.activated"]);

async function handleWhopWebhook(request, env) {
  const raw = await request.text();
  if (!(await verifyWhopWebhook(env, request, raw))) return json({ error: "bad_signature" }, 401);

  let body = {};
  try { body = JSON.parse(raw); } catch (e) { return json({ error: "bad_json" }, 400); }

  // Whop has shipped the event name under a few keys across API versions.
  const event   = String(body.type || body.action || body.event || "");
  const d       = body.data || {};
  const meta    = d.metadata || (d.checkout_configuration && d.checkout_configuration.metadata) || {};
  const email   = String((d.user && d.user.email) || d.email || meta.email || "").trim().toLowerCase();
  const siteId  = normDomain(meta.website_url || "");
  const planKey = meta.gdrock_plan || whopPlanName(env, (d.plan && d.plan.id) || d.plan_id) || "";
  const plan    = WHOP_PLANS[planKey] || null;
  // A payment carries its membership as an object; a membership event is the membership.
  const memberId = (d.membership && d.membership.id) || d.membership_id ||
    (d.payment && d.payment.membership && d.payment.membership.id) ||
    (/^mem_/.test(String(d.id || "")) ? String(d.id) : "");
  const sale = {
    email, siteId, planKey, plan, memberId,
    paymentId: /^pay_/.test(String(d.id || "")) ? String(d.id) : "",
    product: (d.product && d.product.title) || (plan && plan.label) || "an unknown product",
    amount: d.total != null ? `${d.total} ${String(d.currency || "").toUpperCase()}`.trim() : "",
    // Bought from a signed-in gdrock.com account: that account sees the purchase even when
    // the buyer paid on Whop with another address.
    account: EMAIL_RE.test(String(meta.gdrock_account || "")) ? String(meta.gdrock_account).trim().toLowerCase() : "",
  };
  if (sale.account && sale.email && sale.account !== sale.email) await acctAlias(env, sale.account, sale.email);

  // Access revoked: cancellation, refund, chargeback or failed renewal.
  if (WHOP_REVOKE.has(event)) {
    const refund = /refund/.test(event);
    if (siteId) {
      await supabasePatch(env, siteId, { active: false });
      await whopRevokeMembership(env, memberId, refund);
      return json({ ok: true, revoked: siteId });
    }
    // Bought on Whop itself: its sites were attached later through /activate.
    const p = await whopRevokeMembership(env, memberId, refund);
    if (p) {
      for (const s of p.sites) await supabasePatch(env, s, { active: false });
      return json({ ok: true, revoked: p.sites });
    }
    // A revoke that can't be matched to a site must never pass silently:
    // the customer would keep a working banner they no longer pay for.
    await tellOwner(env, `Whop ${event} could not be matched to a website.\nEmail: ${email || "unknown"}\nSwitch their banner off by hand in Supabase (sites.active = false).`);
    return json({ ok: true, note: "revoke event without a website" });
  }

  if (!WHOP_GRANT.has(event)) return json({ ok: true, skipped: event });

  // We install it: delivered by people, so the buyer gets a booking email.
  if (plan && plan.kind === "setup") return whopSetupSale(env, sale);
  // Core Pack: files, wherever it was bought.
  if (plan && plan.kind === "files") return whopFilesSale(env, sale);

  // Bought through gdrock.com's checkout: the site came along, provision it now.
  if (siteId && email) {
    const dbPlan = (plan && plan.db) || planKey || "care";
    // A renewal must not mint a new access code: the customer already
    // installed the old one. Only a site we have never seen gets one.
    const existing = await supabaseGetSite(env, siteId);
    if (existing) {
      await supabasePatch(env, siteId, { active: true, plan: dbPlan });
      await whopRemember(env, sale, siteId);
      return json({ ok: true, renewed: siteId });
    }
    const code = generateCode();
    await supabaseUpsert(env, siteId, dbPlan, true, code);
    await sendAccessCodeEmail(env, email, siteId, planKey || dbPlan, code);
    await whopRemember(env, sale, siteId);
    await tellOwner(env, `New Whop sale: ${sale.product}${sale.amount ? " · " + sale.amount : ""}\n${email}\n${siteId}\nCode: ${code}`);
    return json({ ok: true, provisioned: siteId });
  }

  // Bought on Whop itself (no website yet), or a plan this Worker doesn't know.
  return whopPendingSale(env, sale);
}

// Buyers who paid on Whop are kept in KV until they attach a website:
//   whop:buyer:<email>  -> { email, purchases: [{ mid, plan, limit, sites[], active, at }] }
//   whop:mem:<membership id> -> email   (so a cancellation finds the sites)
const whopBuyerKey = (email) => "whop:buyer:" + email;
async function whopBuyer(env, email) {
  if (!env.DEEP_SCAN || !email) return null;
  try { return JSON.parse((await env.DEEP_SCAN.get(whopBuyerKey(email))) || "null"); } catch (e) { return null; }
}
async function whopSave(env, rec, memberId) {
  await env.DEEP_SCAN.put(whopBuyerKey(rec.email), JSON.stringify(rec));
  if (memberId) await env.DEEP_SCAN.put("whop:mem:" + memberId, rec.email);
}
// One purchase can arrive as two events (payment.succeeded, then membership.activated),
// and a membership id is not always on both, so a same-plan purchase from the last
// 15 minutes without an id counts as the same one.
function whopFindPurchase(rec, sale) {
  return rec.purchases.find((x) =>
    (sale.memberId && x.mid === sale.memberId) ||
    (x.plan === sale.planKey && (!x.mid || !sale.memberId) && Date.now() - Date.parse(x.at) < 15 * 60 * 1000));
}
async function whopRemember(env, sale, siteId) {
  if (!env.DEEP_SCAN || !sale.memberId || !sale.email) return;
  const rec = (await whopBuyer(env, sale.email)) || { email: sale.email, purchases: [] };
  let p = whopFindPurchase(rec, sale);
  if (!p) {
    p = { mid: sale.memberId, plan: sale.planKey || "care", limit: (sale.plan && sale.plan.sites) || 1, sites: [], active: true, at: new Date().toISOString() };
    rec.purchases.push(p);
  }
  p.mid = p.mid || sale.memberId;
  p.active = true;
  if (siteId && !p.sites.includes(siteId)) p.sites.push(siteId);
  await whopSave(env, rec, p.mid);
}
async function whopRevokeMembership(env, memberId, refund) {
  if (!env.DEEP_SCAN || !memberId) return null;
  const email = await env.DEEP_SCAN.get("whop:mem:" + memberId);
  const rec = email ? await whopBuyer(env, email) : null;
  const p = rec && rec.purchases.find((x) => x.mid === memberId);
  if (!p) return null;
  p.active = false;
  if (refund) p.refunded = true;
  await whopSave(env, rec);
  return p;
}

async function whopPendingSale(env, sale) {
  const price = sale.amount ? " · " + sale.amount : "";
  if (!sale.plan || sale.plan.kind !== "banner") {
    await tellOwner(env, `Whop sale for a plan this Worker doesn't know: ${sale.product}${price}\nEmail: ${sale.email || "unknown"}\nMembership: ${sale.memberId || "unknown"}\nAdd its plan id to WHOP_PLANS in gdrock-worker.js, then contact the buyer.`);
    return json({ ok: true, note: "unknown plan" });
  }
  if (!sale.email) {
    await tellOwner(env, `New Whop sale without an email: ${sale.plan.label}${price}\nMembership: ${sale.memberId || "unknown"}\nFind the buyer in Whop > Customers and send them https://www.gdrock.com/activate.html`);
    return json({ ok: true, note: "missing email" });
  }
  if (!env.DEEP_SCAN) {
    await tellOwner(env, `New Whop sale: ${sale.plan.label}${price}\n${sale.email}\nNo website and no KV to wait in: ask the buyer for their site and provision by hand.`);
    return json({ ok: true, note: "no kv" });
  }

  const rec = (await whopBuyer(env, sale.email)) || { email: sale.email, purchases: [] };
  const known = whopFindPurchase(rec, sale);
  if (known) {
    // A renewal, or Whop's second event for the same purchase: nothing new to send.
    known.mid = known.mid || sale.memberId;
    known.active = true;
    for (const s of known.sites) await supabasePatch(env, s, { active: true });
    await whopSave(env, rec, known.mid);
    return json({ ok: true, renewed: known.sites });
  }
  rec.purchases.push({ mid: sale.memberId, plan: sale.planKey, limit: sale.plan.sites, sites: [], active: true, at: new Date().toISOString() });
  await whopSave(env, rec, sale.memberId);
  await sendActivationEmail(env, sale.email, sale.planKey);
  await tellOwner(env, `New Whop sale: ${sale.plan.label}${price}\n${sale.email}\nBought on Whop, so no website yet. Activation link sent; you'll get another message when they activate.`);
  return json({ ok: true, pending_activation: sale.email });
}

// Whop reports one purchase more than once (payment.succeeded, membership.activated):
// true the first time a purchase is seen, false after.
async function whopFirstTime(env, kind, sale) {
  const once = sale.memberId || sale.paymentId;
  if (!env.DEEP_SCAN || !once) return true;
  if (await env.DEEP_SCAN.get(`whop:${kind}:${once}`)) return false;
  await env.DEEP_SCAN.put(`whop:${kind}:${once}`, "1", { expirationTtl: 30 * 86400 });
  return true;
}

// Purchases that carry no site (Core Pack, setups) are remembered per email too, so the
// buyer's account can show them and a refund can lock them.
async function whopRecord(env, sale, extra = {}) {
  if (!env.DEEP_SCAN || !sale.email) return;
  const rec = (await whopBuyer(env, sale.email)) || { email: sale.email, purchases: [] };
  let p = whopFindPurchase(rec, sale);
  if (!p) { p = { mid: sale.memberId, plan: sale.planKey, limit: 0, sites: [], active: true, at: new Date().toISOString(), ...extra }; rec.purchases.push(p); }
  p.mid = p.mid || sale.memberId;
  p.active = true;
  delete p.refunded;
  await whopSave(env, rec, p.mid);
}

async function whopFilesSale(env, sale) {
  await whopRecord(env, sale);
  if (!(await whopFirstTime(env, "files", sale))) return json({ ok: true, duplicate: true });
  if (sale.email) await sendCorePackEmail(env, sale.email);
  await tellOwner(env, `New Whop sale: ${sale.plan.label}${sale.amount ? " · " + sale.amount : ""}
${sale.email || "no email: find the buyer in Whop > Customers and send the Core Pack by hand"}
Download link emailed.`);
  return json({ ok: true, files: sale.plan.label });
}

async function whopSetupSale(env, sale) {
  await whopRecord(env, sale, sale.siteId ? { site: sale.siteId } : {});
  if (!(await whopFirstTime(env, "setup", sale))) return json({ ok: true, duplicate: true });
  if (sale.email) await sendSetupEmail(env, sale.email, sale.plan.label, sale.siteId);
  await tellOwner(env, `New setup sale: ${sale.plan.label}${sale.amount ? " · " + sale.amount : ""}\n${sale.email || "no email: find the buyer in Whop > Customers"}${sale.siteId ? "\n" + sale.siteId : ""}\nBooking email sent. Book the kickoff within one working day.`);
  return json({ ok: true, setup: sale.plan.label });
}

async function handleWhopActivate(request, env) {
  const b = await request.json().catch(() => ({}));
  const email  = String(b.email || "").trim().toLowerCase();
  const siteId = normDomain(b.website_url);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "Enter the email address you bought with." }, 400);
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(siteId)) return json({ error: "Enter your website address, like yourstore.com." }, 400);
  if (!env.DEEP_SCAN) return json({ error: "Activation is offline right now. Email office@gdrock.com and we'll do it by hand." }, 503);

  // Ten tries an hour per connection: plenty for typos, useless for fishing.
  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (ip) {
    const k = `whop:act:${ip}:${Math.floor(Date.now() / 3600000)}`;
    const n = parseInt((await env.DEEP_SCAN.get(k)) || "0", 10) || 0;
    if (n >= 10) return json({ error: "Too many tries from here. Wait an hour, or email office@gdrock.com." }, 429);
    await env.DEEP_SCAN.put(k, String(n + 1), { expirationTtl: 3600 });
  }

  // The page always gets the same answer, so it can't be used to learn who bought.
  const done = json({ ok: true, message: `If ${email} has a GDRock purchase waiting, the access code for ${siteId} is on its way to it now. Nothing within 5 minutes? Check spam, then email office@gdrock.com.` });
  await whopActivateSite(env, await whopBuyer(env, email), siteId);
  return done;
}

// Attaches a website to the buyer's first purchase with room for one, and emails the access code
// to the address on that purchase. Returns what happened: none, resent, full, taken or activated.
async function whopActivateSite(env, rec, siteId) {
  if (!rec) return "none";
  const email = rec.email;

  const owner = rec.purchases.find((x) => x.sites.includes(siteId));
  if (owner) {
    // Already activated by this buyer: send the code again.
    const row = await supabaseGetSite(env, siteId);
    if (row && row.access_code) await sendAccessCodeEmail(env, email, siteId, owner.plan, row.access_code);
    return "resent";
  }
  // A Core Pack or a setup on its own has no hosted banner to attach a site to.
  if (!rec.purchases.some((x) => x.limit > 0)) return "none";
  const p = rec.purchases.find((x) => x.active !== false && x.sites.length < x.limit);
  const label = p ? (WHOP_PLANS[p.plan] || {}).label || p.plan : "";
  if (!p) {
    await tellOwner(env, `Activation refused, no free site left: ${email} asked for ${siteId}.`);
    await sendBuyerNote(env, email, "Your GDRock plan has no free site left",
      `Every site on your GDRock plan is already active, so ${escHtml(siteId)} wasn't added. If you meant to replace a site, or want room for more, just reply to this email and a person will sort it out.`);
    return "full";
  }
  if (await supabaseGetSite(env, siteId)) {
    // Someone else's site, or one set up by hand: never overwritten from a public form.
    await tellOwner(env, `Activation needs a look: ${email} (${label}) asked for ${siteId}, which already exists in Supabase. Sort it out by hand.`);
    await sendBuyerNote(env, email, `We're checking ${siteId}`,
      `${escHtml(siteId)} is already registered with GDRock, so we didn't activate it automatically. A person will look at it and reply within one working day. Nothing for you to do in the meantime.`);
    return "taken";
  }
  const code = generateCode();
  await supabaseUpsert(env, siteId, (WHOP_PLANS[p.plan] || {}).db || p.plan, true, code);
  p.sites.push(siteId);
  await whopSave(env, rec, p.mid);
  await sendAccessCodeEmail(env, email, siteId, p.plan, code);
  await tellOwner(env, `Activated: ${siteId}\n${email} · ${label} (${p.sites.length} of ${p.limit})\nCode: ${code}`);
  return "activated";
}

// The Core Pack zip lives in KV (wrangler kv key put --binding DEEP_SCAN --remote
// "asset:core-pack.zip" --path products/GDRock-Core-Pack-v3.zip). Links are an HMAC of
// the buyer's email, so only an email we sent one to can produce one.
const CORE_PACK_KEY = "asset:core-pack.zip";
async function corePackToken(env, email) {
  const secret = env.DOWNLOAD_SECRET || env.WHOP_WEBHOOK_SECRET || "";
  if (!secret || !email) return "";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("corepack:" + email)));
  return btoa(String.fromCharCode(...mac)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "").slice(0, 32);
}
async function corePackUrl(env, email) {
  const t = await corePackToken(env, email);
  return t ? `https://cdn.gdrock.com/dl/core-pack?e=${encodeURIComponent(email)}&t=${t}` : "";
}
async function handleCorePackDownload(url, env, request) {
  const email = String(url.searchParams.get("e") || "").trim().toLowerCase();
  const want = await corePackToken(env, email);
  const origin = (request && request.headers.get("Origin")) || "";
  const cors = { "Access-Control-Allow-Origin": /^(https:\/\/(www\.)?gdrock\.com|http:\/\/localhost:\d+)$/.test(origin) ? origin : "https://www.gdrock.com", "Vary": "Origin" };
  const text = (msg, status) => new Response(msg, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", ...cors } });
  if (!want || !timingSafeEqual(String(url.searchParams.get("t") || ""), want)) {
    return text("This download link isn't valid. Email office@gdrock.com and we'll send the Core Pack again.", 403);
  }
  const bought = (await acctRecords(env, email)).flatMap((r) => r.purchases);
  if (bought.length && bought.every((p) => p.refunded)) return text("This purchase was refunded, so the link no longer works. Email office@gdrock.com if that's a mistake.", 403);
  if (env.DEEP_SCAN && !bought.length && !(await env.DEEP_SCAN.get("acct:pack:" + email))) await env.DEEP_SCAN.put("acct:pack:" + email, "1");
  const zip = env.DEEP_SCAN ? await env.DEEP_SCAN.get(CORE_PACK_KEY, "arrayBuffer") : null;
  if (!zip) {
    await tellOwner(env, `Core Pack download failed for ${email}: the zip isn't in KV (${CORE_PACK_KEY}).`);
    return text("The download is unavailable for a moment. Email office@gdrock.com and we'll send it straight away.", 503);
  }
  return new Response(zip, { headers: { "Content-Type": "application/zip",
    "Content-Disposition": 'attachment; filename="GDRock-Core-Pack.zip"', "Cache-Control": "private, no-store", ...cors } });
}

// Plain text on purpose: an underscore in an email or domain breaks Telegram's Markdown.
async function tellOwner(env, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
  }).catch(() => {});
}

// Whop's dashboard test events and our own tests use reserved domains; never email them.
const isReservedAddress = (email) => /@([^@]*\.)?(example\.(com|net|org)|[a-z0-9-]+\.(example|test|invalid|localhost))$/i.test(email);

const BUYER_FOOT = `Questions? Just reply to this email; it reaches a person. You're covered by our 14-day money-back guarantee.<br>Everything you bought is also in your account: <a href="https://www.gdrock.com/account" style="color:#8fb0ff;">gdrock.com/account</a>, sign in with this email.`;
function buyerEmailShell(title, inner, foot = BUYER_FOOT) {
  const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#08090c" style="background:#08090c;">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
<tr><td style="padding:0 6px 20px;font-family:${font};"><img src="https://www.gdrock.com/assets/gdrock-mark-light.png" width="26" height="26" alt="" style="vertical-align:middle;border:0;"><span style="font-size:17px;font-weight:600;color:#f4f6fa;letter-spacing:-.01em;vertical-align:middle;margin-left:9px;">GDRock</span></td></tr>
<tr><td bgcolor="#0e1117" style="background:#0e1117;border:1px solid #1f2430;border-radius:16px;padding:32px 28px;font-family:${font};color:#f4f6fa;">
  <h1 style="font-size:24px;line-height:1.2;letter-spacing:-.02em;font-weight:650;margin:0 0 16px;color:#f4f6fa;">${title}</h1>
  ${inner}
</td></tr>
<tr><td style="padding:20px 6px 0;font-family:${font};font-size:12.5px;line-height:1.6;color:#8d95a8;">${foot}<br><span style="color:#5d6476;">GDRock &middot; gdrock.com</span></td></tr>
</table>
</td></tr></table>`;
}
async function sendBuyerNote(env, email, subject, text) {
  if (isReservedAddress(email)) return null;
  const html = buyerEmailShell(escHtml(subject), `<p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:0;">${text}</p>`);
  try { return await sendEmail(env, email, `GDRock: ${subject}`, html); } catch (e) { return null; }
}

async function sendActivationEmail(env, email, planKey) {
  if (isReservedAddress(email)) return null;
  const plan = WHOP_PLANS[planKey] || WHOP_PLANS.care;
  const link = `https://www.gdrock.com/activate.html?email=${encodeURIComponent(email)}`;
  const many = plan.sites > 1
    ? `<p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:0 0 16px;">Your plan covers up to ${plan.sites} sites. Activate each client site the same way, one at a time; every one gets its own access code.</p>`
    : "";
  const inner = `<p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:0 0 16px;">Thank you for buying <strong>${escHtml(plan.label)}</strong>. Whop doesn't pass us your website address, so there's one step left: tell us which site the banner is for.</p>
  <p style="margin:0 0 20px;"><a href="${link}" style="display:inline-block;background:#4f7dff;color:#fff;text-decoration:none;font-weight:700;padding:13px 24px;border-radius:10px;">Activate my site</a></p>
  <p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:0 0 16px;">Your access code and the one-line install arrive at this address a minute later.</p>
  ${many}`;
  try { return await sendEmail(env, email, `Activate your GDRock ${plan.label}: one step left`, buyerEmailShell("You're in. One step left.", inner)); } catch (e) { return null; }
}

async function sendSetupEmail(env, email, label, siteId) {
  if (isReservedAddress(email)) return null;
  const inner = `<p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:0 0 16px;">Thank you for buying <strong>${escHtml(label)}</strong>. We do the install for you${siteId ? ` on <strong>${escHtml(siteId)}</strong>` : ""}, so the next step is a short kickoff.</p>
  <p style="margin:0 0 20px;"><a href="https://cal.eu/gdrock/15min" style="display:inline-block;background:#4f7dff;color:#fff;text-decoration:none;font-weight:700;padding:13px 24px;border-radius:10px;">Book the 15-minute kickoff</a></p>
  <p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:0 0 12px;">Rather not book? Reply with your store address and two times that suit you.</p>
  <p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:0 0 12px;">What helps us start: your store address and platform. On Shopify we send a collaborator request, so you never share a password.</p>
  <p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:0;">When the install is done, we run the same real-browser check from Germany again and send you the result.</p>
  <p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:20px 0 0;">Your plan includes the Core Pack: the templates and guides, yours to keep.</p>
  ${await corePackBlock(env, email)}`;
  try { return await sendEmail(env, email, `Your GDRock ${label}: book the install`, buyerEmailShell("Thank you. Let's book your install.", inner)); } catch (e) { return null; }
}

async function sendCorePackEmail(env, email) {
  if (isReservedAddress(email)) return null;
  const inner = `<p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:0 0 16px;">Thank you for buying the <strong>Core Pack</strong>. Everything is in one place:</p>
  ${await corePackBlock(env, email)}
  <p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:20px 0 12px;"><strong>The banner is the real one.</strong> It's the same blocker and banner we run on our own CDN, packaged to run from your site: it holds Meta Pixel, Google Analytics, TikTok, Klaviyo, Hotjar and the rest until the visitor chooses, with Accept and Reject as equal choices, in 7 languages. Guide 01 walks you through the install in about ten minutes, with the exact lines to paste for Shopify, WooCommerce and any other site.</p>
  <p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:0;">Then check it: run the free deep check at <a href="https://www.gdrock.com/#scan" style="color:#8fb0ff;">gdrock.com</a>. A real browser in Germany opens your store and tells you if anything still fires before a choice.</p>`;
  try { return await sendEmail(env, email, "Your GDRock Core Pack is ready", buyerEmailShell("Your Core Pack is ready.", inner)); } catch (e) { return null; }
}

async function corePackBlock(env, email) {
  const dl = await corePackUrl(env, email);
  if (!dl) return "";
  return `<div style="background:#151a24;border:1px solid #262c3b;border-radius:12px;padding:18px 20px;margin:8px 0 0;">
    <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#4f7dff;font-weight:700;margin-bottom:8px;">Your Core Pack</div>
    <p style="font-size:14px;line-height:1.6;color:#c5cbd7;margin:0 0 10px;">The blocker and banner, a step-by-step install guide, a privacy policy template, a data retention schedule, a breach response pack and a 20-step store checklist, with Word and Excel files you can edit. Start with <strong>Start here</strong>.</p>
    <a href="${dl.replace("https://cdn.gdrock.com/dl/core-pack", "https://www.gdrock.com/pack.html")}" style="display:inline-block;background:#4f7dff;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;">Open your Core Pack</a>
    <p style="font-size:13px;line-height:1.6;color:#8d95a8;margin:12px 0 0;">Read every guide, fill in your privacy policy on the page and download it as Word. Prefer the files? <a href="${dl}" style="color:#8fb0ff;">Download the zip</a>.</p>
  </div>`;
}

/* ===========================================================================
   CUSTOMER ACCOUNTS  (gdrock.com/account)
   ===========================================================================
   Sign in with a link emailed to you: it works once, for 15 minutes. No passwords.
   Anyone can open an account (the free parts of the Core Pack need one, and the
   address is a lead); purchases are matched to it by email.
     acct:otl:<sha256 of the link token>  -> { email, next }      15 minutes
     acct:user:<email>                    -> { created, last }
     acct:pack:<email>                    -> "1"  opened a signed Core Pack link
     whop:alias:<account email>           -> [Whop emails]  paid with another address
     acct:rl:<ip:… | em:…>:<window>       -> tries in that window
   The session is a cookie signed with ACCOUNT_SECRET, valid 90 days, set by
   cdn.gdrock.com and readable by no script. gdrock.com's pages send it with
   credentialed fetches; any other origin is refused by CORS and SameSite.  */
const ACCT_ORIGIN_RE = /^https:\/\/(www\.)?gdrock\.com$/;
const SESSION_COOKIE = "__Host-gdr_s";
const SESSION_DAYS = 90;
const ACCT_NEXT = new Set(["pack", "account"]);
const WHOP_MANAGE_URL = "https://whop.com/@me/settings/memberships/";

function acctHeaders(request) {
  const o = request.headers.get("Origin") || "";
  return { "Access-Control-Allow-Origin": ACCT_ORIGIN_RE.test(o) ? o : "https://www.gdrock.com", "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin", "Cache-Control": "no-store" };
}
function acctJson(request, obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), { status, headers: { ...acctHeaders(request), "Content-Type": "application/json", ...extra } });
}
// Writes only from gdrock.com's own pages (a browser always sends Origin on a POST).
const acctOriginOk = (request) => ACCT_ORIGIN_RE.test(request.headers.get("Origin") || "");

const b64url = (bytes) => { let bin = ""; for (const b of bytes) bin += String.fromCharCode(b); return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const unb64url = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
async function hmacB64(secret, msg) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg))));
}

async function sessionCookie(env, email) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  const value = `v1.${b64url(new TextEncoder().encode(email))}.${exp}.${await hmacB64(env.ACCOUNT_SECRET, `session:${email}.${exp}`)}`;
  return `${SESSION_COOKIE}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
}
// The signed-in email, or "" when there is no valid session.
async function acctSession(env, request) {
  if (!env.ACCOUNT_SECRET) return "";
  const m = (request.headers.get("Cookie") || "").match(/(?:^|;\s*)__Host-gdr_s=([^;\s]+)/);
  if (!m) return "";
  const [v, e64, exp, mac] = m[1].split(".");
  if (v !== "v1" || !e64 || !/^\d+$/.test(exp || "") || !mac || Number(exp) < Date.now() / 1000) return "";
  let email = "";
  try { email = new TextDecoder().decode(unb64url(e64)); } catch (e) { return ""; }
  return timingSafeEqual(mac, await hmacB64(env.ACCOUNT_SECRET, `session:${email}.${exp}`)) ? email : "";
}

// Counts tries in a fixed window; true once `max` is used up.
async function acctTooMany(env, key, max, windowSec) {
  const k = `acct:rl:${key}:${Math.floor(Date.now() / (windowSec * 1000))}`;
  const n = parseInt((await env.DEEP_SCAN.get(k)) || "0", 10) || 0;
  if (n >= max) return true;
  await env.DEEP_SCAN.put(k, String(n + 1), { expirationTtl: Math.max(60, windowSec) });
  return false;
}

async function acctAlias(env, account, whopEmail) {
  if (!env.DEEP_SCAN) return;
  const k = "whop:alias:" + account;
  const list = JSON.parse((await env.DEEP_SCAN.get(k)) || "[]");
  if (!list.includes(whopEmail)) { list.push(whopEmail); await env.DEEP_SCAN.put(k, JSON.stringify(list)); }
}
// Every Whop record that belongs to this account: its own address and any it paid with.
async function acctRecords(env, email) {
  if (!env.DEEP_SCAN) return [];
  const emails = [email, ...JSON.parse((await env.DEEP_SCAN.get("whop:alias:" + email)) || "[]")];
  const recs = [];
  for (const e of emails) { const r = await whopBuyer(env, e); if (r) recs.push(r); }
  return recs;
}
// Owns the Core Pack: any purchase that wasn't refunded (every plan includes it), or a signed
// Core Pack link from a purchase email that was opened (buyers from before accounts existed).
async function corePackOwned(env, email, recs) {
  const purchases = recs.flatMap((r) => r.purchases);
  if (purchases.some((p) => !p.refunded)) return true;
  if (purchases.length) return false;   // bought, then refunded
  return !!(env.DEEP_SCAN && (await env.DEEP_SCAN.get("acct:pack:" + email)));
}

async function handleAccountStart(request, env) {
  if (!acctOriginOk(request)) return acctJson(request, { error: "forbidden" }, 403);
  const b = await request.json().catch(() => ({}));
  const email = String(b.email || "").trim().toLowerCase();
  const next = ACCT_NEXT.has(b.next) ? b.next : "";
  if (!EMAIL_RE.test(email) || email.length > 200) return acctJson(request, { error: "Enter your email address, like you@yourstore.com." }, 400);
  if (!env.DEEP_SCAN || !env.ACCOUNT_SECRET) return acctJson(request, { error: "Sign-in is offline for a moment. Email office@gdrock.com and we'll help." }, 503);
  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (ip && (await acctTooMany(env, "ip:" + ip, 10, 3600))) return acctJson(request, { error: "Too many sign-in emails from this connection. Try again in an hour." }, 429);
  // One answer for every address, sent or not, so the form can't be used to learn anything.
  const answer = acctJson(request, { ok: true, message: `If ${email} can receive email, a sign-in link is on its way. It works once, for 15 minutes.` });
  if (await acctTooMany(env, "em:" + email, 4, 3600)) return answer;   // no inbox gets flooded
  const token = b64url(crypto.getRandomValues(new Uint8Array(32)));
  await env.DEEP_SCAN.put("acct:otl:" + (await sha256Hex(token)), JSON.stringify({ email, next, optin: b.optin === true }), { expirationTtl: 900 });
  await sendSignInEmail(env, email, token);
  return answer;
}

async function handleAccountVerify(request, env, ctx) {
  if (!acctOriginOk(request)) return acctJson(request, { error: "forbidden" }, 403);
  const b = await request.json().catch(() => ({}));
  const token = String(b.token || "");
  if (!env.DEEP_SCAN || !env.ACCOUNT_SECRET) return acctJson(request, { error: "Sign-in is offline for a moment. Email office@gdrock.com and we'll help." }, 503);
  const k = /^[A-Za-z0-9_-]{40,60}$/.test(token) ? "acct:otl:" + (await sha256Hex(token)) : "";
  let rec = null;
  try { rec = k ? JSON.parse((await env.DEEP_SCAN.get(k)) || "null") : null; } catch (e) { rec = null; }
  if (!rec || !rec.email) return acctJson(request, { error: "This sign-in link has expired or was already used. Ask for a new one." }, 400);
  await env.DEEP_SCAN.delete(k);
  const now = new Date().toISOString();
  const user = JSON.parse((await env.DEEP_SCAN.get("acct:user:" + rec.email)) || "null");
  await env.DEEP_SCAN.put("acct:user:" + rec.email, JSON.stringify({ created: (user && user.created) || now, last: now, optin: rec.optin === true || !!(user && user.optin) }));
  if (!user) later(ctx, acctNewLead(env, rec.email, rec.optin === true));
  return acctJson(request, { ok: true, email: rec.email, next: rec.next || "" }, 200, { "Set-Cookie": await sessionCookie(env, rec.email) });
}

async function acctNewLead(env, email, optin) {
  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    await fetch(`${env.SUPABASE_URL}/rest/v1/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "return=minimal" },
      body: JSON.stringify({ source: "account", email, name: "", website_url: "", service: "", notes: optin ? "Opened a gdrock.com account; opted in to updates" : "Opened a gdrock.com account; no marketing consent", plan: "" }),
    }).catch(() => {});
  }
  await tellOwner(env, `New GDRock account: ${email}${optin ? " (opted in to updates)" : ""}`);
}

function handleAccountSignOut(request) {
  if (!acctOriginOk(request)) return acctJson(request, { error: "forbidden" }, 403);
  return acctJson(request, { ok: true }, 200, { "Set-Cookie": `${SESSION_COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0` });
}

// Everything the dashboard shows, from the purchases this account can see.
async function accountView(env, email) {
  const recs = await acctRecords(env, email);
  const purchases = recs.flatMap((r) => r.purchases.map((p) => ({ ...p, email: r.email })));
  const user = env.DEEP_SCAN ? JSON.parse((await env.DEEP_SCAN.get("acct:user:" + email)) || "null") : null;
  const sites = [], waiting = [], setups = [], plans = [];
  for (const p of purchases) {
    const plan = WHOP_PLANS[p.plan] || { label: p.plan, kind: "" };
    if (!p.refunded) plans.push({ plan: p.plan, label: plan.label, kind: plan.kind, active: p.active !== false, since: p.at, paidWith: p.email !== email ? p.email : "" });
    if (plan.kind === "setup" && !p.refunded) setups.push({ label: plan.label, site: p.site || "", since: p.at });
    if (plan.kind !== "banner") continue;
    for (const site of p.sites) {
      const row = await supabaseGetSite(env, site);
      sites.push({ site, plan: p.plan, label: plan.label, active: p.active !== false && !(row && row.active === false), code: (row && row.access_code) || "" });
    }
    if (p.active !== false && p.sites.length < p.limit) waiting.push({ plan: p.plan, label: plan.label, free: p.limit - p.sites.length });
  }
  return { email, since: (user && user.created) || "", corePack: await corePackOwned(env, email, recs), plans, sites, waiting, setups, manageUrl: WHOP_MANAGE_URL };
}

async function handleAccountMe(request, env) {
  const email = await acctSession(env, request);
  if (!email) return acctJson(request, { signedIn: false }, 401);
  return acctJson(request, { signedIn: true, ...(await accountView(env, email)) });
}

// A purchase started from the account: the account email rides along as metadata, so the
// webhook files the purchase under it even if the buyer pays on Whop with another address.
const ACCT_CHECKOUT = new Set(["core", "care", "essential"]);
async function handleAccountCheckout(request, env) {
  if (!acctOriginOk(request)) return acctJson(request, { error: "forbidden" }, 403);
  const email = await acctSession(env, request);
  if (!email) return acctJson(request, { error: "Sign in first." }, 401);
  const b = await request.json().catch(() => ({}));
  const plan = String(b.plan || "");
  const planId = ACCT_CHECKOUT.has(plan) ? whopPlanId(env, plan) : "";
  if (!planId) return acctJson(request, { error: "Unknown plan." }, 400);
  const fallback = `https://whop.com/checkout/${planId}`;
  if (!env.WHOP_API_KEY) return acctJson(request, { url: fallback });
  try {
    const r = await fetch("https://api.whop.com/api/v1/checkout_configurations", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.WHOP_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "payment", plan_id: planId, redirect_url: b.back === "pack" ? `https://www.gdrock.com/pack.html?bought=${plan}` : `https://www.gdrock.com/account?bought=${plan}`,
        metadata: { gdrock_plan: plan, gdrock_account: email, email } }),
    });
    const data = await r.json().catch(() => ({}));
    const pu = data.purchase_url || "";
    if (!r.ok || !pu) return acctJson(request, { url: fallback });
    return acctJson(request, { url: pu.startsWith("http") ? pu : `https://whop.com${pu}` });
  } catch (e) {
    return acctJson(request, { url: fallback });
  }
}

// Attach a website to a Care or Portfolio plan from the dashboard (same rules as /activate).
async function handleAccountActivate(request, env) {
  if (!acctOriginOk(request)) return acctJson(request, { error: "forbidden" }, 403);
  const email = await acctSession(env, request);
  if (!email) return acctJson(request, { error: "Sign in first." }, 401);
  const b = await request.json().catch(() => ({}));
  const siteId = normDomain(b.website_url);
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(siteId)) return acctJson(request, { error: "Enter your website address, like yourstore.com." }, 400);
  if (await acctTooMany(env, "act:" + email, 10, 3600)) return acctJson(request, { error: "Too many tries. Wait an hour, or email office@gdrock.com." }, 429);
  const recs = await acctRecords(env, email);
  const rec = recs.find((r) => r.purchases.some((x) => x.sites.includes(siteId))) ||
    recs.find((r) => r.purchases.some((x) => x.active !== false && x.sites.length < x.limit));
  const said = {
    none: "There's no Care or Portfolio plan on this account to add a site to.",
    resent: `${siteId} is already on your plan. We've emailed its access code again.`,
    full: "Every site on your plan is already in use. Reply to any GDRock email and we'll sort it out.",
    taken: `${siteId} is already registered with GDRock, so a person will check it and reply within one working day.`,
    activated: `${siteId} is active. Its access code is below and on its way by email.`,
  }[await whopActivateSite(env, rec || null, siteId)];
  return acctJson(request, { ok: true, message: said, view: await accountView(env, email) });
}

// -- The Core Pack inside the account: free parts for every account, the rest when unlocked --
// Free (any signed-in account): Start here in full, the policy template the builder fills in,
// and a cover-plus-first-page preview of guides 03-05, each its own KV key (asset:free:<name>,
// made by products/core-pack-v4-src/portal/make_free.py). The zip with everything else only
// goes to an account that owns the Core Pack, or to a signed link from a purchase email.
const PACK_FREE = {
  "01.pdf": "application/pdf",
  "02.docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "03-preview.pdf": "application/pdf",
  "04-preview.pdf": "application/pdf",
  "05-preview.pdf": "application/pdf",
};
async function handlePackFree(request, env, name) {
  const email = await acctSession(env, request);
  if (!email) return acctJson(request, { error: "Sign in first." }, 401);
  const type = PACK_FREE[name];
  if (!type) return acctJson(request, { error: "not_found" }, 404);
  const buf = env.DEEP_SCAN ? await env.DEEP_SCAN.get("asset:free:" + name, "arrayBuffer") : null;
  if (!buf) {
    await tellOwner(env, `Free Core Pack file missing from KV: asset:free:${name} (asked by ${email}).`);
    return acctJson(request, { error: "This file is unavailable for a moment. Email office@gdrock.com." }, 503);
  }
  return new Response(buf, { headers: { ...acctHeaders(request), "Content-Type": type, "Cache-Control": "private, no-store" } });
}
async function handlePackZip(request, env) {
  const email = await acctSession(env, request);
  if (!email) return acctJson(request, { error: "Sign in first." }, 401);
  if (!(await corePackOwned(env, email, await acctRecords(env, email)))) return acctJson(request, { error: "locked" }, 403);
  const zip = env.DEEP_SCAN ? await env.DEEP_SCAN.get(CORE_PACK_KEY, "arrayBuffer") : null;
  if (!zip) {
    await tellOwner(env, `Core Pack download failed for ${email}: the zip isn't in KV (${CORE_PACK_KEY}).`);
    return acctJson(request, { error: "The download is unavailable for a moment. Email office@gdrock.com and we'll send it straight away." }, 503);
  }
  return new Response(zip, { headers: { ...acctHeaders(request), "Content-Type": "application/zip",
    "Content-Disposition": 'attachment; filename="GDRock-Core-Pack.zip"', "Cache-Control": "private, no-store" } });
}

async function sendSignInEmail(env, email, token) {
  if (isReservedAddress(email)) return null;
  const link = `https://www.gdrock.com/account?t=${token}`;
  const inner = `<p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:0 0 20px;">Use this button to sign in to your GDRock account. It works once, in the next 15 minutes.</p>
  <p style="margin:0 0 20px;"><a href="${link}" style="display:inline-block;background:#4f7dff;color:#fff;text-decoration:none;font-weight:700;padding:13px 24px;border-radius:10px;">Sign in to GDRock</a></p>
  <p style="font-size:13px;line-height:1.6;color:#8d95a8;margin:0;">Didn't ask for this? Ignore it. Nobody can sign in without this email.</p>`;
  try { return await sendEmail(env, email, "Your GDRock sign-in link", buyerEmailShell("Sign in to GDRock", inner, "Questions? Just reply to this email; it reaches a person.")); } catch (e) { return null; }
}

// Whop signs webhooks with the Standard Webhooks scheme: HMAC-SHA256 over
// "{webhook-id}.{webhook-timestamp}.{raw body}", base64-encoded and sent as
// "v1,<sig>" in webhook-signature — which may carry several space-separated
// signatures while a secret is being rotated, so every one is checked.
//
// An unverified webhook here would let anyone grant themselves a paid banner
// by POSTing a fake payment, so this fails closed: no secret, no access.
async function verifyWhopWebhook(env, request, raw) {
  const secret = env.WHOP_WEBHOOK_SECRET;
  if (!secret) return false;

  const id = request.headers.get("webhook-id") || "";
  const ts = request.headers.get("webhook-timestamp") || "";
  const sigHeader = request.headers.get("webhook-signature") || "";
  if (!id || !ts || !sigHeader) return false;

  // Replay guard — reject anything more than five minutes from now.
  const skew = Math.abs(Date.now() / 1000 - Number(ts));
  if (!Number.isFinite(skew) || skew > 300) return false;

  const signed = new TextEncoder().encode(`${id}.${ts}.${raw}`);
  const sent = sigHeader.split(" ").map(s => s.split(",").pop()).filter(Boolean);
  if (!sent.length) return false;

  // Whop's docs say to hand the verifier the secret exactly as issued, ws_
  // prefix included. The Standard Webhooks reference implementation instead
  // strips the prefix and base64-decodes it. Both derivations are tried so a
  // change on their side can't silently start rejecting real payments — the
  // attacker still needs the secret either way.
  const keys = [new TextEncoder().encode(secret)];
  const tail = secret.includes("_") ? secret.slice(secret.indexOf("_") + 1) : secret;
  try { keys.push(Uint8Array.from(atob(tail), c => c.charCodeAt(0))); } catch (e) {}

  for (const keyBytes of keys) {
    try {
      const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const mac = await crypto.subtle.sign("HMAC", key, signed);
      const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
      for (const s of sent) if (timingSafeEqual(s, expected)) return true;
    } catch (e) {}
  }
  return false;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function supabaseGetSite(env, siteId) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  try {
    const r = await fetch(
      `${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(siteId)}&select=site_id,access_code,plan,active`,
      { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
    );
    const rows = await r.json();
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  } catch (e) { return null; }
}

async function sendAccessCodeEmail(env, email, siteId, plan, code) {
  if (isReservedAddress(email)) return null;
  const planLabel = (WHOP_PLANS[plan] && WHOP_PLANS[plan].label) || plan;
  const inner = `  <p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:0 0 24px;">Your GDRock <strong>${planLabel}</strong> plan is active for <strong>${escHtml(siteId)}</strong>.</p>
  <div style="background:#151a24;border:1px solid #262c3b;border-radius:12px;padding:20px;margin-bottom:24px;">
    <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#8d95a8;font-weight:700;margin-bottom:8px;">Your access code</div>
    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:20px;font-weight:700;letter-spacing:.06em;color:#f4f6fa;">${code}</div>
  </div>
  <p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:0 0 12px;"><strong>Install: one line, the first thing inside &lt;head&gt;, above every other script. No async or defer.</strong></p>
  <pre style="background:#05060a;color:#dbe4ff;border:1px solid #2a3b6b;padding:16px;border-radius:10px;font-size:12px;overflow-x:auto;margin:0 0 12px;">&lt;script src="https://cdn.gdrock.com/gdrock.js" data-site-id="${escHtml(siteId)}"&gt;&lt;/script&gt;</pre>
  <p style="font-size:14px;line-height:1.6;color:#c5cbd7;margin:0 0 24px;">It holds trackers until the visitor chooses, so it has to run before them. On Shopify, use the ready-made snippet: <a href="https://www.gdrock.com/integrations/shopify/snippets/gdrock-blocker.liquid" style="color:#8fb0ff;">gdrock-blocker.liquid</a>. Then open your site, press F12 and run <code>GDRock.installFix()</code> to see anything left to change.</p>
  <p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:0 0 24px;">Customise the banner at <a href="https://cdn.gdrock.com/customize" style="color:#8fb0ff;">cdn.gdrock.com/customize</a> using the code above.</p>
  <p style="font-size:15px;line-height:1.65;color:#c5cbd7;margin:0 0 4px;">Your plan includes the Core Pack: the privacy policy, retention and breach templates and the store checklist, yours to keep.</p>
  ${await corePackBlock(env, email)}
`;
  try { return await sendEmail(env, email, `Your GDRock access code — ${siteId}`, buyerEmailShell("Your plan is active. One line to go live.", inner)); } catch (e) { return null; }
}

/* ===========================================================================
   GDPR SCANNER  —  what this thing can and cannot see
   ===========================================================================
   The scanner runs inside this Worker. It performs one anonymous GET of the
   homepage, then reads up to three of the site's own stylesheets and the
   privacy policy page the homepage links to, and reads the bytes that come
   back. It does not run a browser and it does not execute JavaScript, and
   that fixes the boundary of every claim it is allowed to make:

   OBSERVABLE
     - the HTML the server returns to a cookie-less, consent-less request
     - that response's headers (status, Set-Cookie, platform headers)
     - every third-party host referenced in the markup and in inline scripts
     - inline Consent Mode defaults, and consent-gating attributes on tags
     - which consent-tool LOADER is present, by its URL / markup signature
     - links to privacy, terms, imprint and cookie pages
     - fonts the site's own stylesheets pull in (@import, url())
     - whether the privacy policy's text mentions six things Art. 13 asks for
     - the Cloudflare location this fetch left from

   NOT OBSERVABLE
     - request order or timing, so never "fired BEFORE consent"
     - cookies written by JavaScript (only the document's own Set-Cookie)
     - whether a banner actually renders, or renders for an EU visitor
     - whether a consent tool blocks anything at runtime
     - Consent Mode gcs/gcd signals on the wire, Shopify's customerPrivacy
       region, Cookiebot/OneTrust country — all JS-runtime APIs
     - anything GTM injects, and any page other than the homepage

   So every finding below is phrased as a fact about the SOURCE, carries the
   evidence string that produced it, and a confidence:
     observed  — it is in the bytes we fetched
     inferred  — a judgement drawn from what is and isn't in those bytes
   Absence is reported as absence ("no X found in the homepage source"),
   never as a finding that X does not exist.

   The score is rule-based (SOURCE_SCORE_RULES) and deterministic. The AI is
   allowed to write prose only — the description and the summary — and can
   neither add a finding nor move the number.
   ======================================================================== */

const SCAN_DISCLAIMER = "This report is generated automatically from the homepage source code, for information only. It is not legal advice, a formal audit, or a guarantee of compliance. GDRock provides software and templates, not legal services.";
const GTM_NOTICE = "Google Tag Manager container detected - may load additional trackers beyond those individually identified. Static analysis cannot enumerate GTM's configured tags; manual review of the GTM container recommended.";

// EU/EEA + UK, for saying honestly where this scan looked from.
const EU_EEA_UK = new Set("AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO GB".split(" "));

// --- Signature tables ------------------------------------------------------
// Every signature matches a RESOURCE URL, an inline script body, or markup with
// anchors stripped — never the page's prose and never an <a href>. Matching
// bare product names against the whole document is what made gdrock.com's own
// "vs cookiebot / vs iubenda / vs termly" footer links register as installed
// consent tools; on a prospect's site the same bug would hide the real finding
// behind a comparison blog post.
const CMP_SIGNATURES = [
  { name: "Cookiebot",        url: /consent\.cookiebot\.(?:com|eu)\/|\/uc\.js\?cbid=/i, dom: /id=["']Cybot(?:CookiebotDialog|CookiebotDialogBodyContent)|data-cbid=/i },
  { name: "OneTrust",         url: /cdn\.cookielaw\.org\/|cdn-(?:apac|ukwest)\.onetrust\.com\/|otSDKStub\.js|otBannerSdk\.js/i, dom: /id=["']onetrust-(?:banner-sdk|consent-sdk)|class=["'][^"']*optanon-/i },
  { name: "Usercentrics",     url: /(?:app|web\.cmp|privacy-proxy)\.usercentrics\.eu\/|usercentrics\.eu\/(?:browser-ui|latest)/i, dom: /id=["']usercentrics-(?:root|cmp)|data-usercentrics=/i },
  { name: "CookieYes",        url: /cdn(?:-cookieyes|\.cookieyes)\.com\//i, dom: /id=["']cookieyes|class=["'][^"']*cky-consent/i },
  { name: "Iubenda",          url: /cdn\.iubenda\.com\/cs\/|cs\.iubenda\.com\//i, dom: /id=["']iubenda-cs-banner/i },
  { name: "Complianz",        url: /\/complianz(?:-gdpr)?\/[^"']*\.js|\/cmplz-/i, dom: /id=["']cmplz-cookiebanner|class=["'][^"']*cmplz-/i },
  { name: "Borlabs Cookie",   url: /borlabs-cookie[^"']*\.js/i, dom: /id=["']BorlabsCookieBox|data-borlabs-cookie-/i },
  { name: "Termly",           url: /app\.termly\.io\/(?:embed|resource-blocker)/i, dom: /data-termly|id=["']termly-code-snippet/i },
  { name: "Cookie Script",    url: /cdn\.cookie-script\.com\//i, dom: /id=["']cookiescript_injected/i },
  { name: "CookieFirst",      url: /consent\.cookiefirst\.com\//i, dom: /id=["']cookiefirst-root|data-cookiefirst-/i },
  { name: "CookieHub",        url: /cookiehub\.(?:net|eu)\//i, dom: /id=["']ch2(?:-dialog)?["']/i },
  { name: "Didomi",           url: /sdk\.privacy-center\.org\/|api\.privacy-center\.org\//i, dom: /id=["']didomi-(?:host|notice)/i },
  { name: "Axeptio",          url: /static\.axept\.io\//i, dom: /id=["']axeptio_(?:overlay|main_button)/i },
  { name: "Osano",            url: /cmp\.osano\.com\//i, dom: /class=["'][^"']*osano-cm-(?:window|dialog)/i },
  { name: "TrustArc",         url: /consent\.trustarc\.com\/|trustarc\.com\/notice/i, dom: /id=["']truste-consent-(?:track|button)/i },
  { name: "Consentmanager",   url: /(?:cdn|delivery)\.consentmanager\.net\//i, dom: /id=["']cmpbox["']/i },
  { name: "Sourcepoint",      url: /sp-prod\.net\/|sourcepoint\.mgr\.consensu\.org/i, dom: /id=["']sp_message_container/i },
  { name: "Quantcast Choice", url: /quantcast\.mgr\.consensu\.org|cmp\.quantcast\.com\//i, dom: /id=["']qc-cmp2-container/i },
  { name: "Klaro",            url: /klaro(?:\.min)?\.js/i, dom: /id=["']klaro["']|class=["'][^"']*klaro["' ]/i },
  { name: "Pandectes",        url: /pandectes\.io\/|extensions\/[^"']*pandectes/i, dom: /id=["']pandectes-(?:banner|root)/i },
  { name: "Consentmo",        url: /consentmo|isenselabs[^"']*gdpr/i, dom: /id=["']consentmo-|class=["'][^"']*isenselabs-gdpr/i },
  { name: "Shopify privacy banner", url: /shopifycloud\/privacy-banner\/|consent-tracking-api/i, dom: /shopify-pc__banner/i },
  { name: "Shopware cookie bar",    url: /cookie-permission[^"']*\.js/i, dom: /class=["'][^"']*cookie-permission-content/i },
  { name: "Real Cookie Banner",     url: /real-cookie-banner\/[^"']*\.js/i, dom: /class=["'][^"']*rcb-banner/i },
  { name: "GDRock",           url: /cdn\.gdrock\.com\/gdrock(?:-blocker)?(?:\.min)?\.js/i, dom: /id=["']gdrock-banner/i },
];

const TRACKER_SIGNATURES = [
  { name: "Google Analytics 4", url: /googletagmanager\.com\/gtag\/js\?[^"']*id=G-/i, js: /gtag\(\s*["']config["']\s*,\s*["']G-/i },
  { name: "Google Analytics (Universal)", url: /google-analytics\.com\/(?:analytics|ga)\.js/i, js: /ga\(\s*["']create["']/i },
  { name: "Google Ads / remarketing", url: /googleadservices\.com\/|googlesyndication\.com\/|googletagmanager\.com\/gtag\/js\?[^"']*id=AW-/i, js: /gtag\(\s*["']config["']\s*,\s*["']AW-/i },
  { name: "Meta Pixel",       url: /connect\.facebook\.net\/[^"']*\/fbevents\.js/i, js: /fbq\(\s*["']init["']/i },
  { name: "TikTok Pixel",     url: /analytics\.tiktok\.com\//i, js: /ttq\.(?:load|page)\(/i },
  { name: "Hotjar",           url: /static\.hotjar\.com\/|script\.hotjar\.com\//i, js: /\bhjid\s*[:=]/i },
  { name: "Microsoft Clarity", url: /clarity\.ms\//i, js: /clarity\(\s*["']/i },
  { name: "LinkedIn Insight", url: /snap\.licdn\.com\//i, js: /_linkedin_partner_id/i },
  { name: "Pinterest Tag",    url: /s\.pinimg\.com\/ct\//i, js: /pintrk\(/i },
  { name: "Snap Pixel",       url: /sc-static\.net\/scevent/i, js: /snaptr\(/i },
  { name: "X / Twitter Ads",  url: /static\.ads-twitter\.com\//i, js: /twq\(/i },
  { name: "Klaviyo",          url: /static\.klaviyo\.com\/onsite\//i },
  { name: "Criteo",           url: /static\.criteo\.net\//i },
  { name: "Taboola",          url: /cdn\.taboola\.com\//i },
  { name: "Outbrain",         url: /outbrain\.com\/outbrain\.js/i },
  { name: "Amazon Ads",       url: /amazon-adsystem\.com\//i },
  { name: "Reddit Pixel",     url: /redditstatic\.com\/ads\//i },
  { name: "Yandex Metrica",   url: /mc\.yandex\.ru\//i },
  { name: "Bing / Microsoft Ads", url: /bat\.bing\.com\//i, js: /uetq\b/i },
  { name: "Mouseflow",        url: /cdn\.mouseflow\.com\//i },
  { name: "FullStory",        url: /edge\.fullstory\.com\//i },
];

// Fonts and embeds behave the same for every visitor in every country, which
// makes them the only findings here that a scan's location cannot undermine.
const FONT_SIGNATURES = [
  { name: "Google Fonts", url: /fonts\.(?:googleapis|gstatic)\.com\//i },
  { name: "Adobe Fonts",  url: /use\.typekit\.net\/|p\.typekit\.net\//i },
];
const EMBED_SIGNATURES = [
  { name: "YouTube",             url: /(?:www\.)?youtube\.com\/(?:embed|iframe_api)/i },
  { name: "YouTube (no-cookie)", url: /youtube-nocookie\.com\//i, cookieless: true },
  { name: "Vimeo",               url: /player\.vimeo\.com\//i },
  { name: "Google Maps",         url: /(?:www\.)?google\.com\/maps\/embed|maps\.googleapis\.com\//i },
  { name: "Google reCAPTCHA",    url: /(?:www\.)?google\.com\/recaptcha\/|recaptcha\.net\//i },
];

const PLATFORM_SIGNATURES = [
  { name: "Shopify",     header: "x-shopid", url: /cdn\.shopify\.com\//i, js: /Shopify\.shop\s*=/i },
  { name: "Shopware",    url: /\/bundles\/storefront\/|\/theme\/[a-f0-9]{32}\/(?:css|js|assets)\//i, js: /window\.router\[["']frontend\.|window\.salesChannelId\b/i, dom: /content=["']Shopware/i },
  { name: "WooCommerce", url: /\/plugins\/woocommerce\//i, dom: /class=["'][^"']*woocommerce["' ]/i },
  { name: "WordPress",   url: /\/wp-(?:content|includes)\//i, dom: /content=["']WordPress/i },
  { name: "Magento",     url: /\/static\/version\d+\/frontend\//i, js: /require\.config[\s\S]{0,200}mage\//i },
  { name: "PrestaShop",  dom: /content=["']PrestaShop/i },
  { name: "BigCommerce", url: /cdn\d*\.bigcommerce\.com\//i },
  { name: "Wix",         url: /static\.parastorage\.com\//i, dom: /content=["']Wix\.com/i },
  { name: "Squarespace", url: /static1\.squarespace\.com\//i, dom: /content=["']Squarespace/i },
  { name: "Webflow",     url: /(?:assets|cdn\.prod)\.website-files\.com\//i, dom: /data-wf-(?:page|site)=/i },
];

// Cookie names a browser would treat as tracking, matched against the document
// response's own Set-Cookie. JS-set cookies are invisible here by definition.
const TRACKING_COOKIE_PREFIXES = ["_ga", "_gid", "_gat", "_gcl_", "_fbp", "_fbc", "_hj", "_clck", "_clsk", "_uetsid", "_uetvid", "_ttp", "_tt_", "_scid", "_pin_unauth", "_rdt_uuid", "_pk_", "__kla_id", "IDE", "muc_ads", "personalization_id", "MUID", "NID"];

// Deterministic score. Every rule keys off something observed; nothing here can
// move because a language model felt differently about a site today.
const SOURCE_SCORE_RULES = {
  trackers_no_consent_tool:    { points: -30, label: "Marketing or analytics tags in the source with no consent tool alongside them" },
  consent_mode_granted:        { points: -15, label: "Consent Mode declares storage granted by default" },
  third_party_fonts:           { points: -10, label: "Fonts loaded from a third-party server" },
  cookie_setting_embed:        { points: -10, label: "An embed that sets cookies on load" },
  no_privacy_link:             { points: -25, label: "No privacy policy link on the homepage" },
  no_terms_link:               { points:  -5, label: "No terms or imprint link on the homepage" },
  tracking_cookie_on_document: { points: -15, label: "The homepage response itself set a tracking cookie" },
};

// --- Source extraction -----------------------------------------------------

// Pull the page apart into the three things signatures may be matched against,
// keeping <a> elements out of all of them. Anchors are used for one purpose
// only: finding the policy links.
function dissect(html) {
  const scriptBodies = [];
  const reInline = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = reInline.exec(html)) && scriptBodies.length < 200) {
    if (!/\bsrc\s*=/i.test(m[1] || "")) scriptBodies.push(m[2] || "");
  }
  const inlineJs = scriptBodies.join("\n").slice(0, 200000);

  const urls = new Set();
  const reRes = /<(?:script|link|iframe|img|source|embed)\b[^>]*?\b(?:src|href|data-src)\s*=\s*["']([^"']+)["']/gi;
  while ((m = reRes.exec(html)) && urls.size < 400) urls.add(m[1]);
  // URLs a tag builds in JavaScript (Google's own GTM snippet does exactly this).
  const reJsUrl = /["'](https?:\/\/[^"'\s]{6,300})["']/gi;
  while ((m = reJsUrl.exec(inlineJs)) && urls.size < 800) urls.add(m[1]);

  // Markup with anchors removed, for banner and platform markers in the DOM.
  const markup = html.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, " ").replace(/<a\b[^>]*>/gi, " ");

  const anchors = [];
  const reA = /<a\b[^>]+href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]{0,120}?)<\/a>/gi;
  while ((m = reA.exec(html)) && anchors.length < 400) anchors.push({ href: m[1], text: (m[2] || "").replace(/<[^>]+>/g, " ").trim() });

  return { inlineJs, resourceUrls: [...urls], markup, anchors };
}

const trimEvidence = (s) => String(s || "").replace(/\s+/g, " ").trim().slice(0, 160);

function firstMatchContext(text, re) {
  const m = new RegExp(re.source, re.flags.replace("g", "")).exec(text);
  if (!m) return "";
  return text.slice(Math.max(0, m.index - 20), m.index + m[0].length + 40);
}

// Run one signature table over the dissected page. Each hit carries the string
// that produced it, so no claim in the report is unfalsifiable.
function matchSignatures(table, d, headers) {
  const hits = [];
  for (const sig of table) {
    let evidence = null;
    if (sig.header && headers && headers.get(sig.header)) evidence = sig.header + " response header";
    if (!evidence && sig.url) { const u = d.resourceUrls.find((x) => sig.url.test(x)); if (u) evidence = trimEvidence(u); }
    if (!evidence && sig.js && sig.js.test(d.inlineJs)) evidence = trimEvidence(firstMatchContext(d.inlineJs, sig.js));
    if (!evidence && sig.dom && sig.dom.test(d.markup)) evidence = trimEvidence(firstMatchContext(d.markup, sig.dom));
    if (evidence) hits.push({ name: sig.name, evidence, cookieless: sig.cookieless === true });
  }
  return hits;
}

// Does the source show any tag handed to a consent tool to hold back? Every
// mainstream CMP gates a tag the same way: neutralise the type attribute, or
// tag it with the tool's own data-attribute.
function findGatedTags(html) {
  const out = [];
  const re = /<script\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(html)) && out.length < 20) {
    const attrs = m[1] || "";
    const typeHeld = /\btype\s*=\s*["'](?:text\/plain|javascript\/blocked|text\/x-cookie)/i.test(attrs);
    // These two mean the opposite of held: Cookiebot's "ignore"/"necessary" and OneTrust's
    // data-ot-ignore tell the tool to let the script run without asking.
    const exempt = /\bdata-cookieconsent\s*=\s*["'](?:ignore|necessary)["']|\bdata-ot-ignore\b/i.test(attrs);
    if (typeHeld || (!exempt &&
        /\bdata-(?:cookieconsent|cookiecategory|cookie-consent|cmp-ab|borlabs-cookie|cmplz-src|usercentrics|gdrock-category|cookiefirst-category|cookieyes|iub-purposes|klaro-config)\b/i.test(attrs))) {
      out.push(trimEvidence("<script" + attrs + ">"));
    }
  }
  return out;
}

// gtag("consent","default",{...}) is declared in the initial HTML, so it is one
// of the very few consent behaviours a source scan can read honestly.
function readConsentMode(inlineJs) {
  const m = /gtag\s*\(\s*["']consent["']\s*,\s*["']default["']\s*,\s*(\{[\s\S]{0,600}?\})\s*\)/i.exec(inlineJs);
  if (!m) return null;
  const states = {};
  for (const key of ["ad_storage", "analytics_storage", "ad_user_data", "ad_personalization", "functionality_storage", "personalization_storage", "security_storage"]) {
    const km = new RegExp(key + "\\s*:\\s*[\"'](granted|denied)[\"']", "i").exec(m[1]);
    if (km) states[key] = km[1].toLowerCase();
  }
  const consentKeys = ["ad_storage", "analytics_storage", "ad_user_data", "ad_personalization"].filter((k) => k in states);
  return {
    states,
    evidence: trimEvidence(m[0]),
    grantsByDefault: consentKeys.some((k) => states[k] === "granted"),
    deniesByDefault: consentKeys.length > 0 && consentKeys.every((k) => states[k] === "denied"),
  };
}

function hostOf(u) {
  try { return new URL(u, "https://relative.invalid").hostname.toLowerCase(); } catch (e) { return ""; }
}

// Where this Worker's fetch left from. A Worker subrequest egresses from the
// Cloudflare location running the Worker, which Cloudflare picks by proximity
// to the VISITOR — not to the site being scanned. So a scan run from Tel Aviv
// leaves from Tel Aviv, and a site that serves EU visitors different markup may
// not have shown us what it shows them. The report says so rather than pretending.
function readVantage(request) {
  const country = (request && request.cf && request.cf.country) || (request && request.headers.get("cf-ipcountry")) || null;
  const colo = (request && request.cf && request.cf.colo) || null;
  return {
    country: country || null,
    colo: colo || null,
    countryKnown: Boolean(country),
    inEurope: country ? EU_EEA_UK.has(String(country).toUpperCase()) : false,
    note: "A Cloudflare Worker's request leaves from the location nearest the visitor who started the scan, not from the country the site sells into.",
  };
}

// --- Second reads: stylesheets and the privacy policy -----------------------
// Still source reads: bytes fetched without running anything. Each adds what it
// read to the report's limits, and nothing it did not read becomes a claim.

// Fetch one text resource with a timeout and a size cap. Returns null on any failure.
async function fetchText(url, { timeoutMs = 4000, maxBytes = 400000, accept = "text/css,*/*;q=0.1" } = {}) {
  const ctrl = typeof AbortController === "function" ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GDRockScanner/2.0; +https://gdrock.com)", Accept: accept, "Accept-Language": "en-GB,en;q=0.9,de;q=0.8" },
      redirect: "follow", signal: ctrl ? ctrl.signal : undefined, cf: { cacheTtl: 300 },
    });
    if (!r.ok) return { ok: false, status: r.status, url: r.url || url };
    const text = (await r.text()).slice(0, maxBytes);
    return { ok: true, status: r.status, url: r.url || url, text, type: r.headers.get("content-type") || "" };
  } catch (e) {
    return { ok: false, status: null, url, error: e && e.name === "AbortError" ? "timed out" : (e && e.message) || "failed" };
  } finally { if (timer) clearTimeout(timer); }
}

const sameSite = (a, b) => a && b && (a === b || a.endsWith("." + b) || b.endsWith("." + a));
const absUrl = (u, base) => { try { return new URL(u, base).href; } catch (e) { return null; } };

// Every url() and @import in a stylesheet, resolved against where the sheet lives.
function cssReferences(css, base) {
  const out = [];
  const re = /@import\s+(?:url\(\s*)?["']?([^"')\s;]+)["']?\s*\)?|url\(\s*["']?([^"')\s]+)["']?\s*\)/gi;
  let m;
  while ((m = re.exec(css)) && out.length < 400) {
    const raw = m[1] || m[2];
    if (!raw || /^data:/i.test(raw)) continue;
    const abs = absUrl(raw, base);
    if (abs) out.push({ url: abs, statement: trimEvidence(m[0]), isImport: !!m[1] });
  }
  return out;
}

// Up to 3 first-party stylesheets (in document order, then what they @import), plus
// the page's own <style> blocks. vapor-handel.de loads Google Fonts from its theme
// CSS by @import, which a read of the HTML alone never sees.
const MAX_STYLESHEETS = 3;
async function readStylesheetFonts(html, finalUrl, finalHost) {
  const found = [], read = [], failed = [];
  const seenFont = new Set();
  const scan = (css, where, base) => {
    for (const ref of cssReferences(css, base)) {
      for (const sig of FONT_SIGNATURES) {
        if (!sig.url.test(ref.url) || seenFont.has(sig.name)) continue;
        seenFont.add(sig.name);
        found.push({ name: sig.name, evidence: trimEvidence(where + ": " + ref.statement), stylesheet: where });
      }
    }
  };
  // Inline <style> blocks are part of the HTML we already have.
  const reStyle = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = reStyle.exec(html))) scan(m[1] || "", "inline <style> in the homepage", finalUrl);

  const queue = [];
  const reLink = /<link\b[^>]*>/gi;
  while ((m = reLink.exec(html)) && queue.length < 20) {
    const tag = m[0];
    if (!/\brel\s*=\s*["']?[^"'>]*stylesheet/i.test(tag)) continue;
    const href = (/\bhref\s*=\s*["']([^"']+)["']/i.exec(tag) || /\bhref\s*=\s*([^\s>]+)/i.exec(tag) || [])[1];
    const abs = href ? absUrl(href.replace(/&amp;/g, "&"), finalUrl) : null;
    if (abs && /^https?:/i.test(abs) && sameSite(hostOf(abs), finalHost)) queue.push(abs);
  }
  const tried = new Set();
  while (queue.length && read.length + failed.length < MAX_STYLESHEETS) {
    // Read what is queued in parallel, up to the cap.
    const batch = [];
    while (queue.length && batch.length + read.length + failed.length < MAX_STYLESHEETS) {
      const u = queue.shift();
      if (!tried.has(u)) { tried.add(u); batch.push(u); }
    }
    if (!batch.length) break;
    const results = await Promise.all(batch.map((u) => fetchText(u)));
    results.forEach((r, i) => {
      if (!r.ok) { failed.push({ url: batch[i], reason: r.status ? "HTTP " + r.status : r.error }); return; }
      read.push(batch[i]);
      scan(r.text, batch[i], r.url);
      // A first-party @import is another stylesheet of the same site: read it next.
      for (const ref of cssReferences(r.text, r.url)) if (ref.isImport && sameSite(hostOf(ref.url), finalHost) && !tried.has(ref.url)) queue.push(ref.url);
    });
  }
  return { found, read, failed };
}

// Privacy policy: the six things Art. 13 GDPR asks a policy to say, looked for in
// EN / DE / FR / NL / ES / IT. A keyword read can miss wording it doesn't know, so
// a miss is reported as "not found in the policy text we read" and never scored.
const POLICY_CHECKS = [
  { key: "controller", label: "who the controller is, with contact details",
    re: /\b(data )?controller\b|responsible for (the )?processing|verantwortliche[rn]?\b|verantwortlich im sinne|responsable (du|de) (traitement|tratamiento)|verwerkingsverantwoordelijke|titolare del trattamento|impressum|\bwho we are\b|\bwer wir sind\b/i,
    also: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|\b(e-?mail|kontakt|contact|contatto|contacto)\b/i },
  { key: "legalBasis", label: "the legal basis for each use of data",
    re: /\blegal bas[ie]s\b|\blawful basis\b|art(icle|ikel|\.)?\s*6\s*(\(1\)|abs\.?\s*1)|rechtsgrundlage|base (légale|juridique|jurídica|legal|giuridica)|bases? legales?|rechtsgrond(slag)?|legittimo interesse|interés legítimo|berechtigte[sn]? interesse|legitimate interest/i },
  { key: "rights", label: "the visitor's rights (access, erasure, objection…)",
    // A rights section (heading or phrase), naming at least three of the rights, however it is worded.
    re: /\b(your|data subject|gdpr)['’]?s? rights\b|\bright (of|to) (access|erasure|rectification|restriction|object|data portability)|betroffenenrechte|ihre rechte|recht auf (auskunft|löschung|berichtigung)|vos droits|droit d['’]?accès|uw rechten|recht op (inzage|verwijdering)|tus derechos|derechos? de acceso|i tuoi diritti|diritti dell['’]interessato|diritto di accesso/i,
    terms: /\b(access|rectif(?:y|ication)|eras(?:e|ure)|delet(?:e|ion)|restrict(?:ion)?|port(?:ability)?|object(?:ion)?|auskunft|berichtigung|löschung|einschränkung|widerspruch|datenübertragbarkeit|accès|rectification|effacement|limitation|portabilité|opposition|inzage|rectificatie|verwijdering|beperking|overdraagbaarheid|bezwaar|acceso|rectificación|supresión|limitación|portabilidad|oposición|accesso|rettifica|cancellazione|limitazione|portabilità|opposizione)(?![a-zà-ü])/gi,
    min: 3 },
  { key: "retention", label: "how long data is kept",
    re: /\bretention\b|\bretain(ed)?\b|stored (for|until)|kept (for|until)|speicherdauer|aufbewahr|gespeichert,? (bis|solange|für)|gelöscht, sobald|durée de conservation|conserv(é|e)es? (pendant|jusqu)|bewaartermijn|bewaren (wij|we)? ?(gegevens )?(niet langer|tot|gedurende)|plazo de conservaci|se conservar(á|a)n|periodo di conservazione|conservat[ie] per/i },
  { key: "processors", label: "who the data is shared with (processors, recipients)",
    re: /\b(sub-?)?processors?\b|\brecipients?\b|service providers?|third[- ]part(y|ies)|auftragsverarbeit|empfänger|dienstleister|sous-traitants?|destinataires?|verwerkers?\b|ontvangers?\b|encargados? del tratamiento|destinatarios?|responsabil[ei] del trattamento|destinatari/i },
  { key: "complaint", label: "the right to complain to a supervisory authority",
    re: /supervisory authority|lodge a complaint|data protection authority|aufsichtsbehörde|beschwerderecht|recht auf beschwerde|autorité de contrôle|\bcnil\b|réclamation|toezichthoudende autoriteit|autoriteit persoonsgegevens|\bklacht\b|autoridad de control|\baepd\b|reclamación|autorità di controllo|\bgarante\b|\breclamo\b|\bico\b|information commissioner/i },
];

function policyLinkFrom(anchors, finalUrl) {
  let best = null, bestScore = 0;
  for (const a of anchors) {
    const href = String(a.href || ""), text = String(a.text || "");
    if (!href || /^(mailto|tel|javascript):|^#/i.test(href)) continue;
    const blob = (href + " " + text).toLowerCase();
    let score = 0;
    if (/privacy|datenschutz|confidentialit|privacidad|privacidade|privacybeleid|informativa|privacyverklaring|protection-des-donnees|politique-de-confidentialite|prywatno|prywatn|integritet|privatliv|personvern|tietosuoja|osobn|adatv[ée]delem|privatnost|zasebnost|poveritel|privatum|privaatsus|aporrit|persondata|dataskydd|riservatezza/.test(blob)) score += 2;
    if (/polic|erklärung|erklaerung|beleid|verklaring|politica|pol[ií]tica/.test(blob)) score += 1;
    if (/cookie/.test(blob) && !/privacy|datenschutz|confidentialit|privacidad|privacidade|privacybeleid|informativa|prywatn|integritet|privatliv|personvern|tietosuoja|osobn|adatv[ée]delem|privatnost|zasebnost|poveritel|privatum|privaatsus|aporrit|persondata|dataskydd/.test(blob)) score = 0; // a cookie notice is not the policy
    if (score > bestScore) { bestScore = score; best = href; }
  }
  if (!best || bestScore < 2) return null;
  const abs = absUrl(best.replace(/&amp;/g, "&"), finalUrl);
  return abs && /^https?:/i.test(abs) ? abs : null;
}

const htmlToText = (html) => String(html || "")
  .replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
  .replace(/<br\s*\/?>|<\/(p|li|h[1-6]|div|tr|section)>/gi, "\n").replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&auml;/g, "ä").replace(/&ouml;/g, "ö").replace(/&uuml;/g, "ü").replace(/&szlig;/g, "ß")
  .replace(/&[a-z#0-9]+;/gi, " ").replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();

async function readPolicy(anchors, finalUrl) {
  const url = policyLinkFrom(anchors, finalUrl);
  if (!url) return { status: "no_link" };
  const r = await fetchText(url, { timeoutMs: 5000, maxBytes: 600000, accept: "text/html,*/*;q=0.5" });
  if (!r.ok) return { status: "unreadable", url, reason: r.status ? "HTTP " + r.status : r.error };
  const text = htmlToText(r.text).slice(0, 200000);
  // A policy page that is built by JavaScript returns next to no text to a source read.
  if (text.length < 600) return { status: "too_little_text", url: r.url || url, chars: text.length };
  const checks = POLICY_CHECKS.map((c) => {
    const flags = "gi";
    const hits = [];
    const re = new RegExp(c.re.source, flags);
    let m;
    while ((m = re.exec(text)) && hits.length < 12) { hits.push({ i: m.index, w: m[0].toLowerCase() }); if (m[0] === "") re.lastIndex++; }
    let found = hits.length > 0;
    if (found && c.terms) found = new Set((text.match(c.terms) || []).map((w) => w.toLowerCase())).size >= c.min;
    if (found && c.also) found = c.also.test(text);
    const at = hits.length ? hits[0].i : -1;
    return { key: c.key, label: c.label, found, evidence: found && at >= 0 ? trimEvidence("…" + text.slice(Math.max(0, at - 30), at + 110).replace(/\n/g, " ") + "…") : null };
  });
  return { status: "read", url: r.url || url, chars: text.length, checks };
}

// --- Scan cache, rate limits, alert flood control ----------------------------
// A domain's result is kept ~10 minutes (Workers Cache API, per data centre: no
// setup needed), so a double click, the "email me this report" call and a bot
// looping on one site cost one real scan. Real scans are rate-limited per IP,
// and the owner is alerted once per real scan, with a cap so a bot can't flood
// Telegram. Rate limiting and the alert cap are per Worker instance, so they
// are best-effort; env.SCAN_LIMITER (a Cloudflare rate-limit binding) is used
// as well when it is bound.
const SCAN_CACHE_SECONDS = 600;
const SCAN_LIMIT = { perIp: 20, windowMs: 10 * 60 * 1000 };
const ALERT_LIMIT = { perIp: 5, total: 30, windowMs: 10 * 60 * 1000 };
const scanTimes = new Map();   // ip -> timestamps of real scans
const alertTimes = new Map();  // ip -> timestamps of alerts sent
const alertBurst = { start: 0, count: 0, suppressed: 0 };

const scanCacheKey = (domain) => new Request("https://cdn.gdrock.com/__scan-cache/v3/" + encodeURIComponent(domain));
async function scanCacheGet(domain) {
  try {
    if (typeof caches === "undefined" || !caches.default) return null;
    const hit = await caches.default.match(scanCacheKey(domain));
    return hit ? await hit.json() : null;
  } catch (e) { return null; }
}
function scanCachePut(ctx, domain, result) {
  try {
    if (typeof caches === "undefined" || !caches.default) return;
    const res = new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=" + SCAN_CACHE_SECONDS } });
    later(ctx, caches.default.put(scanCacheKey(domain), res));
  } catch (e) {}
}

function recent(map, key, windowMs) {
  const now = Date.now();
  const list = (map.get(key) || []).filter((t) => now - t < windowMs);
  map.set(key, list);
  if (map.size > 5000) map.clear(); // memory guard; a flood this wide resets the window
  return list;
}
async function scanAllowed(env, ip) {
  if (!ip) return true; // Cloudflare always sends CF-Connecting-IP; only local tools don't
  if (env.SCAN_LIMITER && typeof env.SCAN_LIMITER.limit === "function") {
    try { const { success } = await env.SCAN_LIMITER.limit({ key: ip }); if (!success) return false; } catch (e) { /* binding trouble: fall back */ }
  }
  const list = recent(scanTimes, ip, SCAN_LIMIT.windowMs);
  if (list.length >= SCAN_LIMIT.perIp) return false;
  list.push(Date.now());
  return true;
}
// -> { send: boolean, suppressed: number of alerts held back since the last one sent }
function alertGate(ip) {
  if (!ip) return { send: true, suppressed: 0 };
  const now = Date.now();
  if (now - alertBurst.start > ALERT_LIMIT.windowMs) { alertBurst.start = now; alertBurst.count = 0; }
  const mine = recent(alertTimes, ip, ALERT_LIMIT.windowMs);
  if (mine.length >= ALERT_LIMIT.perIp || alertBurst.count >= ALERT_LIMIT.total) { alertBurst.suppressed++; return { send: false, suppressed: 0 }; }
  mine.push(now);
  alertBurst.count++;
  const suppressed = alertBurst.suppressed;
  alertBurst.suppressed = 0;
  return { send: true, suppressed };
}

// --- Deep check: a real browser on a server in Germany -----------------------
// The public scan reads source code. The deep check runs the before-consent
// rig (verify_consent.js) on a VPS in Germany, so the site treats it as an EU
// visitor, and emails the result. The Worker only brokers: it queues jobs in
// KV (env.DEEP_SCAN, entries expire after 14 days, so requesters' emails do
// too), hands one to the runner at a time, and sends the report the runner
// posts back. The runner authenticates with DEEP_SCAN_RUNNER_TOKEN.
const DEEP_TTL_SECONDS = 14 * 86400;
const DEEP_PER_EMAIL_PER_DAY = 3;
const DEEP_PER_IP_PER_HOUR = 3;
// The runner polls every 20 s. Listing the queue on every poll is ~4,300 KV list
// operations a day, four times the free plan's 1,000, so a poll first reads one
// flag key that a new job sets ("q:any") and lists only when it's there (or when
// the runner asks for a full sweep, every few minutes, as a safety net). Each poll
// also refreshes "runner:seen" (at most every 5 min); without it, a request is
// told the truth: nobody is checking right now, it gets run by hand.
const DEEP_FLAG = "q:any";
const RUNNER_SEEN = "runner:seen";
const RUNNER_SEEN_TTL = 15 * 60;
const runnerOnline = async (env) => !!(await env.DEEP_SCAN.get(RUNNER_SEEN));
const deepTimes = new Map();
const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i;
const DOMAIN_RE = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

async function sha256Hex(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function runnerAuthorized(env, request) {
  const t = env.DEEP_SCAN_RUNNER_TOKEN;
  return !!t && timingSafeEqual(request.headers.get("Authorization") || "", "Bearer " + t);
}
async function deepJob(env, id) {
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  try { return JSON.parse((await env.DEEP_SCAN.get("job:" + id)) || "null"); } catch (e) { return null; }
}
const saveDeepJob = (env, job) => env.DEEP_SCAN.put("job:" + job.id, JSON.stringify(job), { expirationTtl: DEEP_TTL_SECONDS });
async function deepQueuePosition(env, id) {
  const list = await env.DEEP_SCAN.list({ prefix: "queue:", limit: 200 });
  const i = list.keys.findIndex((k) => k.name.endsWith(":" + id));
  return i === -1 ? null : i + 1;
}
async function telegram(env, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
  }).catch(() => {});
}

async function handleDeepScanRequest(request, env, ctx) {
  const b = await request.json().catch(() => ({}));
  const email = String(b.email || "").trim().slice(0, 200);
  const domain = normDomain(b.url);
  if (!EMAIL_RE.test(email)) return json({ error: "Valid email required" }, 400);
  if (!DOMAIN_RE.test(domain)) return json({ error: "Valid website address required" }, 400);
  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (ip) {
    const mine = recent(deepTimes, ip, 3600 * 1000);
    if (mine.length >= DEEP_PER_IP_PER_HOUR) return json({ error: "rate_limited", message: "That's several deep checks from your connection in the last hour. Try again later, or email office@gdrock.com." }, 429);
    mine.push(Date.now());
  }
  const vantage = readVantage(request);

  // Before the VPS and its queue exist, a request is kept as a lead and the owner
  // runs it by hand: nobody who asked is lost.
  if (!env.DEEP_SCAN) {
    if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
      later(ctx, fetch(`${env.SUPABASE_URL}/rest/v1/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "return=minimal" },
        body: JSON.stringify({ source: "deep_scan", email, website_url: domain, plan: "deep-check", notes: "Deep check requested; queue not configured, run it by hand" + (b.optin === true ? " | opted-in: alerts+news" : "") }),
      }));
    }
    later(ctx, telegram(env, `GDRock deep check requested (no queue yet: run it by hand)\n\nSite: ${domain}\nEmail: ${email}\nVisitor location: ${vantage.country || "unknown"}\n\nnode verify_consent.js https://${domain} --geo=de`));
    return json({ ok: true, queued: false, message: "Got it. We run this check by hand right now, from a connection in Germany, and email you the result within one working day." });
  }

  const ehash = (await sha256Hex(email.toLowerCase())).slice(0, 32);
  const capKey = "cap:" + ehash;
  const used = parseInt((await env.DEEP_SCAN.get(capKey)) || "0", 10) || 0;
  if (used >= DEEP_PER_EMAIL_PER_DAY) return json({ error: "rate_limited", message: "That email has had " + DEEP_PER_EMAIL_PER_DAY + " deep checks today. Reply to one of the reports if you need more." }, 429);

  // The same site for the same person within a day: point them at the job already running.
  const dupKey = "dup:" + domain + ":" + ehash;
  const dupId = await env.DEEP_SCAN.get(dupKey);
  const dup = dupId ? await deepJob(env, dupId) : null;
  if (dup && (dup.status === "queued" || dup.status === "running")) {
    return json({ ok: true, queued: true, duplicate: true, id: dup.id, status: dup.status, position: dup.status === "queued" ? await deepQueuePosition(env, dup.id) : 0,
      message: "That check is already " + (dup.status === "queued" ? "in the queue" : "running") + ". The result goes to " + email + "." });
  }

  const now = Date.now();
  const job = { id: crypto.randomUUID(), domain, url: "https://" + domain, email, optin: b.optin === true, status: "queued",
    created: new Date(now).toISOString(), requestedFrom: vantage.country || null, src: cleanSrc(b.src) || null };
  await saveDeepJob(env, job);
  await env.DEEP_SCAN.put("queue:" + String(now).padStart(15, "0") + ":" + job.id, job.id, { expirationTtl: 3 * 86400 });
  await env.DEEP_SCAN.put(DEEP_FLAG, String(now), { expirationTtl: 3 * 86400 });
  await env.DEEP_SCAN.put(dupKey, job.id, { expirationTtl: 86400 });
  await env.DEEP_SCAN.put(capKey, String(used + 1), { expirationTtl: 86400 });
  const position = await deepQueuePosition(env, job.id);
  const online = await runnerOnline(env);
  later(ctx, telegram(env, `GDRock deep check queued\n\nSite: ${domain}\nEmail: ${email}${job.optin ? " (opted in)" : ""}\nPosition: ${position || "?"}` + (job.src ? "\nCame from: " + job.src : "") +
    (online ? "" : `\n\nRUNNER OFFLINE: nothing is checking the queue. Start the VPS runner, or run it by hand and email the result:\nnode verify_consent.js https://${domain} --geo=de`)));
  return json({ ok: true, queued: true, id: job.id, position, runner_online: online,
    message: online
      ? "Queued" + (position > 1 ? " (" + position + " ahead of you, including yours)" : "") + ". A browser on a server in Germany is checking " + domain + " twice, without touching the banner. The result goes to " + email + ", usually within 15 minutes."
      : "Got it. Our checking server is offline right now, so this one is run by hand, from a connection in Germany, without touching your banner. The result goes to " + email + " within one working day." });
}

async function handleDeepScanNext(request, env, url) {
  if (!runnerAuthorized(env, request)) return json({ error: "unauthorized" }, 401);
  if (!env.DEEP_SCAN) return json({ error: "deep_scan_not_configured" }, 503);
  const now = Date.now();
  const seen = Number((await env.DEEP_SCAN.get(RUNNER_SEEN)) || 0);
  if (now - seen > 5 * 60 * 1000) await env.DEEP_SCAN.put(RUNNER_SEEN, String(now), { expirationTtl: RUNNER_SEEN_TTL });
  const flag = await env.DEEP_SCAN.get(DEEP_FLAG);
  const full = url && url.searchParams.get("full") === "1";
  if (!flag && !full) return cors(null, 204);
  const list = await env.DEEP_SCAN.list({ prefix: "queue:", limit: 20 });
  // An empty queue clears the flag, but only once it is two minutes old: KV takes
  // up to a minute to show a new key everywhere, and a fresh job must not be lost.
  if (!list.keys.length && flag && now - Number(flag) > 2 * 60 * 1000) await env.DEEP_SCAN.delete(DEEP_FLAG);
  for (const k of list.keys) {
    const id = await env.DEEP_SCAN.get(k.name);
    await env.DEEP_SCAN.delete(k.name);
    const job = await deepJob(env, id);
    if (!job || job.status !== "queued") continue;
    job.status = "running";
    job.claimed = new Date().toISOString();
    await saveDeepJob(env, job);
    return json({ id: job.id, url: job.url, domain: job.domain });
  }
  return cors(null, 204);
}

async function handleDeepScanResult(request, env, ctx) {
  if (!runnerAuthorized(env, request)) return json({ error: "unauthorized" }, 401);
  if (!env.DEEP_SCAN) return json({ error: "deep_scan_not_configured" }, 503);
  const r = await request.json().catch(() => null);
  const job = r ? await deepJob(env, r.id) : null;
  if (!job) return json({ error: "unknown job" }, 404);
  if (job.status === "done" || job.status === "failed") return json({ ok: true, already: job.status });
  const scored = r.ok !== false && typeof r.score === "number" && r.verdict !== "INCONCLUSIVE" && r.verdict !== "ERROR";
  job.status = r.ok === false ? "failed" : "done";
  job.finished = new Date().toISOString();
  job.verdict = String(r.verdict || (r.ok === false ? "ERROR" : "")).slice(0, 20) || null;
  job.score = scored ? r.score : null;
  await saveDeepJob(env, job);
  await sendDeepScanReport(env, job, r, scored);
  later(ctx, telegram(env, `GDRock deep check finished\n\nSite: ${job.domain}\nEmail: ${job.email}\nResult: ${scored ? r.score + "/100 (" + job.verdict + ")" : job.verdict + (r.problem ? " - " + String(r.problem).slice(0, 160) : "")}`));
  return json({ ok: true, status: job.status });
}

async function handleDeepScanStatus(url, env) {
  if (!env.DEEP_SCAN) return json({ error: "deep_scan_not_configured" }, 503);
  const job = await deepJob(env, url.searchParams.get("id"));
  if (!job) return json({ error: "unknown job" }, 404);
  return json({ status: job.status, domain: job.domain, position: job.status === "queued" ? await deepQueuePosition(env, job.id) : null,
    verdict: job.status === "done" ? job.verdict : null, score: job.status === "done" ? job.score : null });
}

// The runner's result, as an email. Every statement comes from the rig's own
// summary (what a real browser in Germany saw before anyone clicked the banner);
// an inconclusive run claims nothing.
async function sendDeepScanReport(env, job, r, scored) {
  const e = escHtml;
  const card = r.card || {};
  const rows = Array.isArray(card.rows) ? card.rows.slice(0, 10) : [];
  const deductions = Array.isArray(r.deductions) ? r.deductions.slice(0, 10) : [];
  const net = r.network || {}, vis = r.visitor || {};
  const color = !scored ? "#9CA3AF" : r.score >= 80 ? "#4f7dff" : r.score >= 60 ? "#f5c842" : "#e63946";
  const checked = job.finished ? job.finished.slice(0, 10) : "";
  const method = `Chrome on a server in Germany (the connection was seen as ${e(net.country || "unknown")}), ${e(vis.language || "German")} language and ${e(vis.timezone || "Berlin")} time, ${e(r.runs || 2)} separate visits, the cookie banner never clicked. Checked ${e(checked)}.`;
  const head = card.headline ? `<p style="color:#fff;font-size:20px;font-weight:800;text-align:center;margin:0 0 4px;">${e(card.headline.line1 || "")}</p><p style="color:${card.headline.line2Color === "red" ? "#ff8a8a" : "#9CA3AF"};font-size:16px;text-align:center;margin:0 0 20px;">${e(card.headline.line2 || "")}</p>` : "";
  const rowHtml = rows.map((x) => `<tr><td style="padding:8px 12px;border-left:3px solid ${x.ok ? "#4f7dff" : "#e63946"};background:#111522;color:#cfd8ea;font-size:14px;border-radius:6px;">${x.ok ? "✓" : "✗"} <b>${e(x.title || "")}</b>${x.sub ? `<div style="color:#9CA3AF;font-size:12.5px;margin-top:4px;">${e(x.sub)}</div>` : ""}</td></tr><tr><td style="height:8px"></td></tr>`).join("");
  // What loaded before any click, with its time from the start of the visit (from the rig's card).
  const timeline = Array.isArray(card.timeline) ? card.timeline.slice(0, 12) : [];
  const tlHtml = timeline.length ? `<p style="color:#9CA3AF;font-family:Consolas,Menlo,monospace;font-size:12px;letter-spacing:.06em;margin:4px 0 8px;">${e(card.timelineLabel || "WHAT LOADED BEFORE ANY CLICK")}</p>
       <table style="width:100%;border-collapse:collapse;margin:0 0 16px;">${timeline.map((t) => `<tr><td style="padding:5px 10px 5px 0;color:#ff6b6b;font-family:Consolas,Menlo,monospace;font-size:14px;font-weight:700;white-space:nowrap;vertical-align:top;width:1%;">${e(t.at || "")} </td><td style="padding:5px 0;color:#fff;font-size:15px;">${e(t.name || "")}${t.note ? `<span style="color:#9CA3AF;font-size:12.5px;"> · ${e(t.note)}</span>` : ""}</td></tr>`).join("\n")}</table>
       ${card.timelineFoot ? `<p style="color:#9CA3AF;font-size:12.5px;margin:-8px 0 16px;">…${e(card.timelineFoot)}</p>` : ""}` : "";
  const dedHtml = deductions.length ? `<ul style="color:#cfd8ea;font-size:13px;line-height:1.6;padding-left:18px;margin:6px 0 0;">${deductions.map((d) => `<li>−${e(d.points)} ${e(d.short || d.text || "")}${d.detail ? `: <span style="color:#9CA3AF;">${e(String(d.detail).slice(0, 240))}</span>` : ""}</li>`).join("")}</ul>` : "";
  const body = scored
    ? `<div style="text-align:center;font-size:48px;font-weight:800;color:${color};margin-bottom:8px;">${e(r.score)}/100</div>${head}
       ${r.safeClaim ? `<p style="color:#cfd8ea;font-size:14px;line-height:1.6;margin:0 0 16px;">${e(String(r.safeClaim).slice(0, 700))}</p>` : ""}
       ${tlHtml}<table style="width:100%;border-collapse:collapse;">${rowHtml}</table>${dedHtml}`
    : `<p style="color:#fff;font-size:18px;font-weight:700;text-align:center;margin:0 0 10px;">We couldn't settle this one</p>
       <p style="color:#cfd8ea;font-size:14px;line-height:1.6;text-align:center;margin:0 0 10px;">${e(String(r.problem || r.error || "The check did not finish.").slice(0, 400))}</p>
       <p style="color:#9CA3AF;font-size:13px;line-height:1.6;text-align:center;margin:0;">So nothing is claimed about your site from this run. Reply to this email and we'll look at it by hand.</p>`;
  // The offer: a leaking result gets one priced button straight to the Essential Setup checkout;
  // a clean result gets no sales pitch beyond keeping it that way; an unsettled one gets a person.
  const diy = `<p style="color:#9CA3AF;font-size:13px;line-height:1.6;margin:16px 0 0;">Rather do it yourself? <a href="https://www.gdrock.com/checkout.html?plan=core" style="color:#8fb0ff;">Core Pack, &euro;29 once</a> (self-hosted) or <a href="https://www.gdrock.com/checkout.html?plan=care" style="color:#8fb0ff;">Care, &euro;15 a month</a> (hosted, kept up to date).</p>`;
  const offer = !scored ? "" : r.score >= 90
    ? `<div style="background:#111522;border:1px solid #262c3b;border-radius:12px;padding:18px;margin-top:22px;text-align:center;">
      <p style="color:#fff;font-size:15px;font-weight:700;margin:0 0 6px;">Nothing to fix today.</p>
      <p style="color:#9CA3AF;font-size:13px;line-height:1.6;margin:0;">Run this check again whenever you add an app or change your theme: that's when trackers usually slip back in.</p>
    </div>`
    : `<div style="background:#0f1630;border:1px solid #2f4fb8;border-radius:14px;padding:22px 20px;margin-top:22px;text-align:center;">
      <p style="color:#8fb0ff;font-family:Consolas,Menlo,monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;margin:0 0 8px;">Fix it for me</p>
      <p style="color:#fff;font-size:20px;font-weight:800;margin:0 0 8px;">We fix ${e(job.domain)} for &euro;249.</p>
      <p style="color:#cfd8ea;font-size:13.5px;line-height:1.6;margin:0 0 16px;">We install the blocker and banner, run this exact check again from Germany, and send you the new result. You get a booking link straight after payment. 14-day money-back guarantee.</p>
      <a href="https://whop.com/checkout/plan_rDl4G6eAcftqC/" style="display:inline-block;background:#4f7dff;color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 28px;border-radius:10px;">Fix it for me: &euro;249 &rarr;</a>
      ${diy}
    </div>`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;background:#08090c;padding:32px;border-radius:16px;">
    <div style="text-align:center;margin-bottom:22px;"><span style="font-size:22px;font-weight:800;color:#fff;">GDRock</span><div style="color:#5b6a8a;font-size:12px;">Deep check · what loads before anyone chooses</div></div>
    <h1 style="color:#fff;font-size:22px;text-align:center;margin:0 0 6px;">Your deep check</h1>
    <p style="text-align:center;color:#9CA3AF;font-size:14px;margin:0 0 22px;">for ${e(job.domain)}</p>
    ${body}
    <div style="margin-top:20px;padding:14px 16px;border-radius:10px;background:#111522;"><p style="color:#cfd8ea;font-size:13px;font-weight:700;margin:0 0 6px;">How this was checked</p><p style="color:#9CA3AF;font-size:12.5px;line-height:1.55;margin:0;">${method} The full report and the result card are attached. A site can change from day to day, so this is a snapshot.</p></div>
    ${offer}
    <p style="color:#5b6a8a;font-size:11.5px;text-align:center;margin-top:18px;line-height:1.6;">Automated and informational, not legal advice or a compliance guarantee. We keep your email with this job for 14 days, then it is deleted from the queue; a copy of the request also reaches the founder so a person can follow up.<br>Questions? Just reply.</p>
  </div>`;
  const attachments = [];
  if (typeof r.card_png === "string" && /^[A-Za-z0-9+/=]+$/.test(r.card_png) && r.card_png.length < 4000000) attachments.push({ name: job.domain + "_GDRock-deep-check.png", type: "image/png", content: r.card_png });
  if (typeof r.report === "string" && r.report.length) attachments.push({ name: job.domain + "_report.txt", type: "text/plain", content: base64Utf8(r.report.slice(0, 200000)) });
  const subject = scored ? `Your GDRock deep check for ${job.domain}: ${r.score}/100` : `Your GDRock deep check for ${job.domain}: not conclusive`;
  try { await sendEmail(env, job.email, subject, html, attachments); } catch (err) { console.error("deep check email failed -", err && err.message); }
}

// --- The scan itself -------------------------------------------------------

// One anonymous GET. Returns only what came back.
async function scrapeSite(url, vantage) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GDRockScanner/2.0; +https://gdrock.com)", "Accept-Language": "en-GB,en;q=0.9,de;q=0.8" },
      cf: { cacheTtl: 60 }, redirect: "follow",
    });
    if (!r.ok) return { ok: false, status: r.status };
    const html = (await r.text()) || "";
    const low = html.toLowerCase();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z#0-9]+;/gi, " ")
      .replace(/\s+/g, " ").trim().slice(0, 6000);

    const d = dissect(html);
    const finalUrl = r.url || url;
    const finalHost = hostOf(finalUrl);

    // Policy links come from anchors — the one place anchors are the right source.
    const links = [];
    for (const a of d.anchors) {
      const blob = ((a.href || "") + " " + (a.text || "")).toLowerCase();
      if (links.length < 12 && /privacy|datenschutz|confidential|privacidad|privacidade|privacybeleid|informativa|prywatn|integritet|privatliv|personvern|tietosuoja|osobn|adatv[ée]delem|privatnost|zasebnost|poveritel|privatum|privaatsus|aporrit|persondata|dataskydd|terms|agb|conditions|condiciones|condicoes|condi[çc][õo]es|regulamin|villkor|vilkar|vilk[åa]r|ehdot|uvjeti|pogoji|podm[ií]nky|obchodn|termeni|tingimused|s[aą]lygos|noteikumi|impressum|cookie|legal|mentions-legales/.test(blob)) links.push(a.href.slice(0, 140));
    }

    // Second reads, in parallel: the site's own stylesheets (fonts pulled in by
    // @import or url()) and the privacy policy page the homepage links to.
    const [css, policy] = await Promise.all([readStylesheetFonts(html, finalUrl, finalHost), readPolicy(d.anchors, finalUrl)]);

    const cmps     = matchSignatures(CMP_SIGNATURES, d, r.headers);
    const trackers = matchSignatures(TRACKER_SIGNATURES, d, r.headers);
    const fonts    = matchSignatures(FONT_SIGNATURES, d, r.headers);
    for (const f of css.found) if (!fonts.some((x) => x.name === f.name)) fonts.push({ name: f.name, evidence: f.evidence, cookieless: false, via: "stylesheet" });
    const embeds   = matchSignatures(EMBED_SIGNATURES, d, r.headers);
    const platform = matchSignatures(PLATFORM_SIGNATURES, d, r.headers)[0] || null;

    // GTM is matched on the whole source: Google's standard snippet has no
    // <script src>, so the loader URL only ever exists inside inline JS.
    const gtm = /googletagmanager\.com\/(?:gtm\.js|ns\.html)|\/gtm\.js\?id=|gtm\.start\b/.test(low);
    if (gtm) {
      const ev = /googletagmanager\.com\/(?:gtm\.js|ns\.html)[^"'\s]*/i.exec(html);
      trackers.push({ name: "Google Tag Manager", evidence: trimEvidence(ev ? ev[0] : "gtm.start dataLayer push") });
    }

    // Set-Cookie on the document response: cookies this site handed to a
    // visitor who had not interacted with anything at all.
    const rawCookies = typeof r.headers.getSetCookie === "function"
      ? r.headers.getSetCookie()
      : (r.headers.get("set-cookie") ? [r.headers.get("set-cookie")] : []);
    const setCookies = rawCookies.map((c) => String(c).split(";")[0].split("=")[0].trim()).filter(Boolean).slice(0, 40);
    const trackingCookies = setCookies.filter((n) => TRACKING_COOKIE_PREFIXES.some((p) => n === p || n.startsWith(p)));

    // Every third-party host the markup points at, for the "other" group.
    const thirdPartyHosts = [...new Set(d.resourceUrls.map(hostOf).filter((h) => h && h !== "relative.invalid" && h !== finalHost && !h.endsWith("." + finalHost) && !finalHost.endsWith("." + h)))].slice(0, 40);

    return {
      ok: true, text, low, links, html, finalUrl,
      cmps, trackers, fonts, embeds, platform, gtm,
      gatedTags: findGatedTags(html),
      consentMode: readConsentMode(d.inlineJs),
      setCookies, trackingCookies, thirdPartyHosts,
      stylesheets: { read: css.read, failed: css.failed }, policy,
      vantage: vantage || readVantage(null),
    };
  } catch (e) { return { ok: false, error: e.message }; }
}

// --- Findings and score ----------------------------------------------------

// Turns the observations into findings and a score. Nothing in here asserts an
// order of events, a rendered banner, or any runtime behaviour.
function buildReport(domain, s) {
  let score = 100;
  const deductions = [];
  const issues = [];
  const deduct = (key, detail) => {
    const rule = SOURCE_SCORE_RULES[key];
    score += rule.points;
    deductions.push({ rule: key, points: rule.points, label: rule.label, detail: detail || null });
  };
  // Each finding carries a stable id so a UI can map it to its own copy without reading the prose.
  const add = (severity, text, confidence, evidence, id) => issues.push({ id: id || null, severity, text, confidence, evidence: evidence || null });
  const names = (list) => list.map((x) => x.name).join(", ");

  const hasCMP = s.cmps.length > 0;
  const hasTrk = s.trackers.length > 0;
  const gated  = s.gatedTags.length > 0;
  const cm     = s.consentMode;

  // 1. Tags vs consent tooling.
  if (hasTrk && !hasCMP) {
    deduct("trackers_no_consent_tool", names(s.trackers));
    add("critical",
      "The homepage source loads " + names(s.trackers) + ", and no consent tool we recognise appears anywhere in it. This scan reads source code only, so it cannot tell you whether those tags run before a visitor chooses — treat it as the first thing to check, not as a proven breach.",
      "observed", s.trackers.map((t) => t.evidence).slice(0, 4).join(" | "), "tags_no_consent_tool");
  } else if (hasTrk && hasCMP && !gated) {
    // Informational only, no points. Shopware's cookie bar, Shopify's banner and
    // most tag-manager setups hold tags back at runtime, which leaves no trace in
    // the source; the local rig proved exactly that on vapor-handel.de.
    add("warning",
      names(s.cmps) + " is installed alongside " + names(s.trackers) + ", and no tag in the source carries the markup a consent tool uses to hold one back (no type=\"text/plain\", no consent data-attribute). Several tools block at runtime instead, which source code cannot show, so this is a prompt to check in a browser rather than a finding against you.",
      "inferred", s.cmps.map((c) => c.evidence).slice(0, 2).join(" | "), "tags_not_marked_for_consent");
  } else if (hasTrk && hasCMP && gated) {
    add("good",
      names(s.cmps) + " is installed, and " + s.gatedTags.length + " tag" + (s.gatedTags.length === 1 ? " is" : "s are") + " marked in the source for it to hold back until consent. Whether it holds every tag back is a runtime question this scan cannot answer.",
      "observed", s.gatedTags[0], "tags_marked_for_consent");
  } else {
    add("good",
      "No third-party analytics or advertising tag was found in the homepage source. Tags injected later by a tag manager, by an app, or on another page would not appear here.",
      "observed", null, "no_tags_in_source");
  }

  if (hasCMP) {
    add("good", "Consent tool found in the source: " + names(s.cmps) + ".", "observed", s.cmps[0].evidence, "consent_tool_found");
  } else {
    add("warning",
      "No consent tool was found in the homepage source. That is not proof there is no banner — some are injected by a tag manager or a store app, and some are served only to visitors in certain countries. It means nothing in the page we fetched declares one.",
      "observed", null, "no_consent_tool");
  }

  // 2. Consent Mode defaults — declared in the initial HTML, so fair game.
  if (cm && cm.grantsByDefault) {
    deduct("consent_mode_granted", JSON.stringify(cm.states));
    add("critical",
      "Google Consent Mode is configured in the source with storage granted by default (" + Object.entries(cm.states).map(([k, v]) => k + ": " + v).join(", ") + "). That default permits Google's tags to store and send data without waiting for anyone to agree.",
      "observed", cm.evidence, "consent_mode_granted");
  } else if (cm && cm.deniesByDefault) {
    add("good",
      "Google Consent Mode is configured in the source with ad and analytics storage denied by default, which is the correct default.",
      "observed", cm.evidence, "consent_mode_denied");
  }

  // 3. Fonts and embeds. These behave identically for every visitor in every
  //    country, which is what makes them claimable from any vantage point.
  if (s.fonts.length) {
    deduct("third_party_fonts", names(s.fonts));
    const inCss = s.fonts.filter((f) => f.via === "stylesheet").length, inHtml = s.fonts.length - inCss;
    const where = inCss && inHtml ? "linked in the homepage source and imported by the site's own stylesheet"
      : inCss ? "imported by the site's own stylesheet" : "linked directly in the homepage source";
    add("warning",
      names(s.fonts) + " " + (s.fonts.length === 1 ? "is" : "are") + " " + where + ", so a visitor's browser requests " + (s.fonts.length === 1 ? "it" : "them") + " from that server, disclosing their IP address, as the page " + (inCss && !inHtml ? "loads its styles" : "parses") + ". A German court awarded damages over exactly this (LG München I, 20.01.2022, 3 O 17493/20). Self-hosting the font files removes it.",
      "observed", s.fonts.map((f) => f.evidence).slice(0, 2).join(" | "), "third_party_fonts");
  }
  const cookieEmbeds = s.embeds.filter((e) => !e.cookieless);
  if (cookieEmbeds.length) {
    deduct("cookie_setting_embed", names(cookieEmbeds));
    add("warning",
      names(cookieEmbeds) + " " + (cookieEmbeds.length === 1 ? "is" : "are") + " embedded in the homepage source. Embeds like these set cookies on load unless a consent tool holds them back; YouTube's youtube-nocookie.com domain is the usual swap.",
      "observed", cookieEmbeds[0].evidence, "cookie_setting_embed");
  }

  // 4. The document's own Set-Cookie. Usually empty, because most tracking
  //    cookies are written by JavaScript, which this scan never runs.
  if (s.trackingCookies.length) {
    deduct("tracking_cookie_on_document", s.trackingCookies.join(", "));
    add("critical",
      "The homepage response set " + (s.trackingCookies.length === 1 ? "a tracking cookie" : "tracking cookies") + " (" + s.trackingCookies.join(", ") + ") on a request that carried no cookies and no consent. This one is not a matter of interpretation: it is on the response we fetched.",
      "observed", s.trackingCookies.join(", "), "tracking_cookie_on_document");
  }

  // 5. Policies.
  const hasPrivacy = s.links.some((l) => /privacy|datenschutz|confidential|privacidad|privacidade|privacybeleid|informativa|prywatn|integritet|privatliv|personvern|tietosuoja|osobn|adatv[ée]delem|privatnost|zasebnost|poveritel|privatum|privaatsus|aporrit|persondata|dataskydd/i.test(l));
  const hasTerms   = s.links.some((l) => /terms|agb|conditions|condiciones|condicoes|condi[çc][õo]es|regulamin|villkor|vilkar|vilk[åa]r|ehdot|uvjeti|pogoji|podm[ií]nky|obchodn|termeni|tingimused|s[aą]lygos|noteikumi|impressum|legal|mentions/i.test(l));
  if (!hasPrivacy) {
    deduct("no_privacy_link");
    add("critical", "No link to a privacy policy was found in the homepage markup. Art. 13 GDPR requires that information to be reachable from where data is collected.", "observed", null, "no_privacy_link");
  } else {
    add("good", "A privacy policy link is present in the homepage markup.", "observed", null, "privacy_link_found");
  }
  if (!hasTerms) {
    deduct("no_terms_link");
    add("warning", "No terms, legal or imprint link was found in the homepage markup.", "observed", null, "no_terms_link");
  }

  // 6. The privacy policy's contents. A keyword read in six languages can miss
  //    wording it doesn't know, so what it doesn't find is said as exactly that and
  //    never moves the score.
  const pol = s.policy || { status: "no_link" };
  if (pol.status === "read") {
    const hit = pol.checks.filter((c) => c.found), miss = pol.checks.filter((c) => !c.found);
    if (hit.length) add("good", "The privacy policy we read covers " + hit.map((c) => c.label).join("; ") + ".", "observed", hit[0].evidence ? pol.url + " " + hit[0].evidence : pol.url, "policy_covers");
    if (miss.length) add("warning",
      "Not found in the policy text we read: " + miss.map((c) => c.label).join("; ") + ". This is a keyword read in six languages, so a section worded differently can be missed; check " + (miss.length === 1 ? "that part" : "those parts") + " of the policy by hand. Art. 13 GDPR asks a policy to cover all six.",
      "inferred", pol.url, "policy_gaps");
  } else if (pol.status === "unreadable" || pol.status === "too_little_text") {
    add("warning",
      "A privacy policy link was found, but " + (pol.status === "too_little_text" ? "the page returned too little text to check (it may be built by JavaScript)" : "the page could not be read (" + pol.reason + ")") + ", so its contents were not checked.",
      "observed", pol.url, "policy_unreadable");
  }

  // 7. Things this scan cannot see, said out loud rather than scored.
  if (s.gtm) add("warning", GTM_NOTICE, "observed", null, "gtm_container");

  score = Math.max(0, Math.min(100, score));

  // 8. A consent tool next to tracking tags is the one case a source read cannot
  //    settle, and it is the case that matters most: whether those tags wait is
  //    the whole question. cubitts.com scored 100 here while a real browser in
  //    Germany watched six trackers fire before anyone chose. So the score stays
  //    (it counts only what the source proves) but the result is marked open, and
  //    every surface shows "needs a browser check" instead of the number.
  const needsBrowser = hasTrk && hasCMP;
  const openQuestion = needsBrowser ? {
    tags: s.trackers.map((t) => t.name),
    consent_tools: s.cmps.map((c) => c.name),
    text: names(s.cmps) + " is installed next to " + s.trackers.length + (s.trackers.length === 1 ? " tracking tag" : " tracking tags") + " (" + names(s.trackers) + "). Whether " + (s.trackers.length === 1 ? "it waits" : "they wait") + " for a visitor's choice decides this site's result, and only a real browser can see that. Source code can't, so this scan gives no score.",
  } : null;

  const band = needsBrowser ? "A consent tool and tracking tags are both in the source, so the result depends on what runs in a browser."
    : score >= 90 ? "Nothing in the source stands out."
    : score >= 70 ? "The basics are in the source, and the specific gaps are listed below."
    : score >= 40 ? "Real gaps are visible in the source."
    : "The source is missing core protections.";

  return {
    score,
    needs_browser_check: needsBrowser,
    open_question: openQuestion,
    is_real_site: true,
    scan_method: "source",
    site_description: "Website at " + domain + (s.platform ? " (" + s.platform.name + ")" : ""),
    summary: "Read the homepage source of " + domain + ". " + band + " A source scan cannot see runtime behaviour, so the limits are listed with the findings.",
    platform: s.platform ? { name: s.platform.name, evidence: s.platform.evidence } : null,
    consent_tools: s.cmps.map((c) => ({ name: c.name, evidence: c.evidence })),
    tags_found: s.trackers.map((t) => ({ name: t.name, evidence: t.evidence })),
    third_party_hosts: s.thirdPartyHosts,
    stylesheets_read: (s.stylesheets && s.stylesheets.read) || [],
    privacy_policy: pol.status === "read" ? { url: pol.url, status: "read", checks: pol.checks }
      : pol.status === "no_link" ? { status: "no_link" } : { url: pol.url, status: pol.status },
    document_cookies: s.setCookies,
    deductions,
    limits: scanLimits(s),
    vantage: s.vantage,
    legal_disclaimer: SCAN_DISCLAIMER,
    issues: orderIssues(issues),
    checked_at: new Date().toISOString(),
  };
}

// The boundary, stated to the person reading the report instead of buried here.
function scanLimits(s) {
  const v = s.vantage || {};
  const sheets = (s.stylesheets && s.stylesheets.read) || [];
  const pol = s.policy || {};
  const also = [];
  if (sheets.length) also.push(sheets.length === 1 ? "one of the site's own stylesheets (for the fonts it imports)" : sheets.length + " of the site's own stylesheets (for the fonts they import)");
  if (pol.status === "read") also.push("the privacy policy page it links to");
  return [
    "The homepage at " + s.finalUrl + " was read" + (also.length ? ", plus " + also.join(" and ") : "") + ". No other page was.",
    "No JavaScript was executed, so nothing here describes what runs in a real browser — not whether a banner appears, not the order tags fire in, and not the cookies JavaScript writes.",
    "A consent tool, banner or tag added by a tag manager, a store app or a server-side country rule is invisible to a source scan.",
    v.countryKnown
      ? "This request left a Cloudflare location in " + v.country + (v.inEurope
          ? ", inside the EU/EEA/UK."
          : ", outside the EU/EEA/UK, so markup this site serves only to European visitors may not be in what we read.")
      : "We could not determine which Cloudflare location this request left from, so a site that serves different markup per country may have shown us something other than what it shows a European visitor.",
  ];
}

// Worst first, so the panel opens on what matters.
function orderIssues(issues) {
  const rank = { critical: 0, warning: 1, good: 2 };
  return issues.slice().sort((a, b) => (rank[a.severity] ?? 1) - (rank[b.severity] ?? 1)).slice(0, 12);
}

// --- AI: prose only --------------------------------------------------------
// The model never sees the score and never returns one. It is handed the
// observations and asked for two sentences of English. Findings, severities and
// the number are settled by the rules above, which is what stops the same site
// scoring 82 one day and 98 the next.
function buildScanPrompt(fullUrl, s, report) {
  const observations = {
    url: fullUrl,
    platform: report.platform ? report.platform.name : "unknown",
    consent_tools_in_source: report.consent_tools.map((c) => c.name),
    tags_in_source: report.tags_found.map((t) => t.name),
    fonts_in_source: s.fonts.map((f) => f.name),
    embeds_in_source: s.embeds.map((e) => e.name),
    cookies_set_by_the_document: report.document_cookies,
    policy_links_found: s.links.slice(0, 6),
    homepage_text: s.text.slice(0, 2500),
  };
  return `You are writing two short pieces of copy for an automated report. The report's findings and its score are already fixed and are not your job.

The only input is a static read of one page's HTML source. No browser ran. Nothing below describes runtime behaviour.

OBSERVATIONS (the complete set — nothing else was seen):
${JSON.stringify(observations, null, 1)}

Write:
1. "site_description": one clause naming what this business actually sells or does, drawn only from homepage_text. If the text does not say, write "Website at ${fullUrl.replace(/^https?:\/\//, "")}".
2. "summary": at most two sentences describing what the source scan found. Name specific things from the observations.

Hard rules:
- Never state or imply WHEN anything happens: no "before consent", "fires first", "loads immediately", "on page load".
- Never claim a banner does or does not appear, or that a consent tool does or does not block anything. Source code cannot show either.
- Never state an absence as a fact about the site; at most say something was not found in the homepage source.
- Never give a score, a grade, a percentage, or legal advice.
- Plain, factual, British English. No marketing tone.

Respond with only this JSON object:
{"site_description": "...", "summary": "..."}`;
}

// Call OpenAI (gpt-4o-mini, JSON mode) if keyed, else Anthropic. Returns parsed JSON.
async function llmScan(env, prompt) {
  if (env.OPENAI_API_KEY) {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.OPENAI_API_KEY },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" }, max_tokens: 400, temperature: 0.2 }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(`OpenAI API ${r.status}: ${d.error?.message || ""}`);
    return JSON.parse(d.choices?.[0]?.message?.content || "{}");
  }
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    // A key that isn't scoped to a workspace is rejected unless the request names one (ANTHROPIC_WORKSPACE_ID)
    headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "x-api-key": env.ANTHROPIC_API_KEY,
      ...(env.ANTHROPIC_WORKSPACE_ID ? { "anthropic-workspace-id": env.ANTHROPIC_WORKSPACE_ID } : {}) },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 400, system: "Respond with valid JSON only, no markdown.", messages: [{ role: "user", content: prompt }] }),
  });
  const d = await r.json();
  // Status + Anthropic's own message only (e.g. "invalid x-api-key", low credit); the key never appears in it
  if (!r.ok) throw new Error(`Anthropic API ${r.status} ${d.error?.type || ""}: ${d.error?.message || ""}`);
  const raw = d.content?.[0]?.text || "";
  const a = raw.indexOf("{"), b = raw.lastIndexOf("}");
  return JSON.parse(raw.slice(a, b + 1));
}

// The model's prose is accepted only if it stays inside the boundary. A sentence
// that claims timing, a rendered banner, or blocking is dropped and the
// rule-written one stands: bad copy must never become a bad claim.
const PROSE_OUT_OF_BOUNDS = /\bbefore (?:you |a |any |the )?(?:consent|choice|click|accept|opt)|\bwithout (?:consent|asking)\b|\bfires?\b|\bfiring\b|\bon page load\b|\bimmediately\b|\bbanner (?:appears|is shown|is displayed|does not|doesn't|never)|\bblocks? (?:the |all |any )?(?:tracker|tag|script|cookie)|\bnon-?compliant\b|\bis not compliant\b|\bviolat/i;
function acceptProse(value, maxLength) {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v || v.length > maxLength) return null;
  if (PROSE_OUT_OF_BOUNDS.test(v)) return null;
  return v;
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

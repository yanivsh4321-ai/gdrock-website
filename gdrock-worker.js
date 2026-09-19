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
const GDROCK_BLOCKER_JS = "/*! GDRock Consent Blocker v2.1.0 | cdn.gdrock.com | source and limits: gdrock-blocker.js */\n!function(e,t){\"use strict\";if(!e.__gdrockBlocker){var r=\"2.1.0\";e.__gdrockBlocker={version:r};var n=(new Date).getTime(),a={},o=t.currentScript,i=re(\"data-site-id\")||e.GDRockConfig&&e.GDRockConfig.siteId||\"\";if(!i){var c=t.querySelector(\"script[data-site-id]\");c&&(i=c.getAttribute(\"data-site-id\")||\"\")}var s=\"gdrock_consent_\"+(i||\"default\"),l=\"true\"===re(\"data-gdrock-advanced\"),d=\"click\"===re(\"data-gdrock-embeds\"),u=\"bunny\"===re(\"data-gdrock-fonts\"),g=\"true\"===re(\"data-gdrock-strict\"),f=\"false\"!==re(\"data-gdrock-reload\"),p=[\"gdrock.com\"];String(re(\"data-gdrock-allow\")||\"\").replace(/[^,\\s]+/g,function(e){return p.push(e.toLowerCase().replace(/^\\*\\./,\"\")),e});var h=[[\"google.com/pagead/1p-user-list\",\"marketing\",!0,\"Google Ads / DoubleClick\"],[\"google.de/pagead/1p-user-list\",\"marketing\",!0,\"Google Ads / DoubleClick\"],[\"google.com/pagead/1p-conversion\",\"marketing\",!0,\"Google Ads / DoubleClick\"],[\"google.com/ccm/collect\",\"marketing\",!0,\"Google Ads / DoubleClick\"],[\"facebook.com/tr\",\"marketing\",!1,\"Meta Pixel\"],[\"facebook.com/privacy_sandbox/pixel\",\"marketing\",!1,\"Meta Pixel\"],[\"tr-shadow.snapchat.com/\",\"marketing\",!1,\"Snapchat Pixel\"],[\"t.co/i/adsct\",\"marketing\",!1,\"X (Twitter) Pixel\"],[\"ads-twitter.com/i/adsct\",\"marketing\",!1,\"X (Twitter) Pixel\"],[\"a.klaviyo.com/client/events\",\"marketing\",!1,\"Klaviyo onsite tracking\"],[\"a.klaviyo.com/api/track\",\"marketing\",!1,\"Klaviyo onsite tracking\"],[\"s.amazon-adsystem.com/\",\"marketing\",!1,\"Amazon Ads\"],[\"aax.amazon-adsystem.com/\",\"marketing\",!1,\"Amazon Ads\"],[\"alb.reddit.com/\",\"marketing\",!1,\"Reddit Pixel\"],[\"mc.yandex.ru/watch\",\"analytics\",!1,\"Yandex Metrica\"],[\"mc.yandex.com/watch\",\"analytics\",!1,\"Yandex Metrica\"],[\"mc.yandex.ru/webvisor\",\"analytics\",!1,\"Yandex Metrica\"],[\"mc.yandex.com/webvisor\",\"analytics\",!1,\"Yandex Metrica\"],[\"q.quora.com/\",\"marketing\",!1,\"Quora Pixel\"],[\"d.adroll.com/\",\"marketing\",!1,\"AdRoll\"],[\"static-tracking.klaviyo.com/\",\"marketing\",!1,\"Klaviyo onsite\"],[\"c.amazon-adsystem.com/\",\"marketing\",!1,\"Amazon Ads\"],[\"redditstatic.com/ads/\",\"marketing\",!1,\"Reddit Pixel\"],[\"mc.yandex.ru/metrika/\",\"analytics\",!1,\"Yandex Metrica\"],[\"mc.yandex.com/metrika/\",\"analytics\",!1,\"Yandex Metrica\"],[\"a.quora.com/qevents.js\",\"marketing\",!1,\"Quora Pixel\"],[\"s.adroll.com/\",\"marketing\",!1,\"AdRoll\"],[\"dwin1.com/\",\"marketing\",!1,\"Awin\"],[\"googletagmanager.com\",\"analytics\",!0,\"Google Tag Manager\"],[\"google-analytics.com\",\"analytics\",!0,\"Google Analytics\"],[\"analytics.google.com\",\"analytics\",!0,\"Google Analytics\"],[\"doubleclick.net\",\"marketing\",!0,\"Google Ads / DoubleClick\"],[\"googleadservices.com\",\"marketing\",!0,\"Google Ads\"],[\"googlesyndication.com\",\"marketing\",!0,\"Google Ads\"],[\"hotjar.com\",\"analytics\",!1,\"Hotjar\"],[\"hotjar.io\",\"analytics\",!1,\"Hotjar\"],[\"clarity.ms\",\"analytics\",!1,\"Microsoft Clarity\"],[\"mouseflow.com\",\"analytics\",!1,\"Mouseflow\"],[\"fullstory.com\",\"analytics\",!1,\"FullStory\"],[\"connect.facebook.net\",\"marketing\",!1,\"Meta Pixel\"],[\"analytics.tiktok.com\",\"marketing\",!1,\"TikTok Pixel\"],[\"analytics-sg.tiktok.com\",\"marketing\",!1,\"TikTok Pixel\"],[\"static.klaviyo.com\",\"marketing\",!1,\"Klaviyo\"],[\"klaviyo.com/onsite\",\"marketing\",!1,\"Klaviyo\"],[\"px.ads.linkedin.com\",\"marketing\",!1,\"LinkedIn Insight Tag\"],[\"snap.licdn.com\",\"marketing\",!1,\"LinkedIn Insight Tag\"],[\"ct.pinterest.com\",\"marketing\",!1,\"Pinterest Tag\"],[\"s.pinimg.com/ct\",\"marketing\",!1,\"Pinterest Tag\"],[\"sc-static.net\",\"marketing\",!1,\"Snapchat Pixel\"],[\"tr.snapchat.com\",\"marketing\",!1,\"Snapchat Pixel\"],[\"static.ads-twitter.com\",\"marketing\",!1,\"X (Twitter) Pixel\"],[\"analytics.twitter.com\",\"marketing\",!1,\"X (Twitter) Pixel\"],[\"criteo.com\",\"marketing\",!1,\"Criteo\"],[\"criteo.net\",\"marketing\",!1,\"Criteo\"],[\"bat.bing.com\",\"marketing\",!1,\"Microsoft Ads (UET)\"],[\"taboola.com\",\"marketing\",!1,\"Taboola\"],[\"outbrain.com\",\"marketing\",!1,\"Outbrain\"]],m=[[\"\\\\/g\\\\/collect$\",\"(^|&)tid=G-\",\"analytics\",!0,\"Google Analytics 4 (via the site's own server)\"]],y=[[\"Google Fonts\",[\"fonts.googleapis.com/\",\"fonts.gstatic.com/\"]],[\"Adobe Fonts\",[\"use.typekit.net/\",\"p.typekit.net/\"]]],k=[[\"YouTube\",\"Google\",\"video player\",[\"youtube.com/embed\",\"youtube.com/iframe_api\",\"youtube.com/s/player\",\"youtube-nocookie.com/\",\"ytimg.com/\",\"googlevideo.com/\"]],[\"Vimeo\",\"Vimeo\",\"video player\",[\"player.vimeo.com/\",\"vimeocdn.com/\"]],[\"Google Maps\",\"Google\",\"map\",[\"maps.googleapis.com/\",\"maps.gstatic.com/\",\"google.com/maps/embed\",\"google.com/maps/api\",\"google.de/maps/embed\"]]],v=[[\"fbq\\\\(\\\\s*['\\\"]init\",\"Meta Pixel\"],[\"gtag\\\\(\\\\s*['\\\"]config\",\"Google tag\"],[\"googletagmanager\\\\.com\\\\/gtm\\\\.js|['\\\"]gtm\\\\.start['\\\"]\",\"Google Tag Manager\"],[\"ttq\\\\.(?:load|page)\\\\(\",\"TikTok Pixel\"],[\"_hjSettings|static\\\\.hotjar\\\\.com\",\"Hotjar\"],[\"clarity\\\\.ms\\\\/tag|\\\\bclarity\\\\(\\\\s*['\\\"]\",\"Microsoft Clarity\"],[\"pintrk\\\\(\",\"Pinterest Tag\"],[\"snaptr\\\\(\",\"Snapchat Pixel\"],[\"\\\\btwq\\\\(\",\"X (Twitter) Pixel\"],[\"_linkedin_partner_id\",\"LinkedIn Insight Tag\"],[\"\\\\buetq\\\\b\",\"Microsoft Ads (UET)\"],[\"static\\\\.klaviyo\\\\.com|_learnq\",\"Klaviyo\"],[\"\\\\bym\\\\(\\\\s*\\\\d+\",\"Yandex Metrica\"],[\"\\\\brdt\\\\(\",\"Reddit Pixel\"]],b=[[\"_ga\",!0,\"analytics\",\"Google Analytics\"],[\"_gid\",!1,\"analytics\",\"Google Analytics\"],[\"_gat\",!0,\"analytics\",\"Google Analytics\"],[\"_dc_gtm_\",!0,\"analytics\",\"Google Analytics\"],[\"_gcl_\",!0,\"marketing\",\"Google Ads\"],[\"_fbp\",!1,\"marketing\",\"Meta Pixel\"],[\"_fbc\",!1,\"marketing\",\"Meta Pixel\"],[\"_ttp\",!1,\"marketing\",\"TikTok Pixel\"],[\"_tt_enable_cookie\",!1,\"marketing\",\"TikTok Pixel\"],[\"_pin_unauth\",!1,\"marketing\",\"Pinterest Tag\"],[\"_epik\",!1,\"marketing\",\"Pinterest Tag\"],[\"_derived_epik\",!1,\"marketing\",\"Pinterest Tag\"],[\"_scid\",!0,\"marketing\",\"Snapchat Pixel\"],[\"li_fat_id\",!1,\"marketing\",\"LinkedIn Insight Tag\"],[\"_uetsid\",!1,\"marketing\",\"Microsoft Ads (UET)\"],[\"_uetvid\",!1,\"marketing\",\"Microsoft Ads (UET)\"],[\"_clck\",!1,\"analytics\",\"Microsoft Clarity\"],[\"_clsk\",!1,\"analytics\",\"Microsoft Clarity\"],[\"_hj\",!0,\"analytics\",\"Hotjar\"],[\"__kla_id\",!1,\"marketing\",\"Klaviyo\"],[\"cto_bundle\",!1,\"marketing\",\"Criteo\"],[\"_rdt_uuid\",!1,\"marketing\",\"Reddit Pixel\"],[\"_ym_\",!0,\"analytics\",\"Yandex Metrica\"],[\"_pk_\",!0,\"analytics\",\"Matomo\"],[\"ajs_anonymous_id\",!1,\"marketing\",\"Segment\"]],w=de(location.hostname),x={},T=0,S=[],A=/^(|text\\/javascript|application\\/javascript|module|text\\/ecmascript|application\\/ecmascript)$/i,_=[];!function(){if(o)for(var e=t.getElementsByTagName(\"script\"),r=0;r<e.length&&e[r]!==o;r++)A.test(e[r].getAttribute(\"type\")||\"\")&&_.push(be(e[r]))}();var C={firstScript:!!o&&0===_.length&&!o.async&&!o.defer,foundOwnTag:!!o,async:!(!o||!o.async&&!o.defer),ranBefore:_},E=we();e.dataLayer=e.dataLayer||[],\"function\"!=typeof e.gtag&&(e.gtag=Te),Te(\"consent\",\"default\",{ad_storage:\"denied\",analytics_storage:\"denied\",ad_user_data:\"denied\",ad_personalization:\"denied\",wait_for_update:500}),Te(\"set\",\"ads_data_redaction\",!0),E&&Se(E);var L=Document.prototype.createElement,M=Element.prototype.setAttribute,P=Element.prototype.removeAttribute,I=Ae(_e(\"HTMLScriptElement\"),\"src\"),O=Ae(_e(\"HTMLIFrameElement\"),\"src\"),R=Ae(_e(\"HTMLIFrameElement\"),\"contentWindow\"),D=Ae(_e(\"HTMLLinkElement\"),\"href\"),N=Ae(_e(\"Node\"),\"textContent\"),G=Ae(_e(\"Attr\"),\"value\"),j=Ae(_e(\"Document\"),\"cookie\")||Ae(_e(\"HTMLDocument\"),\"cookie\"),H=[],B=[],F=/url\\(\\s*(['\"]?)([^'\")\\s]+)\\1\\s*\\)/gi,q=/@import\\s+(['\"])([^'\"]+)\\1/gi,K=/<([a-z][a-z0-9-]*)\\b([^>]*)>/gi,z=/(\\s)([a-z][a-z:-]*)(\\s*=\\s*)(\"([^\"]*)\"|'([^']*)'|([^\\s\"'>]+))/gi,U=\"script,iframe,link,img,source,video,audio,track,a[ping],area[ping],a[data-gdrock-ping],style,image,use,feImage,[style*='url(']\",W='script[type=\"text/plain\"], iframe[data-gdrock-src], link[data-gdrock-href], a[data-gdrock-ping]',Y=0,V={WebSocket:function(e,t){return ft(e,{url:t,readyState:3,protocol:\"\",extensions:\"\",bufferedAmount:0,binaryType:\"blob\",CONNECTING:0,OPEN:1,CLOSING:2,CLOSED:3,send:ve,close:ve},[\"error\",\"close\"])},EventSource:function(e,t){return ft(e,{url:t,readyState:2,withCredentials:!1,CONNECTING:0,OPEN:1,CLOSED:2,close:ve},[\"error\"])},Worker:function(e){return ft(e,{postMessage:ve,terminate:ve},[\"error\"])},SharedWorker:function(e){return ft(e,{port:ft(e,{postMessage:ve,start:ve,close:ve},[])},[\"error\"])}};ct(e);var J={present:!1,apiFound:!1,loadRequested:!1,updates:0,lastSent:null,error:null,caughtAt:null,beforeChoice:null};vt(e,\"Shopify\",bt),e.Shopify&&bt(e.Shopify),\"loading\"===t.readyState?t.addEventListener(\"DOMContentLoaded\",wt):wt();var $=null;try{$=JSON.parse(sessionStorage.getItem(\"gdrock_withdrawal\")),sessionStorage.removeItem(\"gdrock_withdrawal\")}catch(e){}var X=[],Q=!1;e.addEventListener(\"gdrock:consent\",function(e){if(!Q){var t=E,r=e&&e.detail||we()||{};E={analytics:!!r.analytics,marketing:!!r.marketing,accepted:!!r.analytics||!!r.marketing,timestamp:r.timestamp||(new Date).toISOString()};try{localStorage.setItem(s,JSON.stringify(E))}catch(e){}At(t)}});var Z=0;Lt.get=St,Lt.set=function(t){var r=E,n={analytics:\"analytics\"in(t=t||{})?!!t.analytics:!(!E||!E.analytics),marketing:\"marketing\"in t?!!t.marketing:!(!E||!E.marketing)};n.accepted=n.analytics||n.marketing,n.timestamp=(new Date).toISOString(),E=n;try{localStorage.setItem(s,JSON.stringify(n))}catch(e){}At(r),Q=!0;try{e.dispatchEvent(new CustomEvent(\"gdrock:consent\",{detail:n}))}catch(e){}return Q=!1,St()},Lt.onChange=function(e){return\"function\"==typeof e&&X.push(e),function(){var t=X.indexOf(e);-1!==t&&X.splice(t,1)}};var ee=\"object\"==typeof e.GDRock&&e.GDRock||{};ee.consent=Lt,ee.diagnostics=Ct,ee.installFix=function(){var e,t=Ct(),r=[],n='<script src=\"'+(o&&o.getAttribute(\"src\")||\"https://cdn.gdrock.com/gdrock.js\")+'\" data-site-id=\"'+(i||\"YOUR_SITE_ID\")+'\"><\\/script>',a=\"{%- comment -%} GDRock: keep this the first line inside <head>, above {{ content_for_header }} {%- endcomment -%}\\n\"+n;function c(e){r.push(e)}function s(e){return t.install.tag?t.install.tag.replace(/<script\\b/i,\"<script \"+e):null}if(!t.install.firstScript){var l=[];for(e=0;e<t.install.ranBefore.length;e++)l.push(t.install.ranBefore[e].src||\"inline: \"+t.install.ranBefore[e].inline);c({id:\"install-first\",title:\"Make GDRock the first script in <head>\",why:t.install.foundOwnTag?t.install.asyncOrDefer?\"The tag is async/defer, so other scripts can run before it.\":\"These ran before GDRock and were not blocked: \"+l.join(\" | \"):\"GDRock was loaded by another script, so it cannot tell what ran before it.\",where:J.present?\"Shopify: layout/theme.liquid\":\"the <head> of every page\",steps:J.present?[\"Online Store > Themes > (current theme) > Edit code.\",\"Add a snippet named gdrock-blocker (snippets/gdrock-blocker.liquid) containing the code under Replace.\",\"In layout/theme.liquid, put {% render 'gdrock-blocker' %} on the first line after <head>, above {{ content_for_header }}.\",\"Delete the old GDRock tag (under Find) wherever it is now.\"]:[\"Delete the tag under Find.\",\"Paste the tag under Replace as the first line after <head>, before any other <script>.\"],find:t.install.tag,replace:J.present?a:n})}var u=null;for(e=0;e<t.fromHtml.length;e++){var g,f=t.fromHtml[e],p=f.url;if(J.present&&\"script\"===f.type&&(g=/static\\.klaviyo\\.com\\/onsite\\/js\\/([A-Za-z0-9]+)/.exec(p)||/company_id=([A-Za-z0-9]+)/.exec(p))&&/klaviyo/i.test(p)){if(u)continue;c({id:\"shopify-klaviyo\",title:\"Klaviyo: switch off the app embed and paste a tagged snippet\",why:\"Shopify writes Klaviyo's app embed straight into the HTML, so the browser fetches klaviyo.js before any script can stop it and Klaviyo sees the visitor's IP.\",where:\"Shopify: theme editor + layout/theme.liquid\",steps:[\"Online Store > Themes > Customize > App embeds: switch off Klaviyo (Onsite Javascript) and save.\",\"In layout/theme.liquid, paste the code under Replace on the line after {% render 'gdrock-blocker' %}.\",\"Klaviyo sign-up forms then appear after the visitor allows marketing.\"],find:'<script async src=\"'+p+'\"><\\/script>  (written by the Klaviyo app embed)',replace:'<script type=\"text/plain\" data-gdrock-category=\"marketing\" data-gdrock-src=\"https://static.klaviyo.com/onsite/js/'+(u=g[1])+\"/klaviyo.js?company_id=\"+u+'\"><\\/script>'})}else\"img\"===f.type?c({id:\"delete-pixel\",title:\"Delete the \"+f.vendor+\" image pixel from the HTML\",why:\"An <img> pixel written in the HTML is requested as the page parses. Its library sends its own hit after consent.\",where:\"page source\",steps:[\"Find the <img> tag with this address and delete it (including a <noscript> wrapper around it).\"],find:'src=\"'+p+'\"',replace:\"(delete the whole <img> tag)\"}):c({id:\"tag-html\",title:\"Tag the \"+f.vendor+\" \"+f.type+\" written in the HTML\",why:\"The browser's preloader fetches it before any script runs, so the vendor sees the visitor's IP even though GDRock stops it from running.\",where:\"page source\",steps:[\"Replace the src attribute as shown. In the source, & in the address may be written as &amp;.\"],find:(\"link\"===f.type?'href=\"':'src=\"')+p+'\"',replace:(\"script\"===f.type?'type=\"text/plain\" ':\"\")+'data-gdrock-category=\"'+f.category+'\" '+(\"link\"===f.type?'data-gdrock-href=\"':'data-gdrock-src=\"')+p+'\"'})}for(e=0;e<t.untaggedInline.length;e++){var h=t.untaggedInline[e];c({id:\"tag-inline\",title:\"Tag the inline \"+h.vendor+\" code\",why:\"Inline code runs the moment it is parsed; only its type attribute can make it wait.\",where:\"page source: the <script> that starts with \"+JSON.stringify(h.starts),steps:[\"Replace that script's opening tag as shown. Keep its content unchanged.\"],find:h.openTag,replace:h.openTag.replace(/\\s+type=\"[^\"]*\"/i,\"\").replace(/^<script/i,'<script type=\"text/plain\" data-gdrock-category=\"'+Et(h.vendor)+'\"')})}var m={};for(e=0;e<t.fonts.length;e++)!m[t.fonts[e].provider]&&/\\/css2?\\?|typekit\\.net\\/[a-z0-9]+\\.css/i.test(t.fonts[e].url)&&(m[t.fonts[e].provider]=1,c({id:\"self-host-fonts\",title:\"Self-host the \"+t.fonts[e].provider,why:\"Every visitor's browser asks \"+t.fonts[e].provider.split(\" \")[0]+\" for the font files, which sends it their IP address (LG M\\xfcnchen I, 3 O 17493/20).\",where:\"page source (or the theme's font settings)\",steps:[\"Download the font files (google-webfonts-helper does this for Google Fonts), put them on your own server, and load them with @font-face.\",\"Then replace the stylesheet link under Find with your own stylesheet.\"],find:'href=\"'+t.fonts[e].url+'\"',replace:'href=\"/fonts/fonts.css\"  (your self-hosted @font-face rules)'}));var y=!1;for(e=0;e<t.embeds.length;e++)\"loaded\"!==t.embeds[e].state||t.consent.marketing||(y=!0);if(y&&!d&&t.install.tag&&c({id:\"embeds-click\",title:\"Make video and map embeds click-to-load\",why:\"They load (and set cookies) before consent.\",where:\"the GDRock script tag\",steps:[\"Add the attribute shown.\"],find:t.install.tag,replace:s('data-gdrock-embeds=\"click\"')}),t.shopify.present&&c({id:\"shopify-customer-privacy\",title:\"Shopify: require consent before app pixels run\",why:t.shopify.trackableBeforeChoice?\"Before any choice, Shopify reported \"+t.shopify.trackableBeforeChoice.signals.join(\", \")+(t.shopify.trackableBeforeChoice.region?\" for region \"+t.shopify.trackableBeforeChoice.region:\"\")+\", so app pixels may act on Shopify's own default.\":\"App pixels follow Shopify's regional default until GDRock's signal arrives.\",where:\"Shopify admin\",steps:[\"Settings > Customer privacy.\",'Turn on consent collection (\"require consent\") for the regions you sell to.',\"Save, then reload this page and run GDRock.diagnostics() again.\"]}),t.unknownThirdParty.length){var k=[];for(e=0;e<t.unknownThirdParty.length&&e<12;e++)k.push(t.unknownThirdParty[e].host);c({id:\"unknown-hosts\",title:\"Review \"+t.unknownThirdParty.length+\" third-party host(s) GDRock doesn't know\",why:\"GDRock blocks by list. These hosts were contacted and are not on it: \"+k.join(\", \")+\".\",where:\"the GDRock script tag\",steps:[\"Look each host up. Tell GDRock about any tracker so it joins the list.\",\"Optional: turn on strict mode to drop beacons to unlisted hosts until marketing consent. List the hosts the site needs (payments, reviews, chat) in data-gdrock-allow.\"],find:t.install.tag,replace:s('data-gdrock-strict=\"true\" data-gdrock-allow=\"(hosts your site needs, space-separated)\"')})}var v=[\"GDRock install check: \"+(r.length?r.length+\" fix(es)\":\"nothing to fix\")+\" on \"+location.hostname];for(e=0;e<r.length;e++){var b=r[e];v.push(\"\",e+1+\". \"+b.title,\"   Why: \"+b.why,\"   Where: \"+b.where);for(var w=0;b.steps&&w<b.steps.length;w++)v.push(\"   - \"+b.steps[w]);b.find&&v.push(\"   Find:    \"+b.find),b.replace&&v.push(\"   Replace: \"+b.replace)}return{fixes:r,text:v.join(\"\\n\")}},ee.blocker={version:r,add:function(e,t){h.push([String(e).toLowerCase(),\"analytics\"===t?\"analytics\":\"marketing\",!1,\"custom rule\"])},held:function(){for(var e=[],t=0;t<H.length;t++)e.push({kind:H[t].kind,src:H[t].src,category:H[t].category,inline:null==H[t].src});return e}};var te={consent:1,diagnostics:1,installFix:1,blocker:1};try{Object.defineProperty(e,\"GDRock\",{configurable:!0,get:function(){return ee},set:function(e){if(e&&\"object\"==typeof e)for(var t in e)te[t]||(ee[t]=e[t])}})}catch(t){e.GDRock=ee}}function re(e){return o?o.getAttribute(e):null}function ne(e){return null==e?\"\":\"string\"==typeof e?e:e.url?String(e.url):String(e)}function ae(e){for(var t=0;t<h.length;t++)if(-1!==e.indexOf(h[t][0]))return h[t];return null}function oe(e){var t=ne(e);if(!t)return null;var r,n=t.toLowerCase(),a=ae(n);if(a)return l&&a[2]||xe(a[1])?null:{category:a[1],vendor:a[3]};if(-1!==n.indexOf(\"collect\")){var o=t.indexOf(\"?\"),i=(-1===o?t:t.slice(0,o)).replace(/^[a-z][a-z0-9+.\\-]*:\\/\\/[^\\/]*/i,\"\"),c=-1===o?\"\":t.slice(o+1);for(r=0;r<m.length;r++){var s=m[r];if(new RegExp(s[0],\"i\").test(i)&&new RegExp(s[1],\"i\").test(c))return l&&s[3]||xe(s[2])?null:{category:s[2],vendor:s[4]}}}return null}function ie(e){var t=ae(ne(e).toLowerCase());return t?{category:t[1],vendor:t[3]}:null}function ce(e,t){var r=ne(t).toLowerCase();if(!r)return null;for(var n=0;n<e.length;n++)for(var a=e[n][e[n].length-1],o=0;o<a.length;o++)if(-1!==r.indexOf(a[o]))return e[n];return null}function se(e){for(var t=String(e||\"\").split(\",\"),r=0;r<t.length;r++){var n=oe(t[r].replace(/^\\s+/,\"\").split(/\\s+/)[0]);if(n)return n}return null}function le(e){try{return new URL(ne(e),t.baseURI).hostname.toLowerCase()}catch(e){return\"\"}}function de(e){if(/^[\\d.]+$|:/.test(e))return e;var t=String(e||\"\").split(\".\"),r=t.length>2&&2===t[t.length-1].length&&/^(co|com|org|net|ac|gov|or|ne|gv|ltd|plc)$/.test(t[t.length-2])?3:2;return t.slice(-r).join(\".\")}function ue(e){return!!e&&de(e)!==w}function ge(e){for(var t=0;t<p.length;t++)if(e===p[t]||e.slice(-p[t].length-1)===\".\"+p[t])return!0;return!1}function fe(e){return oe(e)||function(e){if(!g||xe(\"marketing\"))return null;var t=le(e);return!ue(t)||ge(t)?null:{category:\"marketing\",vendor:\"unlisted host \"+t,strict:!0}}(e)}function pe(e,t){if((e=ne(e))&&!/^(data|blob|about|javascript|mailto|tel):/i.test(e)){var r=le(e);if(ue(r)){var n=x[r];if(!n){if(T>=150)return;T++;var a=e.toLowerCase(),o=ae(a),i=ce(y,a)||ce(k,a);n=x[r]={host:r,count:0,via:[],known:o?o[3]:i?i[0]:ge(r)?\"allowed\":null,dropped:0}}n.count++,-1===n.via.indexOf(t)&&n.via.push(t)}}}function he(e,t,r,a,o){var i={type:e,url:ne(t).slice(0,300),category:r.category,vendor:r.vendor,action:a,via:o||\"js\",ms:(new Date).getTime()-n};if(S.length<500&&S.push(i),r.strict){pe(t,e);var c=x[le(t)];c&&c.dropped++}return i}function me(e,r){try{var n;\"function\"==typeof Event?n=new Event(r):(n=t.createEvent(\"Event\")).initEvent(r,!1,!1),e.dispatchEvent(n)}catch(e){}}function ye(e){setTimeout(e,0)}function ke(t){e.Promise?Promise.resolve().then(t):ye(t)}function ve(){}function be(e){var t=e.getAttribute(\"src\"),r={src:t||null,inline:t?null:String(e.text||\"\").replace(/\\s+/g,\" \").slice(0,100),tracker:null},n=t?ie(t):null;return n&&(r.tracker=n.vendor),r}function we(){try{return JSON.parse(localStorage.getItem(s))}catch(e){return null}}function xe(e){return\"necessary\"===e||!(!E||!E[e])}function Te(){e.dataLayer.push(arguments)}function Se(e){Te(\"consent\",\"update\",{analytics_storage:e.analytics?\"granted\":\"denied\",ad_storage:e.marketing?\"granted\":\"denied\",ad_user_data:e.marketing?\"granted\":\"denied\",ad_personalization:e.marketing?\"granted\":\"denied\"}),Te(\"set\",\"ads_data_redaction\",!e.marketing)}function Ae(e,t){try{return e&&Object.getOwnPropertyDescriptor(e,t)}catch(e){return null}}function _e(t){return e[t]&&e[t].prototype}function Ce(e,t,r,n){e&&e.set?e.set.call(t,n):M.call(t,r,n)}function Ee(e,r){return L.call(e.ownerDocument||t,r)}function Le(e){for(var t=0;t<b.length;t++){var r=b[t];if(r[1]?0===e.indexOf(r[0]):e===r[0])return{category:r[2],vendor:r[3]}}return null}function Me(e){return String(e).split(\";\")[0].split(\"=\")[0].replace(/^\\s+|\\s+$/g,\"\")}function Pe(e,t,r,n){M.call(e,\"data-gdrock-held\",\"1\"),t&&M.call(e,n||\"data-gdrock-src\",t),M.call(e,\"data-gdrock-category\",r)}function Ie(e,t,r,n){M.call(e,\"type\",\"text/plain\"),Pe(e,t,r.category),H.push({kind:\"script\",el:e,src:t||null,text:null,category:r.category,entry:he(\"script\",t,r,\"held\",n)})}function Oe(e,t,r,n){Pe(e,t,r.category),H.push({kind:\"iframe\",el:e,src:t,category:r.category,entry:he(\"iframe\",t,r,\"held\",n)})}function Re(e,t,r,n){Pe(e,t,r.category,\"data-gdrock-href\"),H.push({kind:\"link\",el:e,src:t,category:r.category,entry:he(\"link\",t,r,\"held\",n)})}function De(e,t,r,n,a){he(t,r,n,\"dropped\",a),M.call(e,\"data-gdrock-blocked-src\",ne(r).slice(0,300)),ye(function(){me(e,\"error\")})}function Ne(e){for(var t=[\"data-gdrock-held\",\"data-gdrock-src\",\"data-gdrock-href\",\"data-gdrock-category\",\"data-gdrock-embed\",\"data-gdrock-ping\"],r=0;r<t.length;r++)P.call(e,t[r])}function Ge(e){var t=e.el;if(e.entry&&(e.entry.action=\"embed\"===e.kind&&e.clicked?\"loaded by click\":\"released\"),\"script\"===e.kind)if(t.parentNode){for(var r=Ee(t,\"script\"),n=0;n<t.attributes.length;n++){var a=t.attributes[n];\"type\"!==a.name&&\"src\"!==a.name&&0!==a.name.indexOf(\"data-gdrock-\")&&M.call(r,a.name,a.value)}e.src?(r.async=t.hasAttribute(\"async\"),Ce(I,r,\"src\",e.src)):null!=e.text&&(r.text=e.text),t.parentNode.insertBefore(r,t),t.parentNode.removeChild(t)}else e.src&&(P.call(t,\"type\"),Ne(t),Ce(I,t,\"src\",e.src));else if(\"iframe\"===e.kind||\"embed\"===e.kind)Ne(t),M.call(t,\"data-gdrock-loaded\",\"1\"),e.placeholder&&e.placeholder.parentNode&&(e.placeholder.parentNode.insertBefore(t,e.placeholder),e.placeholder.parentNode.removeChild(e.placeholder)),Ce(O,t,\"src\",e.src);else if(\"link\"===e.kind)Ne(t),Ce(D,t,\"href\",e.src);else if(\"ping\"===e.kind){var o=t.getAttribute(\"ping\");Ne(t),M.call(t,\"ping\",(o?o+\" \":\"\")+e.src)}}function je(e){for(var t=String(e||\"\").split(/\\s+/),r=[],n=[],a=\"analytics\",o=0;o<t.length;o++)if(t[o]){var i=fe(t[o]);i?(n.push(t[o]),\"marketing\"===i.category&&(a=\"marketing\")):r.push(t[o])}return{keep:r.join(\" \"),blocked:n.join(\" \"),category:a}}function He(e,t,r){M.call(e,\"data-gdrock-ping\",t.blocked),M.call(e,\"data-gdrock-held\",\"1\"),H.push({kind:\"ping\",el:e,src:t.blocked,category:t.category,entry:he(\"ping\",t.blocked,{category:t.category,vendor:(ie(t.blocked)||{}).vendor||\"ping\"},\"held\",r)})}function Be(e){return d&&!xe(\"marketing\")?ce(k,e):null}function Fe(e,t,r,n){Pe(e,t,\"marketing\"),M.call(e,\"data-gdrock-embed\",r[0]);var a={kind:\"embed\",el:e,src:t,category:\"marketing\",provider:r,entry:he(\"embed\",t,{category:\"marketing\",vendor:r[0]},\"held\",n)};return H.push(a),e.parentNode&&qe(a),a}function qe(e){var t=e.el,r=e.provider;if(!e.placeholder&&t.parentNode){var n=t.getAttribute(\"width\"),a=t.getAttribute(\"height\"),o=Ee(t,\"div\");M.call(o,\"class\",\"gdrock-embed-placeholder\"),M.call(o,\"role\",\"region\"),M.call(o,\"aria-label\",r[0]+\" \"+r[2]+\" not loaded\"),o.style.cssText=\"display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;box-sizing:border-box;max-width:100%;padding:20px;border-radius:8px;background:#111418;color:#e8eaee;text-align:center;font:14px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;width:\"+(n?/^\\d+$/.test(n)?n+\"px\":n:\"100%\")+\";height:\"+(a?/^\\d+$/.test(a)?a+\"px\":a:\"315px\")+\";\";var i=Ee(t,\"p\");i.style.cssText=\"margin:0;max-width:44ch;\",i.textContent=\"This \"+r[2]+\" is hosted by \"+r[1]+\" (\"+r[0]+\"). Loading it lets \"+r[1]+\" set cookies and see your IP address.\";var c=Ee(t,\"button\");M.call(c,\"type\",\"button\"),c.style.cssText=\"border:0;border-radius:6px;padding:10px 18px;background:#fff;color:#111418;font:600 14px/1 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;cursor:pointer;\",c.textContent=\"Load \"+r[2],c.addEventListener(\"click\",function(){var t=H.indexOf(e);-1!==t&&H.splice(t,1),e.clicked=!0,Ge(e)}),o.appendChild(i),o.appendChild(c),t.parentNode.insertBefore(o,t),t.parentNode.removeChild(t),e.placeholder=o}}function Ke(e,t){if(!u||\"string\"!=typeof e||!/fonts\\.googleapis\\.com\\/css/i.test(e))return e;var r=e.replace(/fonts\\.googleapis\\.com/i,\"fonts.bunny.net\");return B.length<50&&B.push({from:e.slice(0,200),to:r.slice(0,200),via:t}),r}function ze(e,t){if(\"string\"!=typeof e||-1===e.indexOf(\"url(\")&&-1===e.indexOf(\"@import\"))return e;var r=t?\"js\":\"html\";return e.replace(F,function(e,n,a){var o=oe(a);if(o)return he(\"css\",a,o,\"dropped\",r),\"url(about:invalid)\";var i=t?Ke(a,\"css\"):a;return i===a?e:\"url(\"+n+i+n+\")\"}).replace(q,function(e,n,a){var o=oe(a);if(o)return he(\"css\",a,o,\"dropped\",r),\"@import url(about:invalid)\";var i=t?Ke(a,\"css\"):a;return i===a?e:\"@import \"+n+i+n})}function Ue(e){return\"string\"!=typeof e||-1!==e.indexOf(\"data-gdrock-boot\")?e:\"<script data-gdrock-boot>try{parent.__gdrockPatch(window)}catch(e){}<\\/script>\"+et(e,!0)}function We(e,t){var r=oe(t);return r?(Ie(e,ne(t),r,\"js\"),a):(pe(t,\"script\"),t)}function Ye(e,t){var r=oe(t);if(r)return Oe(e,ne(t),r,\"js\"),a;var n=Be(t);return n?(Fe(e,ne(t),n,\"js\"),a):(pe(t,\"iframe\"),t)}function Ve(e,t){var r=oe(t);if(r)return Re(e,ne(t),r,\"js\"),a;var n=Ke(t,\"link\");return pe(n,\"link\"),n}function Je(e,t){var r=oe(t);return r?(De(e,\"img\",t,r,\"js\"),a):(pe(t,\"img\"),t)}function $e(e,t){var r=se(t);return r?(De(e,\"img\",t,r,\"js\"),a):t}function Xe(e,t){var r=oe(t);return r?(De(e,\"media\",t,r,\"js\"),a):(pe(t,\"media\"),t)}function Qe(e,t){var r=je(t);return r.blocked?(He(e,r,\"js\"),r.keep):t}function Ze(e,t,r){var n=e.nodeName;if(\"style\"===t)return ze(r,!0);if(\"src\"===t){if(\"SCRIPT\"===n)return We(e,r);if(\"IFRAME\"===n)return Ye(e,r);if(\"IMG\"===n||\"SOURCE\"===n)return Je(e,r);if(\"VIDEO\"===n||\"AUDIO\"===n||\"TRACK\"===n)return Xe(e,r)}else if(\"srcset\"===t){if(\"IMG\"===n||\"SOURCE\"===n)return $e(e,r)}else if(\"href\"===t){if(\"LINK\"===n)return Ve(e,r);if(\"http://www.w3.org/2000/svg\"===e.namespaceURI&&/^(image|script|use|feImage)$/.test(e.localName))return Je(e,r)}else if(\"poster\"===t){if(\"VIDEO\"===n)return Xe(e,r)}else if(\"ping\"===t){if(\"A\"===n||\"AREA\"===n)return Qe(e,r)}else if(\"srcdoc\"===t&&\"IFRAME\"===n)return Ue(r);return r}function et(e,t){return\"string\"==typeof e&&-1!==e.indexOf(\"<\")&&(ae(r=e.toLowerCase())||-1!==r.indexOf(\"collect\")||d&&ce(k,r)||u&&-1!==r.indexOf(\"fonts.googleapis.com\")||g&&-1!==r.indexOf(\"ping\"))?(e=e.replace(/(<style\\b[^>]*>)([\\s\\S]*?)(<\\/style\\s*>)/gi,function(e,t,r,n){return t+ze(r,!0)+n})).replace(K,function(e,r,n){var a=r.toLowerCase(),o=\"\",i=!1;if(\"script\"===a&&!t)return e;var c=n.replace(z,function(e,r,n,c,s,l,d,u){var g=null!=l?l:null!=d?d:u,f=null!=d?\"'\":'\"',p=function(e,t,r,n){var a;if(\"style\"===t){var o=ze(r,!0);return o===r?null:{name:\"style\",value:o}}if(\"src\"===t||\"srcset\"===t||\"poster\"===t)return\"script\"===e?\"src\"===t&&n&&(a=oe(r))?{name:\"data-gdrock-src\",value:r,extra:' type=\"text/plain\" data-gdrock-category=\"'+a.category+'\"'}:null:\"iframe\"===e&&\"src\"===t?(a=oe(r))?{name:\"data-gdrock-src\",value:r,extra:' data-gdrock-category=\"'+a.category+'\"'}:Be(r)?{name:\"data-gdrock-src\",value:r,extra:' data-gdrock-category=\"marketing\"'}:null:\"img\"!==e&&\"source\"!==e&&\"video\"!==e&&\"audio\"!==e&&\"track\"!==e||!(a=\"srcset\"===t?se(r):oe(r))?null:(he(\"img\"===e||\"source\"===e?\"img\":\"media\",r,a,\"dropped\",\"html-string\"),{name:\"data-gdrock-blocked-src\",value:r});if(\"href\"===t&&\"link\"===e){if(a=oe(r))return{name:\"data-gdrock-href\",value:r,extra:' data-gdrock-category=\"'+a.category+'\"'};var i=Ke(r,\"html-string\");return i===r?null:{name:\"href\",value:i}}if(\"ping\"===t&&(\"a\"===e||\"area\"===e)){var c=je(r);return c.blocked?{name:\"ping\",value:c.keep,extra:' data-gdrock-ping=\"'+c.blocked.replace(/\"/g,\"&quot;\")+'\" data-gdrock-category=\"'+c.category+'\"'}:null}return null}(a,n.toLowerCase(),g,t);return p?(i=!0,p.extra&&(o+=p.extra),r+p.name+\"=\"+f+String(p.value).replace(\"'\"===f?/'/g:/\"/g,\"'\"===f?\"&#39;\":\"&quot;\")+f):e});return i?\"<\"+r+o+c+\">\":e}):e;var r}function tt(e,t,r){if(!e.getAttribute(\"data-gdrock-blocked-src\"))for(var n=0;n<t.length;n++){var a=e.getAttribute(t[n]);if(a){var o=\"srcset\"===t[n]?se(a):oe(a);if(o){for(var i=0;i<t.length;i++)P.call(e,t[i]);return void De(e,r,a,o,\"html\")}}}}function rt(e){var t=N.get.call(e),r=ze(t,!1);r!==t&&N.set.call(e,r)}function nt(e){switch(e.nodeName){case\"SCRIPT\":!function(e){if(!e.getAttribute(\"data-gdrock-held\"))if(\"text/plain\"!==(e.getAttribute(\"type\")||\"\").toLowerCase()){var t=e.getAttribute(\"src\"),r=oe(t);if(r){M.call(e,\"type\",\"text/plain\");for(var n=Ee(e,\"script\"),a=0;a<e.attributes.length;a++){var o=e.attributes[a];\"src\"!==o.name&&\"type\"!==o.name&&M.call(n,o.name,o.value)}Ie(n,t,r,\"html\"),e.parentNode&&(e.parentNode.insertBefore(n,e),e.parentNode.removeChild(e))}else t&&pe(t,\"script\")}else!function(e){if(!e.getAttribute(\"data-gdrock-held\")){var t=e.getAttribute(\"data-gdrock-category\");if(t||e.getAttribute(\"data-gdrock-src\")){t=\"analytics\"===t?\"analytics\":\"marketing\";var r=e.getAttribute(\"data-gdrock-src\")||e.getAttribute(\"src\")||null;M.call(e,\"data-gdrock-held\",\"1\"),M.call(e,\"data-gdrock-category\",t);var n={category:t,vendor:r?(ie(r)||{}).vendor||\"tagged script\":\"tagged inline code\"},a={kind:\"script\",el:e,src:r,text:r?null:e.text,category:t,entry:he(\"script\",r||\"(inline)\",n,\"held\",\"tagged\")};xe(t)?Ge(a):H.push(a)}}}(e)}(e);break;case\"IFRAME\":!function(e){var t=e.getAttribute(\"srcdoc\");if(null!=t&&-1===t.indexOf(\"data-gdrock-boot\")&&M.call(e,\"srcdoc\",Ue(t)),it(e),!e.getAttribute(\"data-gdrock-loaded\"))if(e.getAttribute(\"data-gdrock-held\"))for(var r=0;r<H.length;r++)H[r].el===e&&\"embed\"===H[r].kind&&qe(H[r]);else{var n=e.getAttribute(\"data-gdrock-src\");if(n){var a=\"analytics\"===e.getAttribute(\"data-gdrock-category\")?\"analytics\":\"marketing\",o=ce(k,n);return xe(a)?(Ce(O,e,\"src\",n),void Ne(e)):d&&o&&!ie(n)?void Fe(e,n,o,\"html\"):void Oe(e,n,{category:a,vendor:(ie(n)||{}).vendor||\"tagged iframe\"},\"html\")}var i=e.getAttribute(\"src\");if(i){var c=oe(i);if(c)return P.call(e,\"src\"),void Oe(e,i,c,\"html\");var s=Be(i);if(s)return P.call(e,\"src\"),void Fe(e,i,s,\"html\");pe(i,\"iframe\")}}}(e);break;case\"LINK\":!function(e){if(!e.getAttribute(\"data-gdrock-held\")){var t=e.getAttribute(\"data-gdrock-href\");if(t){var r=\"analytics\"===e.getAttribute(\"data-gdrock-category\")?\"analytics\":\"marketing\";xe(r)?(Ce(D,e,\"href\",t),Ne(e)):Re(e,t,{category:r,vendor:(ie(t)||{}).vendor||\"tagged link\"},\"html\")}else{var n=e.getAttribute(\"href\"),a=oe(n);if(a)return P.call(e,\"href\"),void Re(e,n,a,\"html\");n&&pe(n,\"link\")}}}(e);break;case\"IMG\":case\"SOURCE\":tt(e,[\"src\",\"srcset\"],\"img\");break;case\"VIDEO\":tt(e,[\"src\",\"poster\"],\"media\");break;case\"AUDIO\":case\"TRACK\":tt(e,[\"src\"],\"media\");break;case\"A\":case\"AREA\":!function(e){var t=e.getAttribute(\"data-gdrock-ping\");if(t&&!e.getAttribute(\"data-gdrock-held\")){var r=\"analytics\"===e.getAttribute(\"data-gdrock-category\")?\"analytics\":\"marketing\";xe(r)?Ge({kind:\"ping\",el:e,src:t}):He(e,{blocked:t,category:r},\"html\")}var n=e.getAttribute(\"ping\");if(n){var a=je(n);a.blocked&&(M.call(e,\"ping\",a.keep),He(e,a,\"html\"))}}(e);break;case\"STYLE\":rt(e);break;case\"image\":case\"use\":case\"feImage\":tt(e,[\"href\",\"xlink:href\"],\"img\")}var t=e.getAttribute(\"style\");if(t&&-1!==t.indexOf(\"url(\")){var r=ze(t,!1);r!==t&&M.call(e,\"style\",r)}}function at(e){if(e&&(1===e.nodeType||11===e.nodeType)&&(1===e.nodeType&&nt(e),e.firstElementChild&&e.querySelectorAll))for(var t=e.querySelectorAll(U),r=0;r<t.length;r++)nt(t[r])}function ot(e){for(var t=e.querySelectorAll(W),r=0;r<t.length;r++)nt(t[r])}function it(e){try{var t=R?R.get.call(e):e.contentWindow;t&&ct(t)}catch(e){}if(!e.__gdrockLoadHook){e.__gdrockLoadHook=!0;try{e.addEventListener(\"load\",function(){it(e)})}catch(e){}}}function ct(t){var r;try{if(!(r=t.document)||!t.Element)return}catch(e){return}var n=t.Element.prototype;if(!n.__gdrockPatched){try{Object.defineProperty(n,\"__gdrockPatched\",{value:!0})}catch(e){return}try{t.__gdrockPatch=ct}catch(e){}t!==e&&Y++,function(e){function t(t){return e[t]&&e[t].prototype}var r,n=t(\"Document\"),o=e.Element.prototype,i=t(\"Node\");st(t(\"HTMLScriptElement\"),\"src\",\"data-gdrock-src\",We),st(t(\"HTMLIFrameElement\"),\"src\",\"data-gdrock-src\",Ye),st(t(\"HTMLIFrameElement\"),\"srcdoc\",null,function(e,t){return Ue(t)}),st(t(\"HTMLLinkElement\"),\"href\",\"data-gdrock-href\",Ve),st(t(\"HTMLImageElement\"),\"src\",null,Je),st(t(\"HTMLImageElement\"),\"srcset\",null,$e),st(t(\"HTMLSourceElement\"),\"src\",null,Je),st(t(\"HTMLSourceElement\"),\"srcset\",null,$e),st(t(\"HTMLMediaElement\"),\"src\",null,Xe),st(t(\"HTMLVideoElement\"),\"poster\",null,Xe),st(t(\"HTMLTrackElement\"),\"src\",null,Xe),st(t(\"HTMLAnchorElement\"),\"ping\",null,Qe),st(t(\"HTMLAreaElement\"),\"ping\",null,Qe),lt(t(\"HTMLIFrameElement\"),\"contentWindow\",function(e){e&&ct(e)}),lt(t(\"HTMLIFrameElement\"),\"contentDocument\",function(e){e&&e.defaultView&&ct(e.defaultView)});var c=o.setAttribute,s=o.setAttributeNS;o.setAttribute=function(e,t){var r=Ze(this,String(e).toLowerCase(),t);if(r!==a)return c.call(this,e,r)},s&&(o.setAttributeNS=function(e,t,r){var n=String(t),o=Ze(this,n.slice(n.indexOf(\":\")+1).toLowerCase(),r);if(o!==a)return s.call(this,e,t,o)});var l=[\"setAttributeNode\",\"setAttributeNodeNS\"];for(r=0;r<l.length;r++)(function(e){\"function\"==typeof e&&(o[l[r]]=function(t){if(t&&t.name){var r=Ze(this,String(t.name).toLowerCase().replace(/^.*:/,\"\"),t.value);if(r===a)return null;r!==t.value&&G&&G.set.call(t,r)}return e.apply(this,arguments)})})(o[l[r]]);st(t(\"Attr\"),\"value\",null,function(e,t){var r=e.ownerElement;return r?Ze(r,String(e.name).toLowerCase().replace(/^.*:/,\"\"),t):t});var d=function(e,t){return\"STYLE\"===e.nodeName?ze(t,!0):\"SCRIPT\"===e.nodeName||\"TEXTAREA\"===e.nodeName?t:et(t,!1)};st(o,\"innerHTML\",null,d),st(o,\"outerHTML\",null,d),st(t(\"ShadowRoot\"),\"innerHTML\",null,d),dt(o,\"insertAdjacentHTML\",1,function(e){return et(e,!1)}),dt(o,\"setHTMLUnsafe\",0,function(e){return et(e,!1)}),dt(t(\"ShadowRoot\"),\"setHTMLUnsafe\",0,function(e){return et(e,!1)}),dt(t(\"Range\"),\"createContextualFragment\",0,function(e){return et(e,!0)}),dt(n,\"write\",-1,function(e){return et(e,!0)}),dt(n,\"writeln\",-1,function(e){return et(e,!0)});var u=function(e,t){return\"STYLE\"===e.nodeName?ze(t,!0):t};st(i,\"textContent\",null,u),st(t(\"HTMLElement\"),\"innerText\",null,u);var g=t(\"CSSStyleDeclaration\");if(g){dt(g,\"setProperty\",1,function(e){return ze(e,!0)});for(var f=function(e,t){return ze(t,!0)},p=[\"cssText\",\"background\",\"backgroundImage\",\"background-image\",\"borderImage\",\"border-image\",\"borderImageSource\",\"border-image-source\",\"listStyle\",\"list-style\",\"listStyleImage\",\"list-style-image\",\"content\",\"cursor\",\"mask\",\"maskImage\",\"mask-image\",\"webkitMaskImage\",\"WebkitMaskImage\",\"-webkit-mask-image\"],h=[g,t(\"CSS2Properties\")],m=0;m<h.length;m++)for(r=0;r<p.length;r++)st(h[m],p[r],null,f)}var y=t(\"CSSStyleSheet\");dt(y,\"insertRule\",0,function(e){return ze(e,!0)}),dt(y,\"replace\",0,function(e){return ze(e,!0)}),dt(y,\"replaceSync\",0,function(e){return ze(e,!0)});var k=[\"appendChild\",\"insertBefore\",\"replaceChild\"];for(r=0;r<k.length;r++)gt(i,k[r]);var v=[\"append\",\"prepend\",\"after\",\"before\",\"replaceWith\",\"insertAdjacentElement\"];for(r=0;r<v.length;r++)gt(o,v[r]);gt(t(\"DocumentFragment\"),\"append\"),gt(t(\"DocumentFragment\"),\"prepend\");var b=[\"importNode\",\"adoptNode\"];for(r=0;r<b.length;r++)(function(e){\"function\"==typeof e&&(n[b[r]]=function(){var t=e.apply(this,arguments);return t&&t.nodeType&&at(t),t})})(n&&n[b[r]]);st(Ae(n,\"cookie\")?n:t(\"HTMLDocument\"),\"cookie\",null,function(e,t){return r=t,n=\"document.cookie\",o=Me(r=String(r)),(i=o?Le(o):null)&&!xe(i.category)&&!function(e){if(/;\\s*max-age\\s*=\\s*(?:0|-)/i.test(e))return!0;var t=/;\\s*expires\\s*=\\s*([^;]+)/i.exec(e);return!!(t&&Date.parse(t[1])<(new Date).getTime())}(r)&&(he(\"cookie\",o,i,\"refused\",n),i)?a:t;var r,n,o,i});var w=t(\"CookieStore\");if(w&&\"function\"==typeof w.set){var x=w.set;w.set=function(t){var r=\"string\"==typeof t?t:t&&t.name||\"\",n=r?Le(String(r)):null;return n&&!xe(n.category)?(he(\"cookie\",r,n,\"refused\",\"cookieStore\"),e.Promise.resolve()):x.apply(this,arguments)}}if(\"function\"==typeof e.fetch){var T=e.fetch;e.fetch=function(t){var r=fe(t);if(r){he(\"fetch\",t,r,\"dropped\");try{return e.Promise.resolve(new e.Response(null,{status:204,statusText:\"No Content\"}))}catch(t){return new e.Promise(ve)}}return pe(t,\"fetch\"),T.apply(this,arguments)}}var S=t(\"XMLHttpRequest\");if(S){var A=S.open,_=S.send;S.open=function(e,t){var r=fe(t);return this.__gdrockBlocked=r?{url:ne(t),rule:r}:null,r||pe(t,\"xhr\"),A.apply(this,arguments)},S.send=function(){var e=this.__gdrockBlocked;if(e){var t=this;return he(\"xhr\",e.url,e.rule,\"dropped\"),void ye(function(){me(t,\"error\"),me(t,\"loadend\")})}return _.apply(this,arguments)}}var C=t(\"Navigator\");if(C&&\"function\"==typeof C.sendBeacon){var E=C.sendBeacon;C.sendBeacon=function(e){var t=fe(e);return t?(he(\"beacon\",e,t,\"dropped\"),!0):(pe(e,\"beacon\"),E.apply(this,arguments))}}pt(e,\"WebSocket\",\"websocket\",!0),pt(e,\"EventSource\",\"eventsource\",!0),pt(e,\"Worker\",\"worker\",!1),pt(e,\"SharedWorker\",\"worker\",!1);var L=function(e){if(!xe(\"analytics\")||!xe(\"marketing\"))for(var t=e.composedPath?e.composedPath():[e.target],r=0;r<t.length;r++){var n=t[r];if(n&&(\"A\"===n.nodeName||\"AREA\"===n.nodeName)&&n.getAttribute){var a=je(n.getAttribute(\"ping\"));return void(a.blocked&&(M.call(n,\"ping\",a.keep),He(n,a,\"click\")))}}};try{e.addEventListener(\"click\",L,!0),e.addEventListener(\"auxclick\",L,!0)}catch(e){}}(t)}!function(t,r){if(t&&!t.__gdrockObserved){try{t.__gdrockObserved=!0}catch(e){}var n=t.defaultView&&t.defaultView.MutationObserver||e.MutationObserver;n&&new n(function(e){for(var t=0;t<e.length;t++){var r=e[t],n=r.target;if(\"characterData\"!==r.type){n&&\"STYLE\"===n.nodeName&&r.addedNodes.length&&rt(n);for(var a=r.addedNodes,o=0;o<a.length;o++)at(a[o])}else n.parentNode&&\"STYLE\"===n.parentNode.nodeName&&rt(n.parentNode)}}).observe(t,{childList:!0,subtree:!0,characterData:!0}),r&&t.documentElement?at(t.documentElement):ot(t)}}(r,t!==e)}function st(e,t,r,n){var o=Ae(e,t);if(o&&o.set&&o.configurable)try{Object.defineProperty(e,t,{configurable:!0,enumerable:o.enumerable,get:function(){if(r&&this.getAttribute(\"data-gdrock-held\")){var e=this.getAttribute(r);if(null!=e)return e}return o.get.call(this)},set:function(e){var t=n(this,e);t!==a&&o.set.call(this,t)}})}catch(e){}}function lt(e,t,r){var n=Ae(e,t);if(n&&n.get&&n.configurable)try{Object.defineProperty(e,t,{configurable:!0,enumerable:n.enumerable,get:function(){var e=n.get.call(this);try{r(e)}catch(e){}return e}})}catch(e){}}function dt(e,t,r,n){var a=e&&e[t];\"function\"==typeof a&&(e[t]=function(){for(var e=Array.prototype.slice.call(arguments),t=0;t<e.length;t++)(r<0||t===r)&&(e[t]=n(e[t],this));return a.apply(this,e)})}function ut(e,t){if(\"IFRAME\"===e.nodeName)return(t=t||[]).push(e),t;if((1===e.nodeType||11===e.nodeType)&&e.firstChild&&e.querySelectorAll)for(var r=e.querySelectorAll(\"iframe\"),n=0;n<r.length;n++)(t=t||[]).push(r[n]);return t}function gt(e,t){var r=e&&e[t];\"function\"==typeof r&&(e[t]=function(){for(var e=null,t=9===this.nodeType?this:this.ownerDocument,n=0;n<arguments.length;n++){var a=arguments[n];a&&\"object\"==typeof a&&a.nodeType&&(a.ownerDocument&&a.ownerDocument!==t&&at(a),e=ut(a,e))}var o=r.apply(this,arguments);if(e)for(n=0;n<e.length;n++)!1!==e[n].isConnected&&it(e[n]);return o})}function ft(e,t,r){var n;try{n=new e.EventTarget}catch(t){n=e.document.createElement(\"span\")}for(var a in t)try{n[a]=t[a]}catch(e){}return ye(function(){for(var e=0;e<r.length;e++){me(n,r[e]);var t=n[\"on\"+r[e]];if(\"function\"==typeof t)try{t.call(n,{type:r[e],target:n})}catch(e){}}}),n}function pt(e,t,r,n){var a=e[t];if(\"function\"==typeof a){var o=function(o,i){var c=ne(o),s=n?fe(c):oe(c);return s?(he(r,c,s,\"dropped\"),V[t](e,c)):(pe(c,r),arguments.length>1?new a(o,i):new a(o))};o.prototype=a.prototype;for(var i=[\"CONNECTING\",\"OPEN\",\"CLOSING\",\"CLOSED\"],c=0;c<i.length;c++)i[c]in a&&(o[i[c]]=a[i[c]]);try{e[t]=o}catch(e){}}}function ht(e,t){try{return\"function\"==typeof e[t]?e[t]():null}catch(e){return null}}function mt(e){return{marketingAllowed:ht(e,\"marketingAllowed\"),analyticsAllowed:ht(e,\"analyticsProcessingAllowed\"),region:ht(e,\"getRegion\"),shouldShowBanner:ht(e,\"shouldShowBanner\")}}function yt(e){var t=e.customerPrivacy;if(!t||\"function\"!=typeof t.setTrackingConsent)return J.error=\"Shopify.customerPrivacy.setTrackingConsent not available\",!1;J.apiFound=!0,E||J.beforeChoice||(J.beforeChoice=mt(t));var r={analytics:xe(\"analytics\"),marketing:xe(\"marketing\"),preferences:xe(\"analytics\"),sale_of_data:xe(\"marketing\")},n=JSON.stringify(r);if(t===J.sentTo&&n===J.sentKey)return!0;J.sentTo=t,J.sentKey=n;try{t.setTrackingConsent(r,function(e){e&&e.error?J.error=String(e.error):(J.updates++,J.lastSent=r,J.error=null)})}catch(e){J.error=String(e&&e.message||e)}return!0}function kt(){var t=e.Shopify;if(t&&\"object\"==typeof t)if(J.present=!0,t.customerPrivacy&&\"function\"==typeof t.customerPrivacy.setTrackingConsent)yt(t);else if(\"function\"!=typeof t.loadFeatures)J.error=\"window.Shopify has no loadFeatures or customerPrivacy\";else{if(J.loadRequested)return;J.loadRequested=!0;try{t.loadFeatures([{name:\"consent-tracking-api\",version:\"0.1\"}],function(e){e?J.error=\"loadFeatures: \"+String(e&&e.message||e):yt(t)})}catch(e){J.error=String(e&&e.message||e)}}}function vt(e,t,r){var n=Ae(e,t);if(n&&(!n.configurable||n.get||n.set))return!1;var a=n?n.value:void 0;try{Object.defineProperty(e,t,{configurable:!0,enumerable:!0,get:function(){return a},set:function(e){a=e,r(e)}})}catch(e){return!1}return!0}function bt(e){if(e&&\"object\"==typeof e&&!e.__gdrockWatched){try{Object.defineProperty(e,\"__gdrockWatched\",{value:!0})}catch(e){}J.present=!0,J.caughtAt||(J.caughtAt=(new Date).getTime()-n),ke(kt),vt(e,\"loadFeatures\",function(){ke(kt)}),vt(e,\"customerPrivacy\",function(){ke(kt)})}}function wt(){ot(t),e.Shopify&&(bt(e.Shopify),J.apiFound||kt())}function xt(e){if(j){var r,n=location.hostname.split(\".\"),a=[\"\"],o=[\"/\"];for(r=0;r<n.length-1;r++)a.push(\"; domain=.\"+n.slice(r).join(\".\"));a.push(\"; domain=\"+location.hostname);var i=location.pathname.split(\"/\");for(r=2;r<=i.length;r++)o.push(i.slice(0,r).join(\"/\")||\"/\");for(r=0;r<a.length;r++)for(var c=0;c<o.length;c++)try{j.set.call(t,e+\"=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=\"+o[c]+a[r])}catch(e){}}}function Tt(e){for(var r=[],n=(j?String(j.get.call(t)||\"\"):\"\").split(\";\"),a=0;a<n.length;a++){var o=Me(n[a]),i=o?Le(o):null;i&&e[i.category]&&-1===r.indexOf(o)&&(xt(o),r.push(o))}return r}function St(){var e=E||{};return{necessary:!0,analytics:!!e.analytics,marketing:!!e.marketing,choiceMade:!!E,timestamp:e.timestamp||null}}function At(e){Se(E),function(){for(var e=[],t=0;t<H.length;t++)xe(H[t].category)?Ge(H[t]):e.push(H[t]);H=e}(),kt(),function(){for(var e=0;e<X.length;e++)try{X[e](St())}catch(e){}}(),e&&function(e){var t={},r=[];if(e.analytics&&!E.analytics&&(t.analytics=1,r.push(\"analytics\")),e.marketing&&!E.marketing&&(t.marketing=1,r.push(\"marketing\")),r.length){$={at:(new Date).toISOString(),categories:r,cookiesDeleted:Tt(t),reloaded:f};try{sessionStorage.setItem(\"gdrock_withdrawal\",JSON.stringify($))}catch(e){}f&&setTimeout(function(){location.reload()},150)}}(e)}function _t(e){for(var t=\"<script\",r=0;r<e.attributes.length;r++)t+=\" \"+e.attributes[r].name+(e.attributes[r].value?'=\"'+e.attributes[r].value+'\"':\"\");return t+\">\"}function Ct(){var n,a={analytics:[],marketing:[]},c={held:0,released:0,dropped:0,refused:0,loadedByClick:0},s=[];for(n=0;n<S.length;n++){var f=S[n];(a[f.category]||(a[f.category]=[])).push({type:f.type,vendor:f.vendor,url:f.url,action:f.action,via:f.via,ms:f.ms}),\"held\"===f.action?c.held++:\"released\"===f.action?c.released++:\"dropped\"===f.action?c.dropped++:\"refused\"===f.action?(c.refused++,-1===s.indexOf(f.url)&&s.push(f.url)):\"loaded by click\"===f.action&&c.loadedByClick++}var h=function(){var e,r,n=[],a=[];for(e=0;e<v.length;e++)try{a.push([new RegExp(v[e][0],\"i\"),v[e][1]])}catch(e){}var i=t.getElementsByTagName(\"script\");for(e=0;e<i.length;e++){var c=i[e];if(!(c===o||c.getAttribute(\"src\")||c.getAttribute(\"data-gdrock-held\")||c.getAttribute(\"data-gdrock-category\"))&&A.test(c.getAttribute(\"type\")||\"\")){var s=String(c.text||\"\");for(r=0;r<a.length;r++){var l=a[r][0].exec(s);if(l){n.push({vendor:a[r][1],snippet:s.slice(Math.max(0,l.index-40),l.index+80).replace(/\\s+/g,\" \"),openTag:_t(c),starts:s.replace(/^\\s+/,\"\").slice(0,60)});break}}}}return n}(),m=function(){var r,n=[],a=[],o={},i=t.querySelectorAll(\"link[href]\");for(r=0;r<i.length;r++)n.push(i[r].getAttribute(\"href\"));var c=t.getElementsByTagName(\"style\");for(r=0;r<c.length;r++)for(var s,l=/@import\\s+(?:url\\()?\\s*[\"']?([^\"')\\s;]+)/gi;s=l.exec(c[r].textContent||\"\");)n.push(s[1]);try{var d=e.performance&&performance.getEntriesByType?performance.getEntriesByType(\"resource\"):[];for(r=0;r<d.length;r++)n.push(d[r].name)}catch(e){}for(r=0;r<n.length;r++){var u=ce(y,n[r]);u&&!o[n[r]]&&(o[n[r]]=1,a.push({provider:u[0],url:String(n[r]).slice(0,200)}))}return a}(),b=function(){var e,r=[],n=t.getElementsByTagName(\"iframe\");for(e=0;e<n.length;e++){var a=n[e].getAttribute(\"src\")||\"\",o=ce(k,a);o&&r.push({provider:o[0],src:a.slice(0,200),state:\"loaded\"})}for(e=0;e<H.length;e++)\"embed\"===H[e].kind&&r.push({provider:H[e].provider[0],src:H[e].src.slice(0,200),state:\"click-to-load\"});return r}(),w=function(){try{var t=e.performance&&performance.getEntriesByType?performance.getEntriesByType(\"resource\"):[];t.length<Z&&(Z=0);for(var r=Z;r<t.length;r++)pe(t[r].name,t[r].initiatorType||\"resource\");Z=t.length}catch(e){}var n=[];for(var a in x)x.hasOwnProperty(a)&&!x[a].known&&n.push({host:a,count:x[a].count,via:x[a].via.slice(),droppedByStrict:x[a].dropped});return n.sort(function(e,t){return t.count-e.count}),n}(),T=[],_={};for(n=0;n<S.length;n++){var L=S[n];\"html\"!==L.via||\"script\"!==L.type&&\"img\"!==L.type&&\"iframe\"!==L.type&&\"link\"!==L.type||_[L.url]||(_[L.url]=1,T.push({type:L.type,vendor:L.vendor,url:L.url,category:L.category}))}var M=J.present?function(){for(var t,r,n=J.beforeChoice,a=E?null:(r=(t=e.Shopify)&&t.customerPrivacy)?mt(r):null,o=[],i=[n,a],c=0;c<i.length;c++){var s=i[c];s&&(!0===s.marketingAllowed&&-1===o.indexOf(\"marketingAllowed() = true\")&&o.push(\"marketingAllowed() = true\"),!0===s.analyticsAllowed&&-1===o.indexOf(\"analyticsProcessingAllowed() = true\")&&o.push(\"analyticsProcessingAllowed() = true\"),!1===s.shouldShowBanner&&-1===o.indexOf(\"shouldShowBanner() = false\")&&o.push(\"shouldShowBanner() = false\"))}return o.length?{signals:o,region:n&&n.region||a&&a.region||null}:null}():null,P=[];C.foundOwnTag||P.push(\"GDRock could not identify its own <script> tag. Load it with a plain <script src> tag, not from another script.\"),C.async&&P.push(\"Remove async/defer from the GDRock script tag: it has to run before everything else.\");var I=[];for(n=0;n<C.ranBefore.length;n++)C.ranBefore[n].tracker&&I.push(C.ranBefore[n].tracker);for(C.ranBefore.length&&P.push(\"Move the GDRock script above the \"+C.ranBefore.length+\" script(s) that ran before it\"+(I.length?\", including \"+I.join(\", \")+\", which ran unblocked\":\"\")+\".\"),n=0;n<h.length;n++)P.push(\"Inline \"+h[n].vendor+' code runs before anyone can block it. Tag that <script> type=\"text/plain\" data-gdrock-category=\"'+Et(h[n].vendor)+'\" so it waits for consent.');for(n=0;n<T.length;n++)P.push(\"The \"+T[n].vendor+\" \"+T[n].type+\" is written directly in the HTML, so the browser may fetch it once before GDRock can act. \"+(\"img\"===T[n].type?\"Delete that <img> tag.\":\"Change src to data-gdrock-src\"+(\"script\"===T[n].type?' and add type=\"text/plain\"':\"\")+\".\"));var O={};for(n=0;n<m.length;n++)O[m[n].provider]=1;for(var R in O)P.push(R+\" are loaded from \"+R.split(\" \")[0]+\"'s servers, which sends every visitor's IP address there. Host the font files on your own server.\");for(n=0;n<b.length;n++)\"loaded\"!==b[n].state||xe(\"marketing\")||P.push(\"A \"+b[n].provider+' embed loaded before consent. Add data-gdrock-embeds=\"click\" to the GDRock script tag for a click-to-load placeholder.');return J.present&&!J.apiFound&&P.push(\"This is a Shopify store but the Customer Privacy API could not be reached (\"+(J.error||\"not loaded yet\")+\"), so app pixels are not told about consent.\"),M?P.push(\"Shopify treated this visitor as trackable before any choice (\"+M.signals.join(\", \")+(M.region?\", region \"+M.region:\"\")+\"). App pixels can act on that before GDRock's signal arrives. In Shopify admin > Settings > Customer privacy, require consent for this region.\"):J.present&&P.push(\"In Shopify admin > Settings > Customer privacy, require consent for your visitors' regions, so app pixels wait for GDRock's signal instead of Shopify's regional default.\"),w.length&&P.push(w.length+\" third-party host(s) are not on GDRock's list: \"+w.slice(0,5).map(function(e){return e.host}).join(\", \")+(w.length>5?\" and more\":\"\")+'. Check what each one is; strict mode (data-gdrock-strict=\"true\") drops their beacons until consent.'),{version:r,siteId:i||null,advancedConsentMode:l,embedsClickToLoad:d,fontsToBunny:u,strict:{on:g,allow:p.slice()},install:{firstScript:C.firstScript,foundOwnTag:C.foundOwnTag,asyncOrDefer:C.async,ranBefore:C.ranBefore,tag:o?o.outerHTML:null},consent:St(),blocked:a,counts:c,cookiesRefused:s,stillHeld:H.length,framesPatched:Y,untaggedInline:h,fromHtml:T,fonts:m,fontRewrites:B.slice(),embeds:b,unknownThirdParty:w,shopify:{present:J.present,apiFound:J.apiFound,loadRequested:J.loadRequested,caughtAtMs:J.caughtAt,updated:J.updates>0,updates:J.updates,lastSent:J.lastSent,error:J.error,beforeChoice:J.beforeChoice,trackableBeforeChoice:M},withdrawal:$,manualWork:P}}function Et(e){return/Google Analytics|Google Tag Manager|Google tag|Hotjar|Clarity|Yandex/.test(e)?\"analytics\":\"marketing\"}function Lt(){return St()}}(window,document);";

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
var LOGO_B64_LIGHT="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAYAAACohjseAAAJ8UlEQVR42tWaa4xdVRmGn3fv0ylQKW2RSylQI0IpRaEWRSSARBOImnCLPxBMsEaCGn+I/BAiF+MFU1QUNaJgU6QIgVCiEUSIpEEIpEIsglhu8QKxHcq0Q4ttp2fO+fzBu8pis89tZhrDSXbOPjPn7LXe7/6934Ld+IoIRUSZfT46Ij6cfS4jouDt9qoBdmhEXBoRj0fEjohYGRHHVoDq7QjswIj4WkQ8FhEvRMRaA4yIaEbE8og4cncC1RSCKyW1fL8P8GngM8Bc4FVgJzANWAg0gCSIbcCNwPcl/du/bwAtSfF/B1gBtgdwDvBZ4N3AFmDMgAAKA5wOBNDK/rcZ+BlwnaTh9GygPRmgmgSwAghJ4Y2cZWALrJXt1lK+RhWgaoBuAH4A/FzSlqoQdzvAFPUktf35dGApcJyB/bcGWDeAux5dAfo8cA1wk6SxiQLVJICdCHweOBFoAlsNoOix3lEZwLo9VIH+FVgG3CqpXd3HpAE6qhWZny0GvgCc4s1s8XOKPtc7qoMGc4AC2r5PwehR4FuS7q4T+MAAa4AdDlwIfNzR8NXKBpgigNVXMsm0zj3A1ZIe6icQ9aPBQxw8zgb2drRrDwhsMgBzoLml3G6gawfSYJZoZxjY+cB+1th4n6Y4KMDo4It1Ahj3e/LRXwFfseCparJus6W/tBS4DpgJDDuQlFNZHNQIOroIPwWfMgO3xsAu9J6LurBd5+QAJ/v+cGARsG9FgrsTaL6XttdUJuD7gDMlHW8Mn/D33xJwGlXzlNSKiCHgmGzBvX1tBzYCm1x6lV4gdgPYtq+G19gB3An8RNKj3u8ZwEXAuoiYLWmzMUStxCKicK45CnjCD68zm53AK8CIF1YWdGISQSYyLaTnDQMrgRslrcsi50HW5Aw/70xJj1SLgUaNybZdlTRsGmVWUqXND3mBA+wDG4HXsiinAbWa/KvIgD0N3ADcImljBqyUtDMivu1CfhiYBSwGHqkKrdFhwQ/WaE01floC7/Q1CrzsxB8VwfRjhmkvDwM/BVZlJVojadbgznPt+7Jz8jiwpM4PGx2S6pIMVF3NmG88fZ7l6zUvPJqllaqf1vnXb4DrJa3OXCa1TeN2n1ZEHAp8w88vMpdZFBFDFsAuP2zU+N8B9hMyc6OLRqsh/h2+dth0R5xiiswUp/vzK85jN2T+lcy8LWk8X9f/WwbMcaBL+x8D5gHvAp7NFdCo2fhi5752l1QQXYAnoHsAh9hPN/qaDuwFPAP8ElgpaX3mXzhAtOp6zohY6pQwXNn7uEG/LwP4ljyY/nhCZkaaQJGumj5vHnAssB44F1gs6RpJ6xPxJKlV1wplpnkYcKWDWtlH7HiLDybnPK6DtgapHasF8ho3saskNSv+1epR8OemOdOmWdYIdSdwjL/bfhNAO2U7ImZY0rl2NUDl0gnYHVkfWdb4V6dX0t5FwMds5o0OVjNmH9xf0nAKNDlX0nJwmdtHIVyXnPNk/xBwLXBXimbJj/rtyDPTXAB83VGz7OIWyQ8X2UcLoFXV0hLft2rARQ2w8SznFcCDwBmSTpK0KvE1qQQchH60aZamLfbK6tFuOXVaZoHKfTC6JPi6KNk2oPT7B4BrJf2u2ixPkCxK2vsicGpN1OykxWYWQ9q7ckvGjK0Fjs4AVINMu5Ib/2A+8/46FmCibF1WD99bcYFexfmQ/fRkSVsjQvlm57s1qtPeeBY8BNwNnCrpdEn3J0ZbUkwSXG6ay/o0zWokPSDDUeQs2PudiFuZxtLDk3ncBZwi6ZOSVkdEMRXAqqYJfMls3cgA7VhKD3vlfpgn+jzBNzNgTeBW4HhJZ0t6MAPWniJgedRcAnwnK+T38H1qfFsZ41YHMqwsgNeTbZbgxx2JcC15G/CjROyYqtNUgerAJGwAzrOZHQm8BzgY2Mc+lhSw0+/tSrTfARy9Ky1547OBF908bgFucmX/dJaco1+ydYonVqVz83yPBRYCRzip7wfsmeXBnZmmT5L0YiPLf8PAL4DlWYM5Lc+LVTpgd43gskidXOAlXw9n35sDHGqwC63xg13OzXXTsAtg6fb/T8DMiBiXtDnVjR2kmnf5MVXA/ZxWZWRQVEA3JW1yXbq2wuF+yIzgzJQHU6C5GzjNkhoF/gP8A3jO7c0LwAZJoz0kP6FxV0oR2QUdZoQRMd3aWuCIeaw1Oc/s3zrgA8A2ZYn1CGsxVTjTfKUIts1h+yWD/pvf/2ng26vJegAwHdNMRMyy/y20Kx3j2ePBTmt1r49KeiAiSlUayq8CV5hyKDMTVEa4JuDJsV9z9fAS8KSj7qZBR122pHmOmouA9/r9MODAHpxOXsksl/S5ahRNkhyyFhd4zlfUhPL8SixYAt0C/gJcLOnvdSDtv3taCwvdhS+yiR1iuqNTKxY1Zpz3fxstmJE0eVINLfARE6yv9jmHiEyCI041O4BLJd2XJsFZAb3UHcI+HdqfXCt1fkmXeeIFkm7KBVtk0avlf6wGbrGz9tOUKuNTS96Y8P44Ii5ytROZGd5p3y2dt6rVSZHRiGUH4qsqkAbwxyq4Wmbbt3PcAu3rTrmXJgv74rbMZOTf3wFcLmksIqZJapq5+7NNst3l+f0222PmeZ6tBriikoPaLsVeAb5pc4s+zbRZASz7xDnAioiYa3BDPkXxKZtyN7q/VxeRpk1XG1xZjd7qlMhtsrebC9ncgy5oO+nSYZ4324zaxZIej4jp1uj5wM2VEcEgA9ESeCqro9v9zAdziV5un2r00GSzbnSV5dRRm/2KiDjL4IYkrXTf16hyoZVZSKf9AXw5Ufx1RUHRoVxqW4vPAD80Jd/q0Wh2e5U2xyawLCIuThQ7cCnw22zYU+VXu2lvufvSjjm31yGElODvdX7Z2sFUR/vsvJNW5gC/By6TtMXVykPOhy26z/9TANvgPW3O4gd9aTBTt1xwX0H9UZHUabQGoBXSTOI04OaImO/69ly3akUXc88j6yWSRrzHdrfw3q2yT7nxYQeDfWvMqNljQ538cpNbnFsi4kRJTwIX8OYzMp1M815Jv+6nHOznGEkSwmxgtc1rLEsF6SThRGb2adJUAt+VtDIiLnGl07QgVDHv7e71nu+lvZ4arOTGEUfVGZXybJyJH0goLawx4KqIuEzS94AVWW2bC6MArpL0nEu/dj8+0Td1YJNdAZxh5x7njaNck+Vj2qYg7gEucRA6pTLvWAOkI9F99Z2DHsYL0wSrLeFR3jiEMFmAyZ/3Bx6zmd7sziZNik+QtGaQVqzvU0s2h0LSv7z4LNee7QGuVlZYVz8nE1zvFupKXj8gu96+eP2g4BhU8hVC6DbgeBfZRYfieKI8zbj7wmEHsLnu5rcOyv9M5EBsmmUcZB8Z66OloWbO0a0ES/l1yNp7QtJTE2H1/gdz+SlZYq7+RAAAAABJRU5ErkJggg==";
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
  async fetch(request, env, ctx) {
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
      const domain = rawUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim().toLowerCase();
      const fullUrl = "https://" + domain;

      // 1) Read the homepage source once, from wherever this Worker is running.
      const vantage = readVantage(request);
      const scraped = await scrapeSite(fullUrl, vantage);
      if (!scraped.ok || (scraped.text || "").length < 80) {
        later(ctx, alertScan(env, { domain, email, optin: body.optin === true, vantage, failed: scraped.status ? "HTTP " + scraped.status : (scraped.error || "no readable content") }));
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
      later(ctx, alertScan(env, { domain, email, optin: body.optin === true, vantage, result }));
      if (email && email.includes("@")) later(ctx, sendScanReport(env, email, domain, result).catch(() => {}));

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
    if (path === "/api/whop-webhook" && request.method === "POST") {
      const raw = await request.text();
      if (!(await verifyWhopWebhook(env, request, raw))) return json({ error: "bad_signature" }, 401);

      let body = {};
      try { body = JSON.parse(raw); } catch (e) { return json({ error: "bad_json" }, 400); }

      // Whop has shipped the event name under a few keys across API versions.
      const event  = String(body.type || body.action || body.event || "");
      const d      = body.data || {};
      const meta   = d.metadata || (d.checkout_configuration && d.checkout_configuration.metadata) || {};
      const email  = (d.user && d.user.email) || d.email || meta.email || "";
      const siteId = normDomain(meta.website_url || "");
      const plan   = meta.gdrock_plan || whopPlanName(env, (d.plan && d.plan.id) || d.plan_id) || "care";

      // Access revoked — cancellation, refund, chargeback or failed renewal.
      // membership.deactivated and refund.created are the names in Whop's
      // webhook list as of 2026-09; the older names stay for safety.
      if (event === "membership.deactivated" || event === "refund.created" ||
          event === "membership.went_invalid" || event === "membership.cancelled" ||
          event === "membership.canceled"     || event === "payment.refunded") {
        if (siteId) {
          await supabasePatch(env, siteId, { active: false });
          return json({ ok: true, revoked: siteId });
        }
        // A revoke that can't be matched to a site must never pass silently:
        // the customer would keep a working banner they no longer pay for.
        if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
          await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, disable_web_page_preview: true,
              text: `Whop ${event} could not be matched to a website.\nEmail: ${email || "unknown"}\nSwitch their banner off by hand in Supabase (sites.active = false).` }),
          }).catch(() => {});
        }
        return json({ ok: true, note: "revoke event without a website" });
      }

      // Access granted or renewed.
      if (event === "payment.succeeded" || event === "membership.went_valid" ||
          event === "membership.activated") {
        if (!siteId || !email) return json({ ok: true, note: "missing siteId or email" });

        // A renewal must not mint a new access code — the customer already
        // installed the old one. Only a site we have never seen gets one.
        const existing = await supabaseGetSite(env, siteId);
        if (existing) {
          await supabasePatch(env, siteId, { active: true, plan });
          return json({ ok: true, renewed: siteId });
        }

        const code = generateCode();
        await supabaseUpsert(env, siteId, plan, true, code);
        await sendAccessCodeEmail(env, email, siteId, plan, code);
        if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
          await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: `*New Whop Sale*\n\n${email}\n${siteId}\n${plan}\nCode: ${code}`, parse_mode: "Markdown" }),
          }).catch(() => {});
        }
        return json({ ok: true, provisioned: siteId });
      }

      return json({ ok: true, skipped: event });
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
    // Everything site-derived is escaped: the domain, the evidence and the AI-written summary all come from outside.
    const ev = i.evidence ? `<div style="margin-top:6px;font-family:Consolas,Menlo,monospace;font-size:11px;color:#7c8494;word-break:break-all;">${escHtml(String(i.evidence).slice(0, 200))}</div>` : "";
    return `<tr><td style="padding:8px 12px;border-left:3px solid ${c};background:#0a1020;color:#cfd8ea;font-size:14px;border-radius:6px;">${mark} ${escHtml(i.text)}${ev}</td></tr><tr><td style="height:8px"></td></tr>`;
  }).join("");
  const limits = (result.limits || []).map((l) => `<li style="margin:0 0 6px;">${escHtml(l)}</li>`).join("");

  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#04081a;padding:32px;border-radius:16px;">
    <div style="text-align:center;margin-bottom:24px;"><span style="font-size:22px;font-weight:800;color:#fff;">GDRock</span><div style="color:#5b6a8a;font-size:12px;">GDPR Compliance</div></div>
    <h1 style="color:#fff;font-size:22px;text-align:center;margin:0 0 8px;">Your source scan</h1>
    <p style="text-align:center;color:#9CA3AF;font-size:14px;margin:0 0 20px;">for ${escHtml(domain)}</p>
    <div style="text-align:center;font-size:48px;font-weight:800;color:${color};margin-bottom:8px;">${score}/100</div>
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
  await sendEmail(env, email, `Your GDPR source scan for ${domain}: ${score}/100`, html).catch(() => {});
}

// Run work after the response is sent when the runtime allows it (ctx.waitUntil),
// otherwise just let the promise run. Never throws into the request.
function later(ctx, promise) {
  const p = Promise.resolve(promise).catch((e) => console.error("background task failed -", e && e.message));
  if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(p);
  return p;
}

const escHtml = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// One alert per scan, to Telegram and to the owner's inbox. Anonymous scans are
// the warmest signal on the site — someone typed their own store in — so they
// alert too, not only the ones that left an email.
//   TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID  → Telegram
//   OWNER_EMAIL (default office@gdrock.com) via ZEPTO_TOKEN or RESEND_API_KEY → email
async function alertScan(env, { domain, email, optin, vantage, result, failed }) {
  const hasEmail = Boolean(email && String(email).includes("@"));
  const where = vantage && vantage.country ? vantage.country + (vantage.colo ? " / " + vantage.colo : "") : "unknown";
  const headline = failed ? "Scan failed to load" : hasEmail ? "Scan + email captured" : "Anonymous scan";
  const worst = result ? (result.issues || []).filter((i) => i.severity !== "good").slice(0, 3).map((i) => "- " + String(i.text).slice(0, 140)) : [];
  const lines = [
    "GDRock scanner: " + headline,
    "",
    "Site: " + domain,
    failed ? "Could not read: " + failed : "Score: " + result.score + "/100" + (result.platform ? " (" + result.platform.name + ")" : ""),
    hasEmail ? "Email: " + email + (optin ? " (opted in to alerts + news)" : " (no marketing opt-in)") : "Email: none given",
    "Visitor location: " + where,
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
  const subject = `[GDRock scan] ${domain}` + (failed ? " - failed" : ` - ${result.score}/100`) + (hasEmail ? ` - ${email}` : " - anonymous");
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
// Plan ids live in Worker vars so prices can be re-pointed without a deploy.
function whopPlanId(env, plan) {
  return { core: env.WHOP_PLAN_CORE, care: env.WHOP_PLAN_CARE, agency: env.WHOP_PLAN_AGENCY }[plan] || "";
}
function whopPlanName(env, planId) {
  if (!planId) return "";
  if (planId === env.WHOP_PLAN_CORE)   return "core";
  if (planId === env.WHOP_PLAN_CARE)   return "care";
  if (planId === env.WHOP_PLAN_AGENCY) return "agency";
  return "";
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
      `${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(siteId)}&select=site_id,access_code`,
      { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
    );
    const rows = await r.json();
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  } catch (e) { return null; }
}

async function sendAccessCodeEmail(env, email, siteId, plan, code) {
  const planLabel = { core: "Core Pack", care: "Care", agency: "Agency" }[plan] || plan;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#0f172a;">
  <h1 style="font-size:22px;margin:0 0 8px;">You're live, and thank you.</h1>
  <p style="font-size:15px;line-height:1.65;color:#475569;margin:0 0 24px;">Your GDRock <strong>${planLabel}</strong> plan is active for <strong>${siteId}</strong>.</p>
  <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
    <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:8px;">Your access code</div>
    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:20px;font-weight:700;letter-spacing:.06em;">${code}</div>
  </div>
  <p style="font-size:15px;line-height:1.65;color:#475569;margin:0 0 12px;"><strong>Install — one line, before &lt;/body&gt;:</strong></p>
  <pre style="background:#0f172a;color:#e2e8f0;padding:16px;border-radius:10px;font-size:12px;overflow-x:auto;margin:0 0 24px;">&lt;script async src="https://cdn.gdrock.com/gdrock.js" data-site-id="${siteId}"&gt;&lt;/script&gt;</pre>
  <p style="font-size:15px;line-height:1.65;color:#475569;margin:0 0 24px;">Customise the banner at <a href="https://cdn.gdrock.com/customize" style="color:#1a6dff;">cdn.gdrock.com/customize</a> using the code above.</p>
  <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0;">Questions, or want us to install it for you? Just reply to this email — it reaches a person. You're covered by our 14-day money-back guarantee.</p>
</div>`;
  try { return await sendEmail(env, email, `Your GDRock access code — ${siteId}`, html); } catch (e) { return null; }
}

/* ===========================================================================
   GDPR SCANNER  —  what this thing can and cannot see
   ===========================================================================
   The scanner runs inside this Worker. It performs exactly one anonymous GET
   of the homepage and reads the bytes that come back. It does not run a
   browser and it does not execute JavaScript, and that fixes the boundary of
   every claim it is allowed to make:

   OBSERVABLE
     - the HTML the server returns to a cookie-less, consent-less request
     - that response's headers (status, Set-Cookie, platform headers)
     - every third-party host referenced in the markup and in inline scripts
     - inline Consent Mode defaults, and consent-gating attributes on tags
     - which consent-tool LOADER is present, by its URL / markup signature
     - links to privacy, terms, imprint and cookie pages
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
    if (/\btype\s*=\s*["'](?:text\/plain|javascript\/blocked|text\/x-cookie)/i.test(attrs) ||
        /\bdata-(?:cookieconsent|cookiecategory|cookie-consent|cmp-ab|borlabs-cookie|cmplz-src|usercentrics|gdrock-category|ot-ignore|cookiefirst-category|cookieyes|iub-purposes|klaro-config)\b/i.test(attrs)) {
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
      if (links.length < 12 && /privacy|datenschutz|confidential|privacybeleid|informativa|terms|agb|conditions|impressum|cookie|legal|mentions-legales/.test(blob)) links.push(a.href.slice(0, 140));
    }

    const cmps     = matchSignatures(CMP_SIGNATURES, d, r.headers);
    const trackers = matchSignatures(TRACKER_SIGNATURES, d, r.headers);
    const fonts    = matchSignatures(FONT_SIGNATURES, d, r.headers);
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
  const add = (severity, text, confidence, evidence) => issues.push({ severity, text, confidence, evidence: evidence || null });
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
      "observed", s.trackers.map((t) => t.evidence).slice(0, 4).join(" | "));
  } else if (hasTrk && hasCMP && !gated) {
    // Informational only, no points. Shopware's cookie bar, Shopify's banner and
    // most tag-manager setups hold tags back at runtime, which leaves no trace in
    // the source; the local rig proved exactly that on vapor-handel.de.
    add("warning",
      names(s.cmps) + " is installed alongside " + names(s.trackers) + ", and no tag in the source carries the markup a consent tool uses to hold one back (no type=\"text/plain\", no consent data-attribute). Several tools block at runtime instead, which source code cannot show, so this is a prompt to check in a browser rather than a finding against you.",
      "inferred", s.cmps.map((c) => c.evidence).slice(0, 2).join(" | "));
  } else if (hasTrk && hasCMP && gated) {
    add("good",
      names(s.cmps) + " is installed, and " + s.gatedTags.length + " tag" + (s.gatedTags.length === 1 ? " is" : "s are") + " marked in the source for it to hold back until consent. Whether it holds every tag back is a runtime question this scan cannot answer.",
      "observed", s.gatedTags[0]);
  } else {
    add("good",
      "No third-party analytics or advertising tag was found in the homepage source. Tags injected later by a tag manager, by an app, or on another page would not appear here.",
      "observed", null);
  }

  if (hasCMP) {
    add("good", "Consent tool found in the source: " + names(s.cmps) + ".", "observed", s.cmps[0].evidence);
  } else {
    add("warning",
      "No consent tool was found in the homepage source. That is not proof there is no banner — some are injected by a tag manager or a store app, and some are served only to visitors in certain countries. It means nothing in the page we fetched declares one.",
      "observed", null);
  }

  // 2. Consent Mode defaults — declared in the initial HTML, so fair game.
  if (cm && cm.grantsByDefault) {
    deduct("consent_mode_granted", JSON.stringify(cm.states));
    add("critical",
      "Google Consent Mode is configured in the source with storage granted by default (" + Object.entries(cm.states).map(([k, v]) => k + ": " + v).join(", ") + "). That default permits Google's tags to store and send data without waiting for anyone to agree.",
      "observed", cm.evidence);
  } else if (cm && cm.deniesByDefault) {
    add("good",
      "Google Consent Mode is configured in the source with ad and analytics storage denied by default, which is the correct default.",
      "observed", cm.evidence);
  }

  // 3. Fonts and embeds. These behave identically for every visitor in every
  //    country, which is what makes them claimable from any vantage point.
  if (s.fonts.length) {
    deduct("third_party_fonts", names(s.fonts));
    add("warning",
      names(s.fonts) + " " + (s.fonts.length === 1 ? "is" : "are") + " linked directly in the homepage source, so a visitor's browser requests " + (s.fonts.length === 1 ? "it" : "them") + " from that server, disclosing their IP address, as the page parses. A German court awarded damages over exactly this (LG München I, 20.01.2022, 3 O 17493/20). Self-hosting the font files removes it.",
      "observed", s.fonts[0].evidence);
  }
  const cookieEmbeds = s.embeds.filter((e) => !e.cookieless);
  if (cookieEmbeds.length) {
    deduct("cookie_setting_embed", names(cookieEmbeds));
    add("warning",
      names(cookieEmbeds) + " " + (cookieEmbeds.length === 1 ? "is" : "are") + " embedded in the homepage source. Embeds like these set cookies on load unless a consent tool holds them back; YouTube's youtube-nocookie.com domain is the usual swap.",
      "observed", cookieEmbeds[0].evidence);
  }

  // 4. The document's own Set-Cookie. Usually empty, because most tracking
  //    cookies are written by JavaScript, which this scan never runs.
  if (s.trackingCookies.length) {
    deduct("tracking_cookie_on_document", s.trackingCookies.join(", "));
    add("critical",
      "The homepage response set " + (s.trackingCookies.length === 1 ? "a tracking cookie" : "tracking cookies") + " (" + s.trackingCookies.join(", ") + ") on a request that carried no cookies and no consent. This one is not a matter of interpretation: it is on the response we fetched.",
      "observed", s.trackingCookies.join(", "));
  }

  // 5. Policies.
  const hasPrivacy = s.links.some((l) => /privacy|datenschutz|confidential|privacybeleid|informativa/i.test(l));
  const hasTerms   = s.links.some((l) => /terms|agb|conditions|impressum|legal|mentions/i.test(l));
  if (!hasPrivacy) {
    deduct("no_privacy_link");
    add("critical", "No link to a privacy policy was found in the homepage markup. Art. 13 GDPR requires that information to be reachable from where data is collected.", "observed", null);
  } else {
    add("good", "A privacy policy link is present in the homepage markup.", "observed", null);
  }
  if (!hasTerms) {
    deduct("no_terms_link");
    add("warning", "No terms, legal or imprint link was found in the homepage markup.", "observed", null);
  }

  // 6. Things this scan cannot see, said out loud rather than scored.
  if (s.gtm) add("warning", GTM_NOTICE, "observed", null);

  score = Math.max(0, Math.min(100, score));

  const band = score >= 90 ? "Nothing in the source stands out."
    : score >= 70 ? "The basics are in the source, and the specific gaps are listed below."
    : score >= 40 ? "Real gaps are visible in the source."
    : "The source is missing core protections.";

  return {
    score,
    is_real_site: true,
    scan_method: "source",
    site_description: "Website at " + domain + (s.platform ? " (" + s.platform.name + ")" : ""),
    summary: "Read the homepage source of " + domain + ". " + band + " A source scan cannot see runtime behaviour, so the limits are listed with the findings.",
    platform: s.platform ? { name: s.platform.name, evidence: s.platform.evidence } : null,
    consent_tools: s.cmps.map((c) => ({ name: c.name, evidence: c.evidence })),
    tags_found: s.trackers.map((t) => ({ name: t.name, evidence: t.evidence })),
    third_party_hosts: s.thirdPartyHosts,
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
  return [
    "One page was read: the homepage at " + s.finalUrl + ".",
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
  return issues.slice().sort((a, b) => (rank[a.severity] ?? 1) - (rank[b.severity] ?? 1)).slice(0, 10);
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

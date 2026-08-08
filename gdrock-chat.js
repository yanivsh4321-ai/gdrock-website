/* GDRock help assistant — shared, self-injecting widget. Client-side, no backend.
   Include with: <script src="/gdrock-chat.js" defer></script>
   Answers from hardcoded real GDRock content (+ optional on-page `faqs` array).
   On pages without the target sections, action buttons navigate to index.html#anchor. */
(function(){
 function init(){
  if(document.getElementById('gdc-launch'))return; // already present (e.g. inline on index)
  var css=""
  +"#gdc-launch{position:fixed;bottom:22px;right:22px;z-index:9998;display:inline-flex;align-items:center;gap:8px;background:var(--acc,#3b82f6);color:#fff;border:none;border-radius:10px;padding:11px 16px;min-height:44px;box-sizing:border-box;font:600 14px/1 var(--B,'Inter',sans-serif);cursor:pointer;box-shadow:0 12px 30px -10px rgba(59,130,246,.7);transition:transform .2s,box-shadow .2s;}"
  +"#gdc-launch:hover{transform:translateY(-2px);box-shadow:0 16px 38px -12px rgba(59,130,246,.85);}"
  +"#gdc-panel{position:fixed;bottom:84px;right:22px;z-index:9999;width:372px;max-width:calc(100vw - 32px);height:540px;max-height:72vh;display:flex;flex-direction:column;background:#0c1018;border:1px solid var(--line,rgba(255,255,255,.1));border-radius:16px;box-shadow:0 44px 100px -34px rgba(0,0,0,.9);overflow:hidden;opacity:0;transform:translateY(14px) scale(.98);pointer-events:none;transition:opacity .22s ease,transform .22s ease;font-family:var(--B,'Inter',sans-serif);}"
  +"#gdc-panel.open{opacity:1;transform:none;pointer-events:auto;}"
  +"#gdc-head{display:flex;align-items:center;justify-content:space-between;padding:13px 15px;border-bottom:1px solid var(--line,rgba(255,255,255,.08));background:rgba(255,255,255,.025);}"
  +".gdc-head-l{display:flex;align-items:center;gap:10px;}"
  +".gdc-head-t strong{display:block;font-family:var(--D,'Geist',sans-serif);font-size:14px;color:#f4f6fa;letter-spacing:-.01em;}"
  +".gdc-head-t span{font-size:11px;color:#9aa2b2;}"
  +".gdc-dot{width:9px;height:9px;border-radius:50%;background:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.2);flex-shrink:0;}"
  +"#gdc-close{background:none;border:none;color:#9aa2b2;font-size:24px;line-height:1;cursor:pointer;padding:0 4px;}"
  +"#gdc-close:hover{color:#fff;}"
  +"#gdc-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;}"
  +".gdc-m{max-width:86%;padding:10px 13px;font-size:13.5px;line-height:1.5;border-radius:14px;}"
  +".gdc-bot{align-self:flex-start;background:rgba(255,255,255,.05);border:1px solid var(--line,rgba(255,255,255,.08));color:#dce3ef;border-bottom-left-radius:4px;}"
  +".gdc-user{align-self:flex-end;background:var(--acc,#3b82f6);color:#fff;border-bottom-right-radius:4px;}"
  +".gdc-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:9px;}"
  +".gdc-act{display:inline-flex;align-items:center;gap:5px;background:rgba(59,130,246,.13);border:1px solid rgba(59,130,246,.32);color:#9cc2ff;font-size:12.5px;font-weight:600;font-family:inherit;padding:7px 11px;border-radius:8px;text-decoration:none;cursor:pointer;}"
  +".gdc-act:hover{background:rgba(59,130,246,.22);color:#cfe0ff;}"
  +".gdc-typing{display:flex;gap:4px;align-items:center;}"
  +".gdc-typing span{width:6px;height:6px;border-radius:50%;background:#9aa2b2;animation:gdcT 1s infinite;}"
  +".gdc-typing span:nth-child(2){animation-delay:.15s;}.gdc-typing span:nth-child(3){animation-delay:.3s;}"
  +"@keyframes gdcT{0%,60%,100%{opacity:.3;transform:translateY(0);}30%{opacity:1;transform:translateY(-3px);}}"
  +"#gdc-chips{display:flex;flex-wrap:wrap;gap:7px;padding:0 16px 10px;}"
  +".gdc-chip{background:rgba(255,255,255,.05);border:1px solid var(--line,rgba(255,255,255,.1));color:#c2c9d6;font-size:12.5px;font-family:inherit;padding:7px 11px;border-radius:8px;cursor:pointer;}"
  +".gdc-chip:hover{border-color:rgba(59,130,246,.45);color:#fff;}"
  +"#gdc-form{display:flex;gap:8px;padding:12px 14px;border-top:1px solid var(--line,rgba(255,255,255,.08));background:rgba(255,255,255,.025);}"
  +"#gdc-in{flex:1;background:rgba(255,255,255,.06);border:1px solid var(--line,rgba(255,255,255,.12));border-radius:8px;padding:11px 12px;color:#fff;font-size:13.5px;outline:none;font-family:inherit;}"
  +"#gdc-in:focus{border-color:var(--acc,#3b82f6);}"
  +"#gdc-form button{background:var(--acc,#3b82f6);border:none;border-radius:8px;width:42px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;}"
  +"@media(max-width:600px){#gdc-launch{bottom:14px;right:14px;padding:11px 15px;}#gdc-panel{left:10px;right:10px;top:72px;bottom:74px;width:auto;max-width:none;height:auto;max-height:none;}}";
  var st=document.createElement('style');st.id='gdc-style';st.textContent=css;document.head.appendChild(st);
  var wrap=document.createElement('div');
  wrap.innerHTML=''
  +'<button id="gdc-launch" aria-label="Open GDRock help chat" aria-haspopup="dialog"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.6-.8L3 21l1.8-5.9A8.5 8.5 0 1 1 21 11.5z"/></svg><span>Help</span></button>'
  +'<div id="gdc-panel" role="dialog" aria-label="GDRock assistant" aria-hidden="true">'
  +'<div id="gdc-head"><div class="gdc-head-l"><span class="gdc-dot"></span><div class="gdc-head-t"><strong>GDRock Assistant</strong><span>Automated &middot; instant answers</span></div></div><button id="gdc-close" type="button" aria-label="Close chat">&times;</button></div>'
  +'<div id="gdc-msgs"></div><div id="gdc-chips"></div>'
  +'<form id="gdc-form"><input id="gdc-in" type="text" autocomplete="off" placeholder="Ask about pricing, banners, fines..."><button type="submit" aria-label="Send message"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg></button></form>'
  +'</div>';
  document.body.appendChild(wrap);
  var L=document.getElementById('gdc-launch'),P=document.getElementById('gdc-panel'),M=document.getElementById('gdc-msgs'),C=document.getElementById('gdc-chips'),F=document.getElementById('gdc-form'),I=document.getElementById('gdc-in'),X=document.getElementById('gdc-close'),started=false;
  var QUICK=['Which plan fits me?','I run an agency','Is the cookie banner compliant?','Run a free scan','What are the GDPR fines?','Talk to a human'];
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];});}
  function bot(html,who){var d=document.createElement('div');d.className='gdc-m '+(who==='user'?'gdc-user':'gdc-bot');d.innerHTML=html;M.appendChild(d);M.scrollTop=M.scrollHeight;return d;}
  function actsHTML(a){if(!a||!a.length)return'';return'<div class="gdc-actions">'+a.map(function(x){return x.href?('<a class="gdc-act" href="'+x.href+'"'+(x.blank?' target="_blank" rel="noopener"':'')+'>'+esc(x.label)+'</a>'):('<button type="button" class="gdc-act" data-go="'+esc(x.go||'')+'">'+esc(x.label)+'</button>');}).join('')+'</div>';}
  function say(r){var d=bot(esc(r.text).replace(/\n/g,'<br>')+actsHTML(r.actions),'bot');d.querySelectorAll('.gdc-act[data-go]').forEach(function(b){b.addEventListener('click',function(){go(b.getAttribute('data-go'));});});}
  function go(sel){if(!sel)return;var el=document.querySelector(sel);if(el){closeP();setTimeout(function(){el.scrollIntoView({behavior:'smooth',block:'start'});},160);}else{window.location.href='index.html'+sel;}}
  function renderChips(){C.innerHTML='';QUICK.forEach(function(q){var b=document.createElement('button');b.type='button';b.className='gdc-chip';b.textContent=q;b.addEventListener('click',function(){send(q);});C.appendChild(b);});}
  function typing(){var d=bot('<span></span><span></span><span></span>','bot');d.classList.add('gdc-typing');return d;}
  function answer(text){
   var t=text.toLowerCase();
   function h(){for(var i=0;i<arguments.length;i++){if(t.indexOf(arguments[i])>-1)return true;}return false;}
   if(h('agency','agencies','client site','client store','white-label','white label','portfolio','resell','freelanc','my clients','for clients'))
    return{text:'GDRock has a dedicated agency programme - the Founding Partner pilot:\n- We install GDRock on up to 20 of your client sites, free for 30 days (we do the installs, not you).\n- After the pilot: white-label portfolio pricing - up to 25 sites €299/mo, 26-50 €499/mo, 51-100 €799/mo, locked for 12 months.\n- You resell it under your brand and bill your clients.\nFirst 5 agencies only.',actions:[{label:'See the agency programme',href:'agencies.html'},{label:'Apply for the free pilot',href:'agencies.html#apply'}]};
   if(h('which plan','recommend','plan fit','plan for','best plan','what plan','fits me','choose','not sure','should i'))
    return{text:'Quick guide:\n- Core Pack: €29 once, the documents and script, you install them yourself (no hosting or updates).\n- Care: €15/mo, a hosted cookie banner we keep current when EU law changes (most popular). Extra sites €9/mo each.\nRunning client sites as an agency? Agency Portfolio from €299/mo with a free 30-day pilot.',actions:[{label:'Get Care €15/mo',href:'checkout.html?plan=care'},{label:'Core €29',href:'checkout.html?plan=core'},{label:'Agency programme',href:'agencies.html'}]};
   if(h('cookie','banner','consent'))
    return{text:'Yes - fully GDPR-compliant. It blocks non-essential cookies before consent, logs consent records with timestamps, and supports accept-all, reject-all and granular choices. Install is one script tag.',actions:[{label:'Get hosted banner (Care)',href:'checkout.html?plan=care'},{label:'See it live',go:'#customizer'}]};
   if(h('scan','audit','check my','test my','am i compliant','exposure','compliant'))
    return{text:'Run our free compliance scan - paste your store URL and see your real GDPR exposure in about 10 seconds.',actions:[{label:'Run free scan',go:'#scanner'}]};
   if(h('fine','penalty','risk','sue','lawsuit','how much can'))
    return{text:'GDPR fines reach €20M or 4% of global turnover (Tier 2); €10M or 2% for Tier 1. Even stores under €1M revenue average €12k-€45k. Want to estimate yours?',actions:[{label:'Estimate my fine',go:'#estimator'},{label:'Run free scan',go:'#scanner'}]};
   if(h('price','pricing','cost','how much','plans','euro','cheap'))
    return{text:'Pricing:\n- Core Pack: €29 one-time\n- Care: €15/month (hosted banner, we maintain it)\n- Extra sites: €9/month each\n- Agencies: Portfolio pricing from €299/mo for a whole client portfolio (free 30-day pilot)',actions:[{label:'Core €29',href:'checkout.html?plan=core'},{label:'Care €15/mo',href:'checkout.html?plan=care'},{label:'Agency programme',href:'agencies.html'}]};
   if(h('refund','money back','guarantee','cancel'))
    return{text:'Every product has a 14-day unconditional money-back guarantee, and monthly plans cancel anytime. Email office@gdrock.com with your order reference.',actions:[{label:'Email us',href:'mailto:office@gdrock.com'}]};
   if(h('done for you','do it for me','dfy','install for me','set it up for me','setup service'))
    return{text:'Our engineers install everything for you - cookie banner, privacy policy and consent logging, directly on your store. Live in 48 hours, from €249.',actions:[{label:'See Done-For-You',href:'dfy.html'}]};
   if(h('free','download','starter','sample','trial'))
    return{text:'Grab the free GDRock Starter pack - GDPR basics guide, compliance checklist and a fine-tier reference. No credit card.',actions:[{label:'Get the free pack',go:'#free'}]};
   if(h('shopify','woocommerce','wordpress','stripe','platform','website builder'))
    return{text:'Yes - Core Pack includes a Shopify setup guide, the hosted banner works with any Shopify/WordPress theme, and Done-For-You covers WooCommerce, Stripe and custom stacks.',actions:[{label:'Get Care €15/mo',href:'checkout.html?plan=care'},{label:'Done-For-You',href:'dfy.html'}]};
   if(h('non-eu','non eu','outside eu','united states','usa','us based','not in eu'))
    return{text:'If you collect personal data from EU residents, GDPR applies regardless of where your business is based. GDRock works for any store selling into the EU.'};
   if(h('law change','update','changes','new rules'))
    return{text:'Care and Pro subscribers get automatic banner and policy updates when the law changes. Core Pack customers receive email alerts on major changes.'};
   if(h('human','agent','sales','talk to','contact','support','email','demo','call'))
    return{text:'Happy to connect you with the team - we reply within 24 hours.',actions:[{label:'Email office@gdrock.com',href:'mailto:office@gdrock.com'},{label:'Request a demo',go:'#contact'}]};
   if(h('hello','hi ','hey','thanks','thank'))
    return{text:'Hi! I can help with pricing, the cookie banner, a free compliance scan, GDPR fines, or connecting you with a human. What do you need?'};
   if(typeof faqs!=='undefined'&&faqs&&faqs.length){
    var words=t.split(/[^a-z0-9]+/).filter(function(w){return w.length>3;}),best=null,bs=0;
    faqs.forEach(function(f){var hay=(f.q+' '+f.a).toLowerCase(),s=0;words.forEach(function(w){if(hay.indexOf(w)>-1)s++;});if(s>bs){bs=s;best=f;}});
    if(best&&bs>=1)return{text:best.a,actions:[{label:'See all FAQs',go:'#faq'}]};
   }
   return{text:"I'm not sure on that one, but a human can help fast. You can also ask me about pricing, the cookie banner, a free scan, or GDPR fines.",actions:[{label:'Email office@gdrock.com',href:'mailto:office@gdrock.com'},{label:'See FAQs',go:'#faq'}]};
  }
  function send(text){text=(text||'').trim();if(!text)return;bot(esc(text),'user');I.value='';var ty=typing();setTimeout(function(){ty.remove();say(answer(text));},420);}
  function greet(){if(started)return;started=true;say({text:"Hi, I'm the GDRock assistant. I can help you get GDPR-compliant in minutes - ask me anything, or tap a question below."});renderChips();}
  function openP(){P.classList.add('open');P.setAttribute('aria-hidden','false');greet();setTimeout(function(){I.focus();},260);}
  function closeP(){P.classList.remove('open');P.setAttribute('aria-hidden','true');}
  L.addEventListener('click',function(){P.classList.contains('open')?closeP():openP();});
  X.addEventListener('click',closeP);
  F.addEventListener('submit',function(e){e.preventDefault();send(I.value);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&P.classList.contains('open'))closeP();});
 }
 if(document.body)init();else document.addEventListener('DOMContentLoaded',init);
})();

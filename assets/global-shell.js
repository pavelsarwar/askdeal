(function(){
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
  ready(async function(){
    const logo='assets/askdeal-logo.png';
    const topbar=document.querySelector('.topbar');
    if(topbar) topbar.innerHTML='<div class="container"><div id="siteTopbarLeft">🇲🇾 Ask Deal for any Deal across Malaysia</div><div id="siteTopbarRight">Updated daily · Local & national offers</div></div>';

    const header=document.querySelector('header');
    if(header){
      header.innerHTML='<div class="container nav"><div class="site-brand-wrap"><a class="site-logo-link" href="index.html" aria-label="Ask Deal home"><img class="site-logo" src="'+logo+'" alt="Ask Deal"></a></div><div class="nav-actions"><a class="btn btn-light" href="submit-deal.html">Submit Deal</a><a class="btn btn-primary" href="deals.html">Find Deals</a></div></div>';
    }

    document.querySelectorAll('.drawer,.drawer-backdrop').forEach(el=>el.remove());
    document.querySelectorAll('.menu-btn').forEach(el=>el.remove());

    const footer=document.querySelector('footer');
    if(footer) footer.innerHTML='<div class="container"><div class="footer-brandline"><b id="siteFooterBrand">Ask Deal</b> — <span id="siteFooterTagline">Ask Deal for any Deal</span></div><div id="siteSocialLinks" class="footer-social"></div></div>';

    ensureShellStyles();
    await applySettings();
  });

  function ensureShellStyles(){
    if(document.getElementById('askdeal-shell-style'))return;
    const style=document.createElement('style');style.id='askdeal-shell-style';style.textContent=`
      .site-brand-wrap{display:flex;align-items:center;min-width:0}.site-logo-link{display:flex;align-items:center;line-height:0}.site-logo{display:block;width:165px;max-width:42vw;height:auto;object-fit:contain}.nav{min-height:70px;height:70px;align-items:center}.nav-actions{display:flex;align-items:center;gap:10px}.footer-social{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.social-link{width:32px;height:32px;border-radius:10px;border:1px solid #e4e7ec;background:#f9fafb;display:inline-grid;place-items:center;font-weight:900;color:#344054;font-size:13px;transition:.18s}.social-link:hover{transform:translateY(-2px);background:#fff1f0;color:#b42318;border-color:#ffcdd2}@media(max-width:620px){.site-logo{width:138px;max-width:40vw}.nav{height:64px;min-height:64px}.nav-actions{gap:5px}.nav-actions .btn{padding:9px 8px;font-size:11px}.site-brand-wrap{flex-shrink:1}}
    `;document.head.appendChild(style);
  }

  async function applySettings(){
    try{
      if(!window.NAPS_SUPABASE) await loadScript('assets/supabase-config.js');
      const cfg=window.NAPS_SUPABASE;if(!cfg?.url||!cfg?.anonKey)return;
      const r=await fetch(cfg.url+'/rest/v1/site_settings?select=key,value',{headers:{apikey:cfg.anonKey,Authorization:'Bearer '+cfg.anonKey}});
      if(!r.ok)return;const data=await r.json();const s=Object.fromEntries((data||[]).map(x=>[x.key,x.value||'']));
      setText('siteTopbarLeft',s.topbar_left);setText('siteTopbarRight',s.topbar_right);setText('siteFooterBrand',s.footer_brand);setText('siteFooterTagline',s.footer_tagline);
      const socials=[['social_facebook','f','Facebook'],['social_instagram','◎','Instagram'],['social_linkedin','in','LinkedIn'],['social_youtube','▶','YouTube'],['social_tiktok','♪','TikTok'],['social_x','𝕏','X']];
      const host=document.getElementById('siteSocialLinks');if(host)host.innerHTML=socials.filter(([k])=>s[k]).map(([k,icon,label])=>'<a class="social-link" href="'+escAttr(s[k])+'" target="_blank" rel="noopener" aria-label="'+label+'" title="'+label+'">'+icon+'</a>').join('');
    }catch(e){console.warn('Ask Deal shell settings:',e)}
  }
  function setText(id,v){const el=document.getElementById(id);if(el&&v)el.textContent=v}
  function loadScript(src){return new Promise((resolve,reject)=>{const existing=[...document.scripts].find(s=>s.src.includes(src));if(existing){resolve();return}const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  function escAttr(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
})();
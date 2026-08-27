(async function(){
  // Replace text brand marks with the uploaded Ask Deal logo on the public site.
  const logoUrl='assets/askdeal-logo.png';
  document.querySelectorAll('.brand').forEach(el=>{
    const img=document.createElement('img');
    img.src=logoUrl;
    img.alt='Ask Deal';
    img.style.display='block';
    img.style.width=el.closest('.drawer-head')?'150px':'165px';
    img.style.maxWidth='42vw';
    img.style.height='auto';
    img.style.objectFit='contain';
    el.replaceChildren(img);
  });

  if(!window.NAPS_SUPABASE||typeof supabase==='undefined')return;
  const client=supabase.createClient(window.NAPS_SUPABASE.url,window.NAPS_SUPABASE.anonKey);
  const {data,error}=await client.from('site_settings').select('key,value');
  if(error||!data)return;
  const s=Object.fromEntries(data.map(x=>[x.key,x.value||'']));
  setText('siteTopbarLeft',s.topbar_left);setText('siteTopbarRight',s.topbar_right);setText('siteHeroTitle',s.hero_title);setText('siteHeroHighlight',s.hero_highlight);setText('siteHeroDescription',s.hero_description);setText('siteFooterBrand',s.footer_brand);setText('siteFooterTagline',s.footer_tagline);
  const socials=[['social_facebook','f','Facebook'],['social_instagram','◎','Instagram'],['social_linkedin','in','LinkedIn'],['social_youtube','▶','YouTube'],['social_tiktok','♪','TikTok'],['social_x','𝕏','X']];
  const host=document.getElementById('siteSocialLinks');if(host){host.innerHTML=socials.filter(([k])=>s[k]).map(([k,icon,label])=>`<a class="social-link" href="${attr(s[k])}" target="_blank" rel="noopener" aria-label="${label}" title="${label}">${icon}</a>`).join('');}
  function setText(id,v){const el=document.getElementById(id);if(el&&v)el.textContent=v}
  function attr(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
})();
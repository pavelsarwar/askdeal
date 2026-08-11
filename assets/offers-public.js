(async function(){
  const grid=document.getElementById('dealGrid');
  if(!grid||!window.NAPS_SUPABASE||typeof supabase==='undefined')return;
  const client=supabase.createClient(window.NAPS_SUPABASE.url,window.NAPS_SUPABASE.anonKey);
  let allOffers=[];
  try{
    const {data,error}=await client.from('deals').select('id,title,slug,description,image_url,discount_text,start_at,end_at,offer_type,location_text,city,featured,category_id,state_id,merchant_id,categories(name),states(name),merchants(name)').eq('status','published').order('featured',{ascending:false}).order('start_at',{ascending:false});
    if(error)throw error;
    allOffers=data||[];
    if(!allOffers.length)return; // Keep prototype fallback until first CMS post is published.
    window.NAPS_OFFERS=allOffers;
    bindCmsFilters();renderCmsOffers();
  }catch(e){console.warn('NAPS Offers CMS fallback:',e)}

  function bindCmsFilters(){
    ['keyword','state','category','period','sort'].forEach(id=>{const el=document.getElementById(id);if(el)el.onchange=renderCmsOffers;if(el&&id==='keyword')el.oninput=renderCmsOffers});
    const params=new URLSearchParams(location.search);
    const period=params.get('period'),type=params.get('type'),q=params.get('q');
    if(q&&document.getElementById('keyword'))document.getElementById('keyword').value=q;
    if(period&&document.getElementById('period'))document.getElementById('period').value=period;
    if(type)window.NAPS_QUICK_TYPE=type;
  }
  function renderCmsOffers(){
    const kw=(document.getElementById('keyword')?.value||'').toLowerCase().trim();
    const state=document.getElementById('state')?.value||'';
    const cat=document.getElementById('category')?.value||'';
    const period=document.getElementById('period')?.value||'';
    const sort=document.getElementById('sort')?.value||'recommended';
    const now=new Date(),weekEnd=new Date(now.getTime()+7*86400000);
    let list=allOffers.filter(o=>{
      const hay=(o.title+' '+(o.description||'')+' '+(o.merchants?.name||'')+' '+(o.categories?.name||'')+' '+(o.location_text||'')+' '+(o.city||'')).toLowerCase();
      if(kw&&!hay.includes(kw))return false;
      if(state&&(o.states?.name||'')!==state)return false;
      if(cat&&(o.categories?.name||'')!==cat)return false;
      const s=o.start_at?new Date(o.start_at):null,e=o.end_at?new Date(o.end_at):null;
      if(period==='now'&&!((!s||s<=now)&&(!e||e>=now)))return false;
      if(period==='week'&&!((!e||e>=now)&&(!s||s<=weekEnd)))return false;
      if(period==='upcoming'&&!(s&&s>now))return false;
      if(period==='clearance'&&o.offer_type!=='clearance')return false;
      if(period==='freebies'&&!['promotion','freebie'].includes(o.offer_type))return false;
      if(window.NAPS_QUICK_TYPE==='clearance'&&o.offer_type!=='clearance')return false;
      if(window.NAPS_QUICK_TYPE==='promotion_freebie'&&!['promotion','freebie'].includes(o.offer_type))return false;
      return true;
    });
    if(sort==='ending')list.sort((a,b)=>(new Date(a.end_at||'2999-01-01'))-(new Date(b.end_at||'2999-01-01')));
    grid.innerHTML=list.map(o=>`<article class="deal"><div class="deal-img" style="${o.image_url?`background-image:url('${cssUrl(o.image_url)}');background-size:cover;background-position:center`:''}"><div>${o.image_url?'':`<div style="font-size:38px">🔥</div><div class="merchant">${esc(o.merchants?.name||'NAPS Offer')}</div>`}</div><span class="badge">${o.featured?'FEATURED':typeLabel(o.offer_type)}</span></div><div class="deal-body"><div class="tag">${esc(o.categories?.name||typeLabel(o.offer_type))}</div><h3>${esc(o.title)}</h3><div style="color:#667085;font-size:13px">${esc(o.description||'')}</div><div class="meta"><span>📍 ${esc(o.location_text||o.city||o.states?.name||'Malaysia')}</span>${o.end_at?`<span>⏰ Ends ${new Date(o.end_at).toLocaleDateString('en-MY')}</span>`:''}</div><div class="price-row"><div class="discount">${esc(o.discount_text||typeLabel(o.offer_type))}</div><a class="view" href="offer.html?id=${encodeURIComponent(o.id)}">View offer →</a></div></div></article>`).join('');
    if(!list.length)grid.innerHTML='<div class="card" style="grid-column:1/-1;text-align:center"><h3>No matching offers found</h3><p>Try another category, location or date filter.</p></div>';
    const c=document.getElementById('resultCount');if(c)c.textContent=list.length+' published offers found';
  }
  function typeLabel(v){return ({sale:'SALE',clearance:'CLEARANCE',promotion:'PROMOTION',freebie:'FREEBIE'})[v]||'OFFER'}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function cssUrl(v){return String(v).replace(/["'()\\]/g,'')}
})();

(async function(){
  const catHost=document.getElementById('dynamicCategoryList'),offerHost=document.getElementById('homeAvailableOffers');
  if((!catHost&&!offerHost)||!window.NAPS_SUPABASE||typeof supabase==='undefined')return;
  const client=supabase.createClient(window.NAPS_SUPABASE.url,window.NAPS_SUPABASE.anonKey);
  let categories=[],offers=[];
  try{
    const [cRes,oRes]=await Promise.all([
      client.from('categories').select('id,name,active').eq('active',true).order('id',{ascending:false}).limit(30),
      client.from('deals').select('id,title,description,image_url,discount_text,offer_type,start_at,end_at,category_id,merchants(name)').eq('status','published').order('start_at',{ascending:false}).limit(24)
    ]);
    categories=cRes.data||[];offers=oRes.data||[];
    if(catHost){
      catHost.innerHTML=categories.length?categories.map(c=>`<button class="catalog-chip" data-cat="${c.id}" onclick="filterHomeCatalog('${c.id}',this)">${esc(c.name)}</button>`).join(''):'<span class="hint">No categories available yet.</span>';
    }
    window.__askDealHomeOffers=offers;
    renderHomeOffers('');
  }catch(e){if(offerHost)offerHost.innerHTML='<div class="card"><p>Offers are being updated. Please try again shortly.</p></div>'}

  window.filterHomeCatalog=function(id,btn){document.querySelectorAll('.catalog-chip').forEach(x=>x.classList.remove('active'));if(btn)btn.classList.add('active');renderHomeOffers(id)};
  function renderHomeOffers(catId){if(!offerHost)return;const now=Date.now();let list=offers.filter(o=>!catId||String(o.category_id)===String(catId));list=list.filter(o=>!o.end_at||new Date(o.end_at).getTime()>=now).slice(0,9);offerHost.innerHTML=list.length?list.map(o=>`<article class="deal naps-native-card"><div class="deal-img" style="${o.image_url?`background-image:url('${escAttr(o.image_url)}');background-size:cover;background-position:center`:''}"><div class="merchant">${o.image_url?'':esc(o.merchants?.name||'Ask Deal')}</div><span class="badge">${esc(prettyType(o.offer_type))}</span></div><div class="deal-body"><div class="tag">${esc(o.merchants?.name||'Offer')}</div><h3>${esc(o.title)}</h3><div style="color:#667085;font-size:13px;min-height:38px">${esc(o.description||'')}</div><div class="price-row"><div class="discount">${esc(o.discount_text||'View Deal')}</div><a class="view" href="deal-detail.html?id=${encodeURIComponent(o.id)}">View deal →</a></div></div></article>`).join(''):'<div class="card" style="grid-column:1/-1;text-align:center"><h3>No available offers in this category</h3><p>Try another category or view all deals.</p></div>'}
  function prettyType(v){return({sale:'SALE',warehouse:'WAREHOUSE',clearance:'CLEARANCE',promotion:'PROMOTION',freebie:'FREEBIE'})[v]||'OFFER'}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function escAttr(v){return esc(v)}
})();
(async function(){
 const host=document.getElementById('libraryGrid');if(!host)return;
 const mode=document.body.dataset.libraryMode||'saved';
 const savedIds=JSON.parse(localStorage.getItem('naps_saved_offers_v2')||'[]');
 const recent=JSON.parse(localStorage.getItem('naps_recent_offers_v2')||'[]');
 let ids=mode==='saved'?savedIds:recent.map(x=>String(x.id));
 if(!ids.length){empty();return}
 let rows=[];
 if(window.NAPS_SUPABASE&&typeof supabase!=='undefined'){
   try{const client=supabase.createClient(window.NAPS_SUPABASE.url,window.NAPS_SUPABASE.anonKey);const {data}=await client.from('deals').select('id,title,description,image_url,discount_text,end_at,location_text,city,offer_type,merchants(name),states(name),categories(name)').in('id',ids).eq('status','published');rows=data||[]}catch(e){console.warn(e)}
 }
 if(!rows.length){const fallback=mode==='saved'?JSON.parse(localStorage.getItem('naps_saved_meta_v2')||'[]'):recent;rows=fallback.map(x=>({id:x.id,title:x.title,description:'',image_url:x.image_url,discount_text:x.discount_text,location_text:x.location,merchants:{name:x.merchant}}))}
 const order=new Map(ids.map((id,i)=>[String(id),i]));rows.sort((a,b)=>(order.get(String(a.id))??999)-(order.get(String(b.id))??999));
 host.innerHTML=rows.map(o=>`<article class="deal naps-native-card"><div class="deal-img" style="${o.image_url?`background-image:url('${safeUrl(o.image_url)}');background-size:cover;background-position:center`:''}">${mode==='saved'?`<button class="naps-save-btn saved" data-save-offer="${o.id}" onclick="napsToggleSaved('${o.id}');setTimeout(()=>location.reload(),120)">♥</button>`:''}<div>${o.image_url?'':`<div style="font-size:38px">🔥</div><div class="merchant">${esc(o.merchants?.name||'NAPS')}</div>`}</div><span class="badge">${esc((o.offer_type||'offer').toUpperCase())}</span></div><div class="deal-body"><div class="tag">${esc(o.categories?.name||'Offer')}</div><h3>${esc(o.title)}</h3>${o.description?`<div style="color:#667085;font-size:13px">${esc(o.description)}</div>`:''}<div class="meta"><span>📍 ${esc(o.location_text||o.city||o.states?.name||'Malaysia')}</span>${mode==='recent'?`<span>🕘 Recently viewed</span>`:''}</div><div class="price-row"><div class="discount">${esc(o.discount_text||'View deal')}</div><div class="naps-card-actions"><button onclick="napsShare('${js(o.title)}','${location.origin+location.pathname.replace(/[^/]+$/,'offer.html?id='+encodeURIComponent(o.id))}')">↗</button><a class="view" href="offer.html?id=${encodeURIComponent(o.id)}">Open →</a></div></div></div></article>`).join('');
 function empty(){host.innerHTML=`<div class="card naps-empty" style="grid-column:1/-1"><div class="emoji">${mode==='saved'?'♡':'🕘'}</div><h3>${mode==='saved'?'No saved deals yet':'No recently viewed offers yet'}</h3><p>${mode==='saved'?'Tap the heart on any offer to keep it here.':'Open an offer and it will appear here automatically.'}</p><a class="btn btn-primary" href="deals.html">Browse Deals</a></div>`}
 function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function safeUrl(v){return String(v||'').replace(/["'()\\]/g,'')}function js(v){return String(v??'').replace(/[\\']/g,'')}
})();

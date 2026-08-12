(async function(){
 const host=document.getElementById('offerDetail');if(!host||!window.NAPS_SUPABASE||typeof supabase==='undefined')return;
 const id=new URLSearchParams(location.search).get('id');if(!id){host.innerHTML='<h2>Offer not found</h2>';return}
 const client=supabase.createClient(window.NAPS_SUPABASE.url,window.NAPS_SUPABASE.anonKey);
 const {data:o,error}=await client.from('deals').select('*,categories(name),states(name),merchants(name)').eq('id',id).eq('status','published').single();
 if(error||!o){host.innerHTML='<h2>Offer not found</h2><p>This offer may have expired or is not published.</p>';return}
 document.title=o.title+' | NAPS';
 const meta={title:o.title,merchant:o.merchants?.name||'NAPS',location:o.location_text||o.city||o.states?.name||'Malaysia',image_url:o.image_url||'',discount_text:o.discount_text||''};
 host.innerHTML=`<div class="tag">${esc(o.categories?.name||'Offer')}</div><h1 style="font-size:38px;margin:8px 0">${esc(o.title)}</h1><div class="offer-meta"><span>🏪 ${esc(o.merchants?.name||'NAPS')}</span><span>📍 ${esc(o.location_text||o.city||o.states?.name||'Malaysia')}</span>${o.start_at?`<span>📅 ${new Date(o.start_at).toLocaleDateString('en-MY')}</span>`:''}${o.end_at?`<span>⏰ Until ${new Date(o.end_at).toLocaleDateString('en-MY')}</span>`:''}</div><div class="naps-detail-actions"><button id="detailSaveBtn" data-save-offer="${o.id}" onclick='napsToggleSaved("${o.id}",${JSON.stringify(meta).replace(/'/g,"&#39;")})'>♡ Save</button><button onclick="napsShare('${js(o.title)}',location.href)">↗ Share</button><a href="saved.html">♥ Saved Deals</a></div>${o.discount_text?`<div class="discount" style="margin:14px 0">${esc(o.discount_text)}</div>`:''}${o.image_url?`<img class="offer-cover" src="${attr(o.image_url)}" alt="${attr(o.title)}">`:''}${o.description?`<p class="lead">${esc(o.description)}</p>`:''}<div class="offer-content">${o.content_html||''}</div>${o.source_url?`<div class="offer-source"><a class="btn btn-primary" href="${attr(o.source_url)}" target="_blank" rel="noopener">Official / Source Link</a></div>`:''}`;
 const recent={id:o.id,title:o.title,merchant:o.merchants?.name||'NAPS',location:o.location_text||o.city||o.states?.name||'Malaysia',image_url:o.image_url||'',discount_text:o.discount_text||''};
 const ready=()=>{window.napsRecordRecent?.(recent);window.napsRefreshSaveButtons?.();const b=document.getElementById('detailSaveBtn');if(b&&window.napsIsSaved?.(o.id)){b.classList.add('saved');b.textContent='♥ Saved'}};
 if(window.napsRecordRecent)ready();else setTimeout(ready,500);
 function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 function attr(v){return esc(v)}function js(v){return String(v??'').replace(/[\\']/g,'').replace(/\n/g,' ')}
})();

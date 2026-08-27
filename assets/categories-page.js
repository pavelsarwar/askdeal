(async function(){
  const host=document.getElementById('dynamicCategoriesGrid');
  if(!host||!window.NAPS_SUPABASE||typeof supabase==='undefined')return;
  const client=supabase.createClient(window.NAPS_SUPABASE.url,window.NAPS_SUPABASE.anonKey);
  // Only request columns that are guaranteed by the current Ask Deal category schema.
  const {data,error}=await client.from('categories').select('id,name,active').eq('active',true).order('name',{ascending:true});
  if(error){host.innerHTML=`<div class="card" style="grid-column:1/-1"><h3>Unable to load categories</h3><p>${esc(error.message)}</p></div>`;return;}
  const rows=data||[];
  const count=document.getElementById('categoryCount');if(count)count.textContent=`${rows.length} active ${rows.length===1?'category':'categories'}`;
  if(!rows.length){host.innerHTML='<div class="card" style="grid-column:1/-1;text-align:center"><h3>No categories available</h3><p>Add categories from Ask Deal Admin.</p></div>';return;}
  host.innerHTML=rows.map(c=>`<a class="category" href="deals.html?category=${encodeURIComponent(c.id)}"><div class="ico">${categoryIcon(c.name)}</div><b>${esc(c.name)}</b><small>View available offers</small></a>`).join('');
  function categoryIcon(name){const n=String(name||'').toLowerCase();if(/food|restaurant|dining/.test(n))return'🍽️';if(/grocery|market/.test(n))return'🛒';if(/electronic|tech|computer|mobile/.test(n))return'💻';if(/sport|fitness/.test(n))return'👟';if(/movie|cinema/.test(n))return'🎬';if(/event|fair|expo|exhibition/.test(n))return'🎪';if(/travel|tour/.test(n))return'✈️';if(/opportun|job|career/.test(n))return'🚀';if(/beauty|pharmacy|health/.test(n))return'💄';if(/fashion|cloth|apparel/.test(n))return'👕';if(/home|furniture/.test(n))return'🏠';return'🏷️'}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
})();
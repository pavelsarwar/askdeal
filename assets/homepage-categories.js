(async function(){
  const host=document.getElementById('homeCategoryGrid')||document.querySelector('.category-grid');
  if(!host)return;
  host.id='homeCategoryGrid';
  host.innerHTML='<div class="card" style="grid-column:1/-1;text-align:center"><p>Loading categories...</p></div>';
  if(!window.NAPS_SUPABASE||typeof supabase==='undefined'){host.innerHTML='<div class="card" style="grid-column:1/-1;text-align:center"><h3>No categories yet</h3></div>';return;}
  const client=supabase.createClient(window.NAPS_SUPABASE.url,window.NAPS_SUPABASE.anonKey);
  const {data,error}=await client.from('categories').select('id,name,active').eq('active',true).order('name',{ascending:true}).limit(8);
  if(error){host.innerHTML='<div class="card" style="grid-column:1/-1;text-align:center"><h3>Categories unavailable</h3><p>Please try again later.</p></div>';return;}
  const rows=data||[];
  if(!rows.length){host.innerHTML='<div class="card" style="grid-column:1/-1;text-align:center"><h3>No categories yet</h3><p>Categories added from Ask Deal Admin will appear here.</p></div>';return;}
  host.innerHTML=rows.map(c=>`<a class="category" href="deals.html?category=${encodeURIComponent(c.id)}"><div class="ico">${icon(c.name)}</div><b>${esc(c.name)}</b><small>View available offers</small></a>`).join('');
  function icon(name){const n=String(name||'').toLowerCase();if(/food|restaurant|dining/.test(n))return'🍽️';if(/grocery|market/.test(n))return'🛒';if(/electronic|tech|computer|mobile/.test(n))return'💻';if(/sport|fitness/.test(n))return'👟';if(/movie|cinema/.test(n))return'🎬';if(/event|fair|expo|exhibition/.test(n))return'🎪';if(/travel|tour/.test(n))return'✈️';if(/opportun|job|career/.test(n))return'🚀';if(/beauty|pharmacy|health/.test(n))return'💄';if(/fashion|cloth|apparel/.test(n))return'👕';if(/home|furniture/.test(n))return'🏠';return'🏷️'}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
})();
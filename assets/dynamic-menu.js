// NAPS dynamic navigation powered by Supabase.
// Falls back to the existing hard-coded drawer if Supabase/menu_items is unavailable.
(async function(){
  const drawer=document.getElementById('drawer');
  if(!drawer||!window.NAPS_SUPABASE||typeof supabase==='undefined')return;
  try{
    const client=supabase.createClient(window.NAPS_SUPABASE.url,window.NAPS_SUPABASE.anonKey);
    const {data,error}=await client.from('menu_items').select('id,title,url,icon,parent_id,menu_location,sort_order,active,open_new_tab').eq('menu_location','drawer').eq('active',true).order('sort_order',{ascending:true});
    if(error||!data||!data.length)return;
    const head=drawer.querySelector('.drawer-head')?.outerHTML||'';
    const byParent={};data.forEach(x=>{const k=x.parent_id||'root';(byParent[k]||(byParent[k]=[])).push(x)});
    const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    function render(items,depth=0){return (items||[]).map(item=>{
      const children=byParent[item.id]||[];
      const active=(item.url||'').split('?')[0].toLowerCase()===current?' active':'';
      const target=item.open_new_tab?' target="_blank" rel="noopener"':'';
      const indent=depth?`padding-left:${22+depth*18}px;font-size:${Math.max(12,14-depth)}px`:'';
      return `<a class="${active.trim()}" href="${escapeAttr(item.url||'#')}"${target} style="${indent}"><span>${escapeHtml(item.icon||'•')}</span>${escapeHtml(item.title)}</a>${render(children,depth+1)}`;
    }).join('')}
    drawer.innerHTML=head+'<div class="section-label">Explore</div>'+render(byParent.root||[]);
  }catch(e){console.warn('NAPS dynamic menu fallback:',e)}
  function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function escapeAttr(v){return escapeHtml(v)}
})();

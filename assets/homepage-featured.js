(async function(){
  const host=document.getElementById('nearbyDealsList');
  const banner=document.getElementById('homepageHighlight');
  if((!host&&!banner)||!window.NAPS_SUPABASE||typeof supabase==='undefined')return;
  const client=supabase.createClient(window.NAPS_SUPABASE.url,window.NAPS_SUPABASE.anonKey);
  const now=new Date().toISOString();
  try{
    if(banner){
      const {data:s}=await client.from('homepage_settings').select('*').eq('id',1).single();
      if(s&&s.active){
        document.getElementById('homeHighlightEyebrow').textContent=s.eyebrow||'HAPPENING NOW';
        document.getElementById('homeHighlightTitle').textContent=s.title||'';
        document.getElementById('homeHighlightSubtitle').textContent=s.subtitle||'';
        banner.style.cursor='pointer';
        banner.onclick=()=>{if(s.link_url)location.href=s.link_url};
      }else if(s&&!s.active){banner.style.display='none';}
    }

    const {data,error}=await client.from('deals')
      .select('id,title,description,image_url,discount_text,location_text,city,start_at,end_at,latitude,longitude,merchants(name),states(name)')
      .eq('status','published').eq('featured',true)
      .or(`end_at.is.null,end_at.gte.${now}`)
      .order('start_at',{ascending:false}).limit(12);
    if(error||!data?.length)return;

    let rows=data.slice();
    const render=(list,userPos=null)=>{
      const top=list.slice(0,3);
      host.innerHTML=top.map(d=>{
        const distance=userPos&&d.latitude!=null&&d.longitude!=null?haversine(userPos.lat,userPos.lng,Number(d.latitude),Number(d.longitude)):null;
        const place=d.location_text||d.city||d.states?.name||'Malaysia';
        const sub=distance!=null?`${distance<1?Math.round(distance*1000)+'m':distance.toFixed(1)+'km'} · ${place}`:place;
        const icon=d.image_url?`<img src="${escAttr(d.image_url)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:12px">`:'🏷️';
        return `<a class="mini-deal" href="deal-detail.html?id=${encodeURIComponent(d.id)}" style="color:inherit;text-decoration:none"><div class="mini-icon">${icon}</div><div><b>${esc(d.title)}</b><br><small>${esc(sub)}</small></div></a>`;
      }).join('');
    };
    render(rows);

    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos=>{
        const user={lat:pos.coords.latitude,lng:pos.coords.longitude};
        const withD=rows.map(x=>({...x,_distance:(x.latitude!=null&&x.longitude!=null)?haversine(user.lat,user.lng,Number(x.latitude),Number(x.longitude)):999999})).sort((a,b)=>a._distance-b._distance);
        render(withD,user);
      },()=>{}, {enableHighAccuracy:false,timeout:3500,maximumAge:600000});
    }
  }catch(e){console.warn('Homepage featured fallback:',e)}

  function haversine(lat1,lon1,lat2,lon2){const R=6371,toRad=x=>x*Math.PI/180;const dLat=toRad(lat2-lat1),dLon=toRad(lon2-lon1);const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(a));}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function escAttr(v){return esc(v)}
})();

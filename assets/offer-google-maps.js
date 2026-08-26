(function(){
  function ensureFields(){
    const loc=document.getElementById('offerLocation');
    if(!loc||document.getElementById('offerGoogleMapsUrl'))return;
    const wrap=loc.closest('.field');
    wrap.insertAdjacentHTML('afterend',`
      <div class="field">
        <label>Google Maps Link <span style="font-weight:400;color:#98a2b3">(optional)</span></label>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input id="offerGoogleMapsUrl" type="url" placeholder="Paste full Google Maps link" style="flex:1;min-width:180px">
          <button type="button" class="btn btn-light" onclick="askDealExtractMapCoordinates()">Extract Coordinates</button>
        </div>
        <div id="offerMapsHint" class="hint">No Google API needed. Paste a full Google Maps URL containing coordinates, then click Extract Coordinates.</div>
      </div>
      <div class="field">
        <label>Address / Landmark Details <span style="font-weight:400;color:#98a2b3">(optional)</span></label>
        <input id="offerFormattedAddress" placeholder="e.g. Mid Valley Megamall, Lingkaran Syed Putra, Kuala Lumpur">
      </div>
    `);
  }

  function parseCoordinates(raw){
    if(!raw)return null;
    let text=String(raw).trim();
    try{text=decodeURIComponent(text)}catch(e){}
    const patterns=[
      /@(-?\d{1,2}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
      /[?&](?:q|query|ll|center|destination)=(-?\d{1,2}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/i,
      /!3d(-?\d{1,2}(?:\.\d+)?).*?!4d(-?\d{1,3}(?:\.\d+)?)/,
      /(-?\d{1,2}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/
    ];
    for(const p of patterns){
      const m=text.match(p);
      if(m){
        const lat=Number(m[1]),lng=Number(m[2]);
        if(Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180)return {lat,lng};
      }
    }
    return null;
  }

  window.askDealExtractMapCoordinates=function(){
    const url=document.getElementById('offerGoogleMapsUrl')?.value?.trim()||'';
    const hint=document.getElementById('offerMapsHint');
    const coords=parseCoordinates(url);
    if(!coords){
      if(hint)hint.innerHTML='Could not find coordinates in this link. If it is a short <b>maps.app.goo.gl</b> link, open it first in your browser and copy the expanded Google Maps URL, or enter Latitude/Longitude manually.';
      return;
    }
    const lat=document.getElementById('offerLatitude'),lng=document.getElementById('offerLongitude');
    if(lat)lat.value=coords.lat.toFixed(7);
    if(lng)lng.value=coords.lng.toFixed(7);
    if(hint)hint.textContent=`Coordinates found ✓ ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
  };

  const obs=new MutationObserver(()=>ensureFields());
  obs.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',ensureFields);

  window.saveOffer=async function(e){
    e.preventDefault();
    const title=document.getElementById('offerTitle').value.trim();
    const obj={
      title,slug:slugify(title)+'-'+Date.now().toString().slice(-6),
      category_id:numOrNull('offerCategory'),merchant_id:valueOrNull('offerMerchant'),state_id:numOrNull('offerState'),
      offer_type:document.getElementById('offerType').value,status:document.getElementById('offerStatus').value,
      featured:document.getElementById('offerFeatured').checked,image_url:valueOrNull('offerFeaturedImage'),
      description:valueOrNull('offerDescription'),content_html:offerEditor.root.innerHTML,
      location_text:valueOrNull('offerLocation'),formatted_address:valueOrNull('offerFormattedAddress'),
      google_maps_url:valueOrNull('offerGoogleMapsUrl'),city:valueOrNull('offerCity'),discount_text:valueOrNull('offerDiscount'),
      latitude:numberValueOrNull('offerLatitude'),longitude:numberValueOrNull('offerLongitude'),
      start_at:dateOrNull('offerStart'),end_at:dateOrNull('offerEnd'),source_url:valueOrNull('offerSource')
    };
    let result;
    if(offerEditingId){delete obj.slug;result=await db.from('deals').update(obj).eq('id',offerEditingId)}else result=await db.from('deals').insert(obj);
    if(result.error)return setMsg('offerSaveMsg',result.error.message);
    showOffersCMS();
  };
})();
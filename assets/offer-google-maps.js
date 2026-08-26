(function(){
  let autocomplete=null;
  function ensureFields(){
    const loc=document.getElementById('offerLocation');
    if(!loc||document.getElementById('offerFormattedAddress'))return;
    const wrap=loc.closest('.field');
    wrap.insertAdjacentHTML('afterend',`<div class="field"><label>Google Maps Address</label><input id="offerFormattedAddress" placeholder="Auto-filled from Google Maps"><input id="offerGooglePlaceId" type="hidden"><input id="offerGoogleMapsUrl" type="hidden"><div id="offerMapsHint" class="hint">Type a place or landmark above and choose a Google suggestion. Address and coordinates will fill automatically.</div></div>`);
    initPlaces();
  }
  function loadGoogle(){
    const key=window.ASK_DEAL_GOOGLE_MAPS_API_KEY||'';
    if(!key){const h=document.getElementById('offerMapsHint');if(h)h.textContent='Google autocomplete is ready but needs a Google Maps API key. Manual address and coordinates still work.';return;}
    if(window.google?.maps?.places)return initPlaces();
    if(document.getElementById('askDealGoogleMapsJs'))return;
    const s=document.createElement('script');s.id='askDealGoogleMapsJs';s.async=true;s.defer=true;s.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&callback=askDealInitPlaces`;document.head.appendChild(s);
  }
  window.askDealInitPlaces=initPlaces;
  function initPlaces(){
    ensureFields();
    const input=document.getElementById('offerLocation');
    if(!input||!window.google?.maps?.places||autocomplete)return loadGoogle();
    autocomplete=new google.maps.places.Autocomplete(input,{componentRestrictions:{country:'my'},fields:['place_id','name','formatted_address','geometry','url','address_components']});
    autocomplete.addListener('place_changed',()=>{
      const p=autocomplete.getPlace();if(!p?.geometry?.location)return;
      input.value=p.name||input.value;
      const addr=document.getElementById('offerFormattedAddress');if(addr)addr.value=p.formatted_address||'';
      const pid=document.getElementById('offerGooglePlaceId');if(pid)pid.value=p.place_id||'';
      const gurl=document.getElementById('offerGoogleMapsUrl');if(gurl)gurl.value=p.url||'';
      const lat=document.getElementById('offerLatitude'),lng=document.getElementById('offerLongitude');if(lat)lat.value=p.geometry.location.lat();if(lng)lng.value=p.geometry.location.lng();
      const city=document.getElementById('offerCity');if(city&&!city.value){const c=(p.address_components||[]).find(x=>x.types.includes('locality'))||(p.address_components||[]).find(x=>x.types.includes('administrative_area_level_2'));if(c)city.value=c.long_name;}
      const h=document.getElementById('offerMapsHint');if(h)h.textContent='Google Maps location selected ✓ Address and coordinates captured.';
    });
  }
  const obs=new MutationObserver(()=>ensureFields());obs.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',ensureFields);
  const originalSave=window.saveOffer;
  window.saveOffer=async function(e){
    e.preventDefault();
    const title=document.getElementById('offerTitle').value.trim();
    const obj={title,slug:slugify(title)+'-'+Date.now().toString().slice(-6),category_id:numOrNull('offerCategory'),merchant_id:valueOrNull('offerMerchant'),state_id:numOrNull('offerState'),offer_type:document.getElementById('offerType').value,status:document.getElementById('offerStatus').value,featured:document.getElementById('offerFeatured').checked,image_url:valueOrNull('offerFeaturedImage'),description:valueOrNull('offerDescription'),content_html:offerEditor.root.innerHTML,location_text:valueOrNull('offerLocation'),formatted_address:valueOrNull('offerFormattedAddress'),google_place_id:valueOrNull('offerGooglePlaceId'),google_maps_url:valueOrNull('offerGoogleMapsUrl'),city:valueOrNull('offerCity'),discount_text:valueOrNull('offerDiscount'),latitude:numberValueOrNull('offerLatitude'),longitude:numberValueOrNull('offerLongitude'),start_at:dateOrNull('offerStart'),end_at:dateOrNull('offerEnd'),source_url:valueOrNull('offerSource')};
    let result;if(offerEditingId){delete obj.slug;result=await db.from('deals').update(obj).eq('id',offerEditingId)}else result=await db.from('deals').insert(obj);if(result.error)return setMsg('offerSaveMsg',result.error.message);showOffersCMS();
  };
})();
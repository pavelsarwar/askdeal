(function(){
  const originalOpen=window.openOfferEditor;
  const originalSave=window.saveOffer;
  if(typeof originalOpen==='function'){
    window.openOfferEditor=async function(record=null){
      await originalOpen(record);
      injectGallery(record);
    };
  }
  if(typeof originalSave==='function'){
    window.saveOffer=async function(e){
      e.preventDefault();
      const title=document.getElementById('offerTitle')?.value.trim();
      if(!title)return setMsg('offerSaveMsg','Please enter an offer title.');
      const gallery=getGalleryUrls();
      const featured=gallery[0]||valueOrNull('offerFeaturedImage');
      const obj={
        title,
        slug:offerSlug(title)+'-'+Date.now().toString().slice(-6),
        category_id:document.getElementById('offerCategory')?.value||null,
        merchant_id:document.getElementById('offerMerchant')?.value||null,
        mall_id:document.getElementById('offerMall')?.value||null,
        offer_type:document.getElementById('offerType').value,
        status:document.getElementById('offerStatus').value,
        featured:document.getElementById('offerFeatured').checked,
        image_url:featured||null,
        gallery_images:gallery.slice(1),
        description:valueOrNull('offerDescription'),
        content_html:offerEditor.root.innerHTML,
        discount_text:valueOrNull('offerDiscount'),
        start_at:dateOrNull('offerStart'),
        end_at:dateOrNull('offerEnd'),
        source_url:valueOrNull('offerSource')
      };
      let result;
      if(offerEditingId){delete obj.slug;result=await db.from('deals').update(obj).eq('id',offerEditingId)}
      else result=await db.from('deals').insert(obj);
      if(result.error)return setMsg('offerSaveMsg',result.error.message);
      showOffersCMS();
    };
  }

  function injectGallery(record){
    const featuredField=document.getElementById('offerFeaturedImage')?.closest('.field');
    if(!featuredField)return;
    const existing=[record?.image_url,...normalizeGallery(record?.gallery_images)].filter(Boolean);
    featuredField.innerHTML=`<label>Offer Photos</label><div class="hint" style="margin:0 0 10px">First photo is the featured image. Add more photos for the deal gallery.</div><div id="offerGalleryRows"></div><button type="button" class="btn btn-light" style="margin-top:10px" onclick="addOfferGalleryRow()">+ Add Photo</button>`;
    if(!document.getElementById('offer-gallery-admin-style')){
      const s=document.createElement('style');s.id='offer-gallery-admin-style';s.textContent=`.offer-gallery-row{display:grid;grid-template-columns:110px minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px;border:1px solid #e5e9f0;border-radius:12px;margin-bottom:10px;background:#f9fafb}.offer-gallery-thumb{width:110px;height:78px;border-radius:10px;overflow:hidden;background:#eef2f6;display:grid;place-items:center;color:#98a2b3;font-size:11px}.offer-gallery-thumb img{width:100%;height:100%;object-fit:cover}.offer-gallery-controls{display:flex;gap:8px;flex-wrap:wrap}.offer-gallery-row input[type=url]{width:100%}@media(max-width:700px){.offer-gallery-row{grid-template-columns:84px 1fr}.offer-gallery-thumb{width:84px;height:64px}.offer-gallery-controls{grid-column:1/-1}}`;
      document.head.appendChild(s);
    }
    if(existing.length)existing.forEach(url=>addOfferGalleryRow(url));else addOfferGalleryRow('');
  }

  window.addOfferGalleryRow=function(url=''){
    const host=document.getElementById('offerGalleryRows');if(!host)return;
    const row=document.createElement('div');row.className='offer-gallery-row';
    row.innerHTML=`<div class="offer-gallery-thumb">${url?`<img src="${attr(url)}" alt="Offer photo">`:'No photo'}</div><div><input class="offer-gallery-url" type="url" value="${attr(url)}" placeholder="Image URL"><input class="offer-gallery-file" type="file" accept="image/*" style="display:none"><div class="hint">${host.children.length===0?'Featured image':'Gallery image'}</div></div><div class="offer-gallery-controls"><button type="button" class="btn btn-light upload-btn">Upload</button><button type="button" class="btn btn-light remove-btn">Remove</button></div>`;
    const urlInput=row.querySelector('.offer-gallery-url');
    const fileInput=row.querySelector('.offer-gallery-file');
    row.querySelector('.upload-btn').onclick=()=>fileInput.click();
    row.querySelector('.remove-btn').onclick=()=>{row.remove();refreshLabels();};
    fileInput.onchange=async()=>{const file=fileInput.files?.[0];if(!file)return;const uploaded=await uploadOfferImage(file);if(uploaded){urlInput.value=uploaded;setThumb(row,uploaded)}};
    urlInput.addEventListener('change',()=>setThumb(row,urlInput.value.trim()));
    host.appendChild(row);refreshLabels();
  };

  function setThumb(row,url){const box=row.querySelector('.offer-gallery-thumb');box.innerHTML=url?`<img src="${attr(url)}" alt="Offer photo">`:'No photo';}
  function refreshLabels(){document.querySelectorAll('#offerGalleryRows .offer-gallery-row').forEach((r,i)=>{const h=r.querySelector('.hint');if(h)h.textContent=i===0?'Featured image':'Gallery image';});}
  function getGalleryUrls(){return [...document.querySelectorAll('.offer-gallery-url')].map(x=>x.value.trim()).filter(Boolean);}
  function normalizeGallery(v){if(Array.isArray(v))return v;if(typeof v==='string'){try{const p=JSON.parse(v);return Array.isArray(p)?p:[]}catch{return[]}}return[];}
})();
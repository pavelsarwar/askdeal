let merchantEditingId=null;

async function showMerchantManagement(){
  moduleCard.innerHTML=`<div class="deals-head"><div><h2 style="margin:0">Merchant / Shop / Mall</h2><div class="result-count">Save location details once and reuse them in Add Offer</div></div><button class="btn btn-primary" onclick="openMerchantEditor()">+ Add Merchant / Shop / Mall</button></div><div id="merchantRows">Loading...</div>`;
  const {data,error}=await db.from('merchants').select('*').order('name');
  const host=document.getElementById('merchantRows');
  if(error){host.innerHTML=`<p>${escapeMerchant(error.message)}</p>`;return;}
  host.innerHTML=`<div style="overflow:auto"><table class="admin-table"><thead><tr><th>Name</th><th>City</th><th>Address / Landmark</th><th>Coordinates</th><th>Status</th><th>Actions</th></tr></thead><tbody>${(data||[]).map(r=>`<tr><td><b>${escapeMerchant(r.name)}</b></td><td>${escapeMerchant(r.city||'—')}</td><td>${escapeMerchant(r.address_text||'—')}</td><td>${r.latitude!=null&&r.longitude!=null?`${r.latitude}, ${r.longitude}`:'—'}</td><td>${r.active===false?'Inactive':'Active'}</td><td><button class="btn btn-light" onclick='openMerchantEditor(${JSON.stringify(r).replace(/'/g,"&#39;")})'>Edit</button> <button class="btn btn-light" onclick="deleteMerchant('${r.id}')">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
}

function openMerchantEditor(record=null){
  merchantEditingId=record?.id||null;
  moduleCard.innerHTML=`<div class="deals-head"><div><h2 style="margin:0">${record?'Edit':'Add'} Merchant / Shop / Mall</h2><div class="result-count">This information will auto-fill when creating an offer.</div></div><button class="btn btn-light" onclick="showMerchantManagement()">← Back</button></div>
  <form onsubmit="saveMerchant(event)" class="admin-form">
    <div class="field full"><label>Name of Merchant / Shop / Mall</label><input id="merchantName" required value="${merchantAttr(record?.name||'')}" placeholder="e.g. Mid Valley Megamall / Watsons Mid Valley"></div>
    <div class="field full"><label>Google Maps Link</label><div style="display:flex;gap:8px;flex-wrap:wrap"><input id="merchantMapsUrl" type="url" value="${merchantAttr(record?.google_maps_url||'')}" placeholder="Paste full Google Maps URL" style="flex:1;min-width:220px"><button type="button" class="btn btn-light" onclick="extractMerchantCoordinates()">Extract Coordinates</button></div><div id="merchantMapsHint" class="hint">Paste a full Google Maps URL containing coordinates. Short maps.app.goo.gl links should be opened first and the expanded URL copied.</div></div>
    <div class="field full"><label>Address / Landmark Details</label><textarea id="merchantAddress" rows="3" style="width:100%;border:1px solid #e5e9f0;border-radius:10px;padding:12px;font:inherit" placeholder="Full address or useful landmark">${escapeMerchant(record?.address_text||'')}</textarea></div>
    <div class="field"><label>City</label><input id="merchantCity" value="${merchantAttr(record?.city||'')}" placeholder="e.g. Kuala Lumpur"></div>
    <div class="field"><label>Status</label><select id="merchantActive"><option value="true" ${record?.active===false?'':'selected'}>Active</option><option value="false" ${record?.active===false?'selected':''}>Inactive</option></select></div>
    <div class="field"><label>Latitude</label><input id="merchantLatitude" type="number" step="0.0000001" value="${merchantAttr(record?.latitude??'')}" placeholder="3.1187000"></div>
    <div class="field"><label>Longitude</label><input id="merchantLongitude" type="number" step="0.0000001" value="${merchantAttr(record?.longitude??'')}" placeholder="101.6764000"></div>
    <div class="full" style="display:flex;gap:8px"><button class="btn btn-primary">${record?'Update':'Save'} Merchant</button><button type="button" class="btn btn-light" onclick="showMerchantManagement()">Cancel</button></div><div id="merchantSaveMsg" class="hint full"></div>
  </form>`;
}

function extractMerchantCoordinates(){
  const raw=document.getElementById('merchantMapsUrl')?.value.trim();const hint=document.getElementById('merchantMapsHint');if(!raw){hint.textContent='Paste a Google Maps link first.';return;}
  const patterns=[/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,/!3d(-?\d+(?:\.\d+)?)[^!]*!4d(-?\d+(?:\.\d+)?)/,/[?&]query=(-?\d+(?:\.\d+)?)(?:%2C|,)(-?\d+(?:\.\d+)?)/i,/[?&]q=(-?\d+(?:\.\d+)?)(?:%2C|,)(-?\d+(?:\.\d+)?)/i];
  let m=null;for(const p of patterns){m=raw.match(p);if(m)break;}if(!m){hint.textContent='Coordinates were not found in this URL. Open the short link in Google Maps, then copy the expanded browser URL, or enter latitude/longitude manually.';return;}
  document.getElementById('merchantLatitude').value=Number(m[1]).toFixed(7);document.getElementById('merchantLongitude').value=Number(m[2]).toFixed(7);hint.textContent='Coordinates extracted ✓';
}

async function saveMerchant(e){
  e.preventDefault();
  const name=document.getElementById('merchantName').value.trim();
  const obj={
    name,
    google_maps_url:merchantVal('merchantMapsUrl'),
    address_text:merchantVal('merchantAddress'),
    city:merchantVal('merchantCity'),
    latitude:merchantNum('merchantLatitude'),
    longitude:merchantNum('merchantLongitude'),
    active:document.getElementById('merchantActive').value==='true'
  };
  if(!merchantEditingId)obj.slug=merchantSlug(name)+'-'+Date.now().toString().slice(-5);
  let result;
  if(merchantEditingId)result=await db.from('merchants').update(obj).eq('id',merchantEditingId);
  else result=await db.from('merchants').insert(obj);
  if(result.error){document.getElementById('merchantSaveMsg').textContent=result.error.message;return;}
  showMerchantManagement();
}

async function deleteMerchant(id){if(!confirm('Delete this Merchant / Shop / Mall? Existing offers may still reference it.'))return;const {error}=await db.from('merchants').delete().eq('id',id);if(error)alert(error.message);else showMerchantManagement();}
function merchantSlug(v){return String(v||'merchant').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'merchant'}
function merchantVal(id){const v=document.getElementById(id)?.value?.trim();return v||null}function merchantNum(id){const v=document.getElementById(id)?.value;return v!==''&&v!=null?Number(v):null}function merchantAttr(v){return escapeMerchant(v).replace(/`/g,'&#96;')}function escapeMerchant(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
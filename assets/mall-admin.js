let mallEditingId=null;

async function showMallManagement(){
  moduleCard.innerHTML=`<div class="deals-head"><div><h2 style="margin:0">Shopping Malls</h2><div class="result-count">Manage shopping mall/location master data for offers.</div></div><button class="btn btn-primary" onclick="openMallEditor()">+ Add Shopping Mall</button></div><div id="mallRows">Loading...</div>`;
  const {data,error}=await db.from('malls').select('*').order('name');
  const host=document.getElementById('mallRows');
  if(error){
    const missing=String(error.message||'').includes("Could not find the table 'public.malls'");
    host.innerHTML=missing?`<div class="notice"><b>Shopping Mall database is not ready yet.</b><br>Run <code>supabase/malls.sql</code> once in Supabase SQL Editor, then refresh this page.</div>`:`<p>${mallEsc(error.message)}</p>`;
    return;
  }
  host.innerHTML=`<div style="overflow:auto"><table class="admin-table"><thead><tr><th>Shopping Mall</th><th>City</th><th>Address / Landmark</th><th>Coordinates</th><th>Status</th><th>Actions</th></tr></thead><tbody>${(data||[]).map(r=>`<tr><td><b>${mallEsc(r.name)}</b></td><td>${mallEsc(r.city||'—')}</td><td>${mallEsc(r.address_text||'—')}</td><td>${r.latitude!=null&&r.longitude!=null?`${r.latitude}, ${r.longitude}`:'—'}</td><td>${r.active===false?'Inactive':'Active'}</td><td><button class="btn btn-light" onclick='openMallEditor(${JSON.stringify(r).replace(/'/g,"&#39;")})'>Edit</button> <button class="btn btn-light" onclick="deleteMall('${r.id}')">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
}

function openMallEditor(record=null){
  mallEditingId=record?.id||null;
  moduleCard.innerHTML=`<div class="deals-head"><div><h2 style="margin:0">${record?'Edit':'Add'} Shopping Mall</h2><div class="result-count">Save shopping mall location details once and reuse them in Add Offer.</div></div><button class="btn btn-light" onclick="showMallManagement()">← Back</button></div>
  <form onsubmit="saveMall(event)" class="admin-form">
    <div class="field full"><label>Name of Shopping Mall</label><input id="mallName" required value="${mallAttr(record?.name||'')}" placeholder="e.g. Mid Valley Megamall"></div>
    <div class="field full"><label>Google Maps Link</label><div style="display:flex;gap:8px;flex-wrap:wrap"><input id="mallMapsUrl" type="url" value="${mallAttr(record?.google_maps_url||'')}" placeholder="Paste full Google Maps URL" style="flex:1;min-width:220px"><button type="button" class="btn btn-light" onclick="extractMallCoordinates()">Extract Coordinates</button></div><div id="mallMapsHint" class="hint">Paste a full Google Maps URL containing coordinates.</div></div>
    <div class="field full"><label>Address / Landmark Details</label><textarea id="mallAddress" rows="3" style="width:100%;border:1px solid #e5e9f0;border-radius:10px;padding:12px;font:inherit">${mallEsc(record?.address_text||'')}</textarea></div>
    <div class="field"><label>City</label><input id="mallCity" value="${mallAttr(record?.city||'')}"></div>
    <div class="field"><label>Status</label><select id="mallActive"><option value="true" ${record?.active===false?'':'selected'}>Active</option><option value="false" ${record?.active===false?'selected':''}>Inactive</option></select></div>
    <div class="field"><label>Latitude</label><input id="mallLatitude" type="number" step="0.0000001" value="${mallAttr(record?.latitude??'')}"></div>
    <div class="field"><label>Longitude</label><input id="mallLongitude" type="number" step="0.0000001" value="${mallAttr(record?.longitude??'')}"></div>
    <div class="full"><button class="btn btn-primary">${record?'Update':'Save'} Shopping Mall</button></div><div id="mallSaveMsg" class="hint full"></div>
  </form>`;
}

function extractMallCoordinates(){const raw=document.getElementById('mallMapsUrl')?.value.trim();const hint=document.getElementById('mallMapsHint');if(!raw){hint.textContent='Paste a Google Maps link first.';return;}const patterns=[/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,/!3d(-?\d+(?:\.\d+)?)[^!]*!4d(-?\d+(?:\.\d+)?)/,/[?&]query=(-?\d+(?:\.\d+)?)(?:%2C|,)(-?\d+(?:\.\d+)?)/i,/[?&]q=(-?\d+(?:\.\d+)?)(?:%2C|,)(-?\d+(?:\.\d+)?)/i];let m=null;for(const p of patterns){m=raw.match(p);if(m)break;}if(!m){hint.textContent='Coordinates were not found. Use an expanded Google Maps URL or enter them manually.';return;}document.getElementById('mallLatitude').value=Number(m[1]).toFixed(7);document.getElementById('mallLongitude').value=Number(m[2]).toFixed(7);hint.textContent='Coordinates extracted ✓';}

async function saveMall(e){
  e.preventDefault();
  const msg=document.getElementById('mallSaveMsg');
  const name=document.getElementById('mallName').value.trim();
  const obj={name,google_maps_url:mallVal('mallMapsUrl'),address_text:mallVal('mallAddress'),city:mallVal('mallCity'),latitude:mallNum('mallLatitude'),longitude:mallNum('mallLongitude'),active:document.getElementById('mallActive').value==='true'};
  if(!mallEditingId)obj.slug=mallSlug(name)+'-'+Date.now().toString().slice(-5);
  let result;if(mallEditingId)result=await db.from('malls').update(obj).eq('id',mallEditingId);else result=await db.from('malls').insert(obj);
  if(result.error){
    const missing=String(result.error.message||'').includes("Could not find the table 'public.malls'");
    msg.innerHTML=missing?`Shopping Mall table is not created yet. Run <b>supabase/malls.sql</b> in Supabase SQL Editor, then refresh Admin.`:mallEsc(result.error.message);
    return;
  }
  showMallManagement();
}
async function deleteMall(id){if(!confirm('Delete this Shopping Mall? Existing offers will keep working but lose the Shopping Mall link.'))return;const {error}=await db.from('malls').delete().eq('id',id);if(error)alert(error.message);else showMallManagement();}
function mallSlug(v){return String(v||'shopping-mall').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'shopping-mall'}function mallVal(id){const v=document.getElementById(id)?.value?.trim();return v||null}function mallNum(id){const v=document.getElementById(id)?.value;return v!==''&&v!=null?Number(v):null}function mallAttr(v){return mallEsc(v).replace(/`/g,'&#96;')}function mallEsc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
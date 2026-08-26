let merchantEditingId=null;

async function showMerchantManagement(){
  moduleCard.innerHTML=`<div class="deals-head"><div><h2 style="margin:0">Merchant / Shop / Brand</h2><div class="result-count">Manage merchants, shops and brands used in offers.</div></div><button class="btn btn-primary" onclick="openMerchantEditor()">+ Add Merchant / Shop / Brand</button></div><div id="merchantRows">Loading...</div>`;
  const {data,error}=await db.from('merchants').select('*').order('name');
  const host=document.getElementById('merchantRows');
  if(error){host.innerHTML=`<p>${escapeMerchant(error.message)}</p>`;return;}
  host.innerHTML=`<div style="overflow:auto"><table class="admin-table"><thead><tr><th>Name</th><th>Status</th><th>Actions</th></tr></thead><tbody>${(data||[]).map(r=>`<tr><td><b>${escapeMerchant(r.name)}</b></td><td>${r.active===false?'Inactive':'Active'}</td><td><button class="btn btn-light" onclick='openMerchantEditor(${JSON.stringify(r).replace(/'/g,"&#39;")})'>Edit</button> <button class="btn btn-light" onclick="deleteMerchant('${r.id}')">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
}

function openMerchantEditor(record=null){
  merchantEditingId=record?.id||null;
  moduleCard.innerHTML=`<div class="deals-head"><div><h2 style="margin:0">${record?'Edit':'Add'} Merchant / Shop / Brand</h2><div class="result-count">Create a reusable merchant, shop or brand for offers.</div></div><button class="btn btn-light" onclick="showMerchantManagement()">← Back</button></div>
  <form onsubmit="saveMerchant(event)" class="admin-form">
    <div class="field full"><label>Name of Merchant / Shop / Brand</label><input id="merchantName" required value="${merchantAttr(record?.name||'')}" placeholder="e.g. Watsons / UNIQLO / AEON"></div>
    <div class="field"><label>Status</label><select id="merchantActive"><option value="true" ${record?.active===false?'':'selected'}>Active</option><option value="false" ${record?.active===false?'selected':''}>Inactive</option></select></div>
    <div class="full" style="display:flex;gap:8px"><button class="btn btn-primary">${record?'Update':'Save'} Merchant / Shop / Brand</button><button type="button" class="btn btn-light" onclick="showMerchantManagement()">Cancel</button></div><div id="merchantSaveMsg" class="hint full"></div>
  </form>`;
}

async function saveMerchant(e){
  e.preventDefault();
  const name=document.getElementById('merchantName').value.trim();
  const obj={name,active:document.getElementById('merchantActive').value==='true'};
  if(!merchantEditingId)obj.slug=merchantSlug(name)+'-'+Date.now().toString().slice(-5);
  let result;
  if(merchantEditingId)result=await db.from('merchants').update(obj).eq('id',merchantEditingId);
  else result=await db.from('merchants').insert(obj);
  if(result.error){document.getElementById('merchantSaveMsg').textContent=result.error.message;return;}
  showMerchantManagement();
}

async function deleteMerchant(id){if(!confirm('Delete this Merchant / Shop / Brand? Existing offers may still reference it.'))return;const {error}=await db.from('merchants').delete().eq('id',id);if(error)alert(error.message);else showMerchantManagement();}
function merchantSlug(v){return String(v||'merchant').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'merchant'}
function merchantAttr(v){return escapeMerchant(v).replace(/`/g,'&#96;')}function escapeMerchant(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
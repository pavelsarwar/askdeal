async function quickAddOfferCategory(){
  const current=document.getElementById('offerCategory');
  const name=prompt('New category name:');
  if(!name||!name.trim())return;
  const clean=name.trim();
  const {data,error}=await db.from('categories').insert({name:clean,active:true}).select('id,name').single();
  if(error){alert(error.message);return;}
  const opt=document.createElement('option');opt.value=data.id;opt.textContent=data.name;opt.selected=true;current.appendChild(opt);
  showToast?.('Category added');
}

async function showCategoryManagement(){
  moduleCard.innerHTML=`<div class="deals-head"><div><h2 style="margin:0">Categories</h2><div class="result-count">Categories created here appear automatically across Ask Deal.</div></div><button class="btn btn-primary" onclick="openCategoryCreate()">+ Add Category</button></div><div id="categoryRows">Loading...</div>`;
  const {data,error}=await db.from('categories').select('id,name,active').order('name');
  const host=document.getElementById('categoryRows');
  if(error){host.innerHTML=`<p>${catEsc(error.message)}</p>`;return;}
  host.innerHTML=`<div style="overflow:auto"><table class="admin-table"><thead><tr><th>Category</th><th>Status</th><th>Actions</th></tr></thead><tbody>${(data||[]).map(r=>`<tr><td><b>${catEsc(r.name)}</b></td><td>${r.active===false?'Inactive':'Active'}</td><td><button class="btn btn-light" onclick="toggleCategory('${r.id}',${r.active===false})">${r.active===false?'Activate':'Deactivate'}</button></td></tr>`).join('')}</tbody></table></div>`;
}
function openCategoryCreate(){moduleCard.innerHTML=`<div class="deals-head"><div><h2 style="margin:0">Add Category</h2><div class="result-count">Create a category for offers and homepage browsing.</div></div><button class="btn btn-light" onclick="showCategoryManagement()">← Back</button></div><form onsubmit="saveCategory(event)" class="admin-form"><div class="field full"><label>Category Name</label><input id="categoryName" required placeholder="e.g. Beauty, Baby, Automotive"></div><div class="full"><button class="btn btn-primary">Save Category</button></div><div id="categoryMsg" class="hint full"></div></form>`}
async function saveCategory(e){e.preventDefault();const name=document.getElementById('categoryName').value.trim();const {error}=await db.from('categories').insert({name,active:true});if(error){document.getElementById('categoryMsg').textContent=error.message;return}showCategoryManagement()}
async function toggleCategory(id,active){const {error}=await db.from('categories').update({active}).eq('id',id);if(error)alert(error.message);else showCategoryManagement()}
function catEsc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

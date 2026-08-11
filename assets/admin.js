let db;
const modules={
 products:{table:'products',title:'Products',fields:[['name','Name','text'],['slug','Slug','text'],['brand','Brand','text'],['size_label','Size / Weight','text'],['barcode','Barcode','text'],['image_url','Image URL','url'],['description','Description','text']]},
 merchants:{table:'merchants',title:'Merchants',fields:[['name','Merchant Name','text'],['slug','Slug','text'],['merchant_type','Type','text'],['logo_url','Logo URL','url'],['website_url','Website','url']]},
 prices:{table:'product_prices',title:'Product Prices',fields:[['product_id','Product UUID','text'],['merchant_id','Merchant UUID','text'],['state_id','State ID','number'],['normal_price','Normal Price','number'],['offer_price','Offer Price','number'],['offer_start','Start','datetime-local'],['offer_end','End','datetime-local'],['source_url','Source URL','url']]},
 deals:{table:'deals',title:'Deals',fields:[['title','Title','text'],['slug','Slug','text'],['merchant_id','Merchant UUID','text'],['category_id','Category ID','number'],['state_id','State ID','number'],['discount_text','Discount','text'],['image_url','Image URL','url'],['source_url','Source URL','url']]},
 gold:{table:'gold_rates',title:'Gold Rates',fields:[['rate_date','Date','date'],['purity','Purity','text'],['price_per_gram','Price / gram','number'],['merchant_name','Merchant','text'],['source_url','Source URL','url']]},
 remittance:{table:'remittance_rates',title:'Remittance Rates',fields:[['provider','Provider','text'],['destination_country','Destination','text'],['currency','Currency','text'],['rate','Rate','number'],['transfer_fee','Fee','number'],['payout_method','Payout Method','text'],['source_url','Source URL','url']]},
 fuel:{table:'fuel_prices',title:'Fuel Prices',fields:[['fuel_type','Fuel Type','text'],['price_per_litre','Price / Litre','number'],['effective_from','Effective From','date'],['effective_to','Effective To','date'],['region','Region','text'],['source_url','Source URL','url']]},
 hospitals:{table:'hospitals',title:'Hospitals',fields:[['name','Hospital Name','text'],['state_id','State ID','number'],['city','City','text'],['consultation_min','Consultation Min','number'],['consultation_max','Consultation Max','number'],['website_url','Website','url']]},
 articles:{table:'articles',title:'Articles',fields:[['title','Title','text'],['slug','Slug','text'],['article_type','Type','text'],['excerpt','Excerpt','text'],['cover_url','Cover URL','url'],['state_id','State ID','number']]}
};

document.addEventListener('DOMContentLoaded',async()=>{
 const cfg=window.NAPS_SUPABASE||{};
 if(!cfg.url||cfg.url.includes('YOUR_')) return setMsg('loginMsg','Supabase is not configured yet.');
 db=supabase.createClient(cfg.url,cfg.anonKey);
 const {data}=await db.auth.getSession();
 if(data.session) checkAccess();
});
function setMsg(id,msg){const e=document.getElementById(id);if(e)e.textContent=msg}
async function adminLogin(){
 if(!db)return setMsg('loginMsg','Add Supabase URL and key in assets/supabase-config.js');
 const {error}=await db.auth.signInWithPassword({email:loginEmail.value,password:loginPassword.value});
 if(error)return setMsg('loginMsg',error.message);checkAccess();
}
async function checkAccess(){
 const {data:{user}}=await db.auth.getUser();if(!user)return;
 const {data,error}=await db.from('profiles').select('role').eq('id',user.id).single();
 if(error||!data||!['super_admin','admin','editor'].includes(data.role)){await db.auth.signOut();return setMsg('loginMsg','This user does not have NAPS admin access.');}
 loginView.style.display='none';adminView.style.display='block';
}
async function adminLogout(){await db.auth.signOut();location.reload()}
function showModule(key){const m=modules[key];moduleCard.innerHTML=`<div class="deals-head"><div><h2 style="margin:0">${m.title}</h2><div class="result-count">Create and manage ${m.title.toLowerCase()}</div></div><button class="btn btn-primary" onclick="openCreate('${key}')">+ Add New</button></div><div id="rows">Loading...</div>`;loadRows(key)}
async function loadRows(key){
 const m=modules[key],host=document.getElementById('rows');
 const {data,error}=await db.from(m.table).select('*').limit(100);
 if(error){host.innerHTML=`<p>${error.message}</p>`;return}
 const cols=m.fields.slice(0,4).map(x=>x[0]);
 host.innerHTML=`<div style="overflow:auto"><table class="admin-table"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}<th></th></tr></thead><tbody>${(data||[]).map(r=>`<tr>${cols.map(c=>`<td>${r[c]??''}</td>`).join('')}<td><button class="btn btn-light" onclick="deleteRow('${key}','${r.id}')">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
}
function openCreate(key){
 const m=modules[key];
 moduleCard.innerHTML=`<h2>Add ${m.title}</h2><form class="admin-form" onsubmit="saveRow(event,'${key}')">${m.fields.map(([n,l,t])=>`<div class="field"><label>${l}</label><input name="${n}" type="${t}" ${['name','title','offer_price','price_per_gram','rate','fuel_type'].includes(n)?'required':''}></div>`).join('')}<div class="full"><button class="btn btn-primary">Save</button> <button type="button" class="btn btn-light" onclick="showModule('${key}')">Cancel</button></div></form><div id="formMsg" class="hint"></div>`;
}
async function saveRow(e,key){e.preventDefault();const m=modules[key],obj={};new FormData(e.target).forEach((v,k)=>{if(v!=='')obj[k]=v});if(obj.slug===undefined&&obj.name)obj.slug=slugify(obj.name);const {error}=await db.from(m.table).insert(obj);if(error)return setMsg('formMsg',error.message);showModule(key)}
async function deleteRow(key,id){if(!confirm('Delete this record?'))return;const m=modules[key],{error}=await db.from(m.table).delete().eq('id',id);if(error)alert(error.message);else loadRows(key)}
function slugify(s){return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}

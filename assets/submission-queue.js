async function showSubmissionQueue(){
  if(!db){alert('Admin database is not ready.');return;}
  moduleCard.innerHTML='<div class="deals-head"><div><h2 style="margin:0">📥 Pending Submissions</h2><div class="result-count">Review public deal submissions before they go live</div></div><button class="btn btn-light" onclick="loadSubmissionQueue()">Refresh</button></div><div id="submissionRows">Loading...</div>';
  loadSubmissionQueue();
}
async function loadSubmissionQueue(){
  const host=document.getElementById('submissionRows');if(!host)return;
  const {data,error}=await db.from('offer_submissions').select('*').order('created_at',{ascending:false}).limit(100);
  if(error){host.innerHTML='<p>'+error.message+'</p>';return;}
  if(!data?.length){host.innerHTML='<div class="card"><p>No submissions yet.</p></div>';return;}
  host.innerHTML=data.map(s=>`<div class="card" style="margin:12px 0;border-left:4px solid ${s.status==='pending'?'#f79009':s.status==='approved'?'#12b76a':'#f04438'}"><div class="deals-head"><div><div class="tag">${esc(s.category_name||'Offer')} · ${esc(s.offer_type||'sale')}</div><h3 style="margin:5px 0">${esc(s.title)}</h3><div class="result-count">${esc(s.merchant_name)} · ${esc(s.state_name||'All Malaysia')} ${s.city?'· '+esc(s.city):''}</div></div><span class="badge" style="background:${s.status==='pending'?'#fff4e5':s.status==='approved'?'#ecfdf3':'#fef3f2'};color:#344054">${s.status.toUpperCase()}</span></div><div style="margin:10px 0">${s.details_html||('<p>'+esc(s.description||'')+'</p>')}</div>${s.location_text?`<p><b>Location:</b> ${esc(s.location_text)} ${s.google_maps_url?`· <a href="${escAttr(s.google_maps_url)}" target="_blank" rel="noopener">Open Google Maps</a>`:''}</p>`:''}<div class="meta"><span>Submitted: ${new Date(s.created_at).toLocaleString()}</span>${s.submitter_name?'<span>By: '+esc(s.submitter_name)+'</span>':''}${s.submitter_email?'<span>'+esc(s.submitter_email)+'</span>':''}</div>${s.status==='pending'?`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" onclick="approveSubmission('${s.id}')">✓ Approve & Publish</button><button class="btn btn-light" onclick="rejectSubmission('${s.id}')">✕ Reject</button></div>`:(s.approved_deal_id?`<a class="btn btn-light" href="deal-detail.html?id=${s.approved_deal_id}" target="_blank">View Published Offer</a>`:'')}</div>`).join('');
}
async function approveSubmission(id){
  if(!confirm('Approve this submission and publish it on NAPS?'))return;
  const {data:s,error}=await db.from('offer_submissions').select('*').eq('id',id).single();
  if(error||!s){alert(error?.message||'Submission not found');return;}
  let merchantId=null,categoryId=null,stateId=null;
  if(s.merchant_name){const {data:m}=await db.from('merchants').select('id').ilike('name',s.merchant_name).limit(1);if(m?.length)merchantId=m[0].id;else{const slug=slugify(s.merchant_name)+'-'+Date.now().toString().slice(-5);const {data:newM,error:me}=await db.from('merchants').insert({name:s.merchant_name,slug,active:true}).select('id').single();if(me){alert(me.message);return;}merchantId=newM.id;}}
  if(s.category_name){const {data:c}=await db.from('categories').select('id').eq('name',s.category_name).limit(1);if(c?.length)categoryId=c[0].id;}
  if(s.state_name){const {data:st}=await db.from('states').select('id').eq('name',s.state_name).limit(1);if(st?.length)stateId=st[0].id;}
  let contentHtml=s.details_html||'';
  if(!contentHtml&&s.description)contentHtml='<p>'+esc(s.description).replace(/\n/g,'</p><p>')+'</p>';
  if(s.google_maps_url)contentHtml+=`<p><strong>Google Maps:</strong> <a href="${escAttr(s.google_maps_url)}" target="_blank" rel="noopener">View location on Google Maps</a></p>`;
  const deal={merchant_id:merchantId,category_id:categoryId,state_id:stateId,title:s.title,slug:slugify(s.title)+'-'+Date.now().toString().slice(-6),description:s.description||'',content_html:contentHtml,image_url:s.image_url||null,discount_text:s.discount_text||null,start_at:s.start_at||null,end_at:s.end_at||null,source_url:s.source_url||null,offer_type:s.offer_type||'sale',location_text:s.location_text||null,city:s.city||null,status:'published',published:true};
  const {data:newDeal,error:de}=await db.from('deals').insert(deal).select('id').single();if(de){alert(de.message);return;}
  const {error:ue}=await db.from('offer_submissions').update({status:'approved',approved_deal_id:newDeal.id,reviewed_at:new Date().toISOString()}).eq('id',id);if(ue){alert(ue.message);return;}loadSubmissionQueue();
}
async function rejectSubmission(id){const note=prompt('Optional rejection note:')||'';const {error}=await db.from('offer_submissions').update({status:'rejected',admin_note:note,reviewed_at:new Date().toISOString()}).eq('id',id);if(error)alert(error.message);else loadSubmissionQueue();}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function escAttr(v){return esc(v)}

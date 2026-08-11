document.addEventListener('DOMContentLoaded',()=>{
  const cfg=window.NAPS_SUPABASE||{};
  if(!cfg.url||!cfg.anonKey||typeof supabase==='undefined')return;
  window.submitDb=supabase.createClient(cfg.url,cfg.anonKey);
});

async function submitPublicOffer(e){
  e.preventDefault();
  const form=e.target,btn=form.querySelector('button[type="submit"]'),msg=document.getElementById('submitMsg');
  if(!window.submitDb){msg.textContent='Submission service is not available yet.';return;}
  const obj={};new FormData(form).forEach((v,k)=>{if(String(v).trim()!=='')obj[k]=String(v).trim()});
  obj.status='pending';
  if(obj.start_at)obj.start_at=new Date(obj.start_at).toISOString();
  if(obj.end_at)obj.end_at=new Date(obj.end_at).toISOString();
  btn.disabled=true;btn.textContent='Submitting...';msg.textContent='';
  const {error}=await window.submitDb.from('offer_submissions').insert(obj);
  btn.disabled=false;btn.textContent='Submit for Review';
  if(error){msg.textContent='Could not submit: '+error.message;return;}
  form.reset();
  msg.innerHTML='<b>Thank you.</b> Your offer has been submitted and is waiting for NAPS admin approval.';
}

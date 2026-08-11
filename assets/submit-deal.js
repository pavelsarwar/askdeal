let publicDetailsEditor;
document.addEventListener('DOMContentLoaded',()=>{
  const cfg=window.NAPS_SUPABASE||{};
  if(cfg.url&&cfg.anonKey&&typeof supabase!=='undefined') window.submitDb=supabase.createClient(cfg.url,cfg.anonKey);
  if(typeof Quill!=='undefined'&&document.getElementById('publicDetailsEditor')){
    publicDetailsEditor=new Quill('#publicDetailsEditor',{
      theme:'snow',
      placeholder:'Write full offer details here...',
      modules:{toolbar:[[{header:[1,2,3,false]}],['bold','italic','underline'],[{list:'ordered'},{list:'bullet'}],[{align:[]}],['blockquote','link','image'],['clean']]}
    });
  }
});
async function submitPublicOffer(e){
  e.preventDefault();
  const form=e.target,btn=form.querySelector('button[type="submit"]'),msg=document.getElementById('submitMsg');
  if(!window.submitDb){msg.textContent='Submission service is not available yet.';return;}
  const html=publicDetailsEditor?.root.innerHTML||'';
  const plain=publicDetailsEditor?.getText().trim()||'';
  if(!plain){msg.textContent='Please add offer details.';return;}
  document.getElementById('detailsHtml').value=html;
  const obj={};new FormData(form).forEach((v,k)=>{if(String(v).trim()!=='')obj[k]=String(v).trim()});
  obj.description=plain.slice(0,500);
  obj.details_html=html;
  obj.status='pending';
  if(obj.start_at)obj.start_at=new Date(obj.start_at).toISOString();
  if(obj.end_at)obj.end_at=new Date(obj.end_at).toISOString();
  btn.disabled=true;btn.textContent='Submitting...';msg.textContent='';
  const {error}=await window.submitDb.from('offer_submissions').insert(obj);
  btn.disabled=false;btn.textContent='Submit for Review';
  if(error){msg.textContent='Could not submit: '+error.message;return;}
  form.reset();if(publicDetailsEditor)publicDetailsEditor.setText('');
  msg.innerHTML='<b>Thank you.</b> Your offer has been submitted and is waiting for NAPS admin approval.';
}

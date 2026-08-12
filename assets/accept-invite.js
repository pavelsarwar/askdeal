let inviteDb;
document.addEventListener('DOMContentLoaded',async()=>{
  const cfg=window.NAPS_SUPABASE||{};
  inviteDb=supabase.createClient(cfg.url,cfg.anonKey);
  const status=document.getElementById('inviteStatus');
  const {data,error}=await inviteDb.auth.getSession();
  if(error){status.textContent=error.message;return;}
  if(!data.session){status.innerHTML='Invitation session not found yet. If you opened this page directly, please use the link from your invitation email.';}
});

async function setInvitePassword(e){
  e.preventDefault();
  const p1=document.getElementById('newPassword').value;
  const p2=document.getElementById('confirmPassword').value;
  const status=document.getElementById('inviteStatus');
  const btn=document.getElementById('setPasswordBtn');
  if(p1!==p2){status.textContent='Passwords do not match.';return;}
  if(p1.length<8){status.textContent='Password must be at least 8 characters.';return;}
  btn.disabled=true;btn.textContent='Saving...';
  const {data:{session}}=await inviteDb.auth.getSession();
  if(!session){status.textContent='Invitation session is missing or expired. Please ask the Super Admin to send a new invitation.';btn.disabled=false;btn.textContent='Set Password & Continue';return;}
  const {error}=await inviteDb.auth.updateUser({password:p1});
  if(error){status.textContent=error.message;btn.disabled=false;btn.textContent='Set Password & Continue';return;}
  status.innerHTML='<b>Password set successfully.</b> Redirecting to NAPS Admin...';
  setTimeout(()=>location.href='admin.html',1000);
}

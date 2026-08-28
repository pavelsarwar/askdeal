let inviteDb;
document.addEventListener('DOMContentLoaded',async()=>{
  const cfg=window.NAPS_SUPABASE||{};
  inviteDb=supabase.createClient(cfg.url,cfg.anonKey);
  const status=document.getElementById('inviteStatus');
  const {data,error}=await inviteDb.auth.getSession();
  if(error){status.textContent=error.message;return;}
  if(!data.session){status.innerHTML='Invitation session not found yet. Please open this page from the link in your invitation email.';return;}
  const meta=data.session.user?.user_metadata||{};
  if(meta.password_set===true){status.innerHTML='<b>Your password is already set.</b> You can continue to Ask Deal Admin.';}
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
  const existing=session.user?.user_metadata||{};
  const {error}=await inviteDb.auth.updateUser({password:p1,data:{...existing,password_set:true}});
  if(error){status.textContent=error.message;btn.disabled=false;btn.textContent='Set Password & Continue';return;}
  status.innerHTML='<b>Password set successfully.</b> Redirecting to Ask Deal Admin...';
  setTimeout(()=>location.href='admin',900);
}

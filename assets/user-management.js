async function showUserManagement(){
  moduleCard.innerHTML=`<div class="deals-head"><div><h2 style="margin:0">👥 User Management</h2><div class="result-count">Invite new NAPS admins and editors by email</div></div><button class="btn btn-primary" onclick="openInviteUserForm()">+ Invite User</button></div><div id="userMgmtMsg" class="hint" style="margin:8px 0"></div><div id="userRows">Loading...</div>`;
  loadAdminUsers();
}

async function invokeUserFn(payload){
  const {data:{session}}=await db.auth.getSession();
  if(!session)throw new Error('Please sign in again.');
  const cfg=window.NAPS_SUPABASE||{};
  const res=await fetch(`${cfg.url}/functions/v1/manage-admin-users`,{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`,'apikey':cfg.anonKey},
    body:JSON.stringify(payload)
  });
  const json=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(json.error||'User management request failed');
  return json;
}

async function loadAdminUsers(){
  const host=document.getElementById('userRows');if(!host)return;
  try{
    const r=await invokeUserFn({action:'list'});
    const users=r.users||[];
    host.innerHTML=`<div style="overflow:auto"><table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last sign in</th><th>Action</th></tr></thead><tbody>${users.map(u=>`<tr><td>${umEsc(u.full_name||'—')}</td><td>${umEsc(u.email||'')}</td><td><span class="best-badge">${umEsc(u.role||'editor')}</span></td><td>${u.confirmed?'Active':'Invited'}</td><td>${u.last_sign_in_at?new Date(u.last_sign_in_at).toLocaleString('en-MY'):'—'}</td><td>${u.role==='super_admin'?'<span class="hint">Super Admin</span>':`<select onchange="changeUserRole('${u.id}',this.value)" style="min-width:120px"><option value="editor" ${u.role==='editor'?'selected':''}>Editor</option><option value="admin" ${u.role==='admin'?'selected':''}>Admin</option><option value="merchant" ${u.role==='merchant'?'selected':''}>Merchant</option></select>`}</td></tr>`).join('')}</tbody></table></div>`;
  }catch(e){host.innerHTML=`<div class="notice"><b>User Management is not active yet.</b><br>${umEsc(e.message)}<br><br>Deploy the Supabase Edge Function <code>manage-admin-users</code> first.</div>`;}
}

function openInviteUserForm(){
  moduleCard.innerHTML=`<div class="deals-head"><div><h2 style="margin:0">Invite New User</h2><div class="result-count">The user will receive an email and set their own password</div></div><button class="btn btn-light" onclick="showUserManagement()">← Back</button></div><form class="admin-form" onsubmit="sendUserInvite(event)" style="margin-top:18px"><div class="field"><label>Full Name</label><input id="inviteName" required placeholder="Full name"></div><div class="field"><label>Email</label><input id="inviteEmail" type="email" required placeholder="name@example.com"></div><div class="field"><label>Role</label><select id="inviteRole"><option value="editor">Editor — content/offers</option><option value="admin">Admin — manage site data</option><option value="merchant">Merchant — merchant role</option></select></div><div class="full"><div class="notice">No password is created here. Supabase will send an invitation email. The invited user will set their own password securely.</div></div><div class="full"><button class="btn btn-primary" type="submit">Send Invitation</button></div></form><div id="inviteMsg" class="hint" style="margin-top:12px"></div>`;
}

async function sendUserInvite(e){
  e.preventDefault();
  const btn=e.target.querySelector('button[type="submit"]'),msg=document.getElementById('inviteMsg');
  btn.disabled=true;btn.textContent='Sending...';msg.textContent='';
  try{
    const redirectTo=new URL('admin.html',location.href).href;
    await invokeUserFn({action:'invite',full_name:inviteName.value.trim(),email:inviteEmail.value.trim(),role:inviteRole.value,redirect_to:redirectTo});
    msg.innerHTML='<b>Invitation sent successfully.</b> The user should check their email.';
    e.target.reset();
  }catch(err){msg.textContent=err.message;}finally{btn.disabled=false;btn.textContent='Send Invitation';}
}

async function changeUserRole(userId,role){
  if(!confirm(`Change this user role to ${role}?`)){loadAdminUsers();return;}
  try{await invokeUserFn({action:'update_role',user_id:userId,role});loadAdminUsers();}catch(e){alert(e.message);loadAdminUsers();}
}
function umEsc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

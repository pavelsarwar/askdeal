function showAdminInbox(){
  const card=document.getElementById('moduleCard');
  if(!card)return;
  card.innerHTML=`<div class="deals-head" style="align-items:flex-start"><div><h2 style="margin:0">📨 Ask Deal Inbox</h2><p class="result-count">Receive and manage support@askdeal.com.my and social@askdeal.com.my</p></div><button class="btn btn-primary" onclick="showComposeMail()">✉️ Compose</button></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin:18px 0"><button class="btn btn-light" onclick="loadInbox('all')">All</button><button class="btn btn-light" onclick="loadInbox('support')">Support</button><button class="btn btn-light" onclick="loadInbox('social')">Social</button></div>
  <div id="inboxList" class="recovery-box"><h3>Inbox setup required</h3><p>The Admin Inbox UI is ready. To display incoming Resend emails here, connect the Resend inbound webhook to a Supabase Edge Function and inbox table.</p><p style="margin-bottom:0"><b>Receiving addresses:</b><br>support@askdeal.com.my<br>social@askdeal.com.my</p></div>`;
}
function loadInbox(type='all'){
  const host=document.getElementById('inboxList');if(!host)return;
  host.innerHTML=`<h3>${type==='all'?'All Mail':type[0].toUpperCase()+type.slice(1)+' Inbox'}</h3><p>No synced messages yet. Incoming Resend webhook connection is required.</p>`;
}
function showComposeMail(){
  const host=document.getElementById('inboxList');if(!host)return;
  host.innerHTML=`<h3>Compose Email</h3><div class="admin-form"><div><label>From</label><select id="mailFrom"><option>support@askdeal.com.my</option><option>social@askdeal.com.my</option></select></div><div><label>To</label><input id="mailTo" type="email" placeholder="name@example.com"></div><div class="full"><label>Subject</label><input id="mailSubject" placeholder="Subject"></div><div class="full"><label>Message</label><textarea id="mailBody" rows="10" placeholder="Write your message..."></textarea></div><div class="full"><button class="btn btn-primary" onclick="alert('Outgoing mail connection requires the Resend API Edge Function setup.')">Send Email</button> <button class="btn btn-light" onclick="showAdminInbox()">Cancel</button></div></div>`;
}

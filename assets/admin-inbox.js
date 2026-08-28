let askDealMailEditor=null;
window.askDealMailView='inbox';
window.askDealInboxFilter='all';

function showAdminInbox(){
  const card=document.getElementById('moduleCard');if(!card)return;
  card.innerHTML=`
  <div class="deals-head" style="align-items:flex-start"><div><h2 style="margin:0">📨 Ask Deal Mail</h2><p class="result-count">Manage incoming and sent email for Ask Deal</p></div><button class="btn btn-primary" onclick="showComposeMail()">✏️ Compose</button></div>
  <div style="display:grid;grid-template-columns:190px minmax(0,1fr);gap:16px;margin-top:18px" class="askdeal-mail-layout">
    <aside style="border-right:1px solid #eaecf0;padding-right:12px">
      ${mailNavButton('inbox','📥','Inbox')}
      ${mailNavButton('sent','📤','Sent')}
      <div style="height:1px;background:#eaecf0;margin:10px 4px"></div>
      ${mailNavButton('support','🎧','Support')}
      ${mailNavButton('social','📣','Social')}
      <div style="height:1px;background:#eaecf0;margin:10px 4px"></div>
      <button class="btn btn-light" style="width:100%;justify-content:flex-start" onclick="refreshCurrentMailView()">↻ Refresh</button>
    </aside>
    <section><div id="inboxList" style="min-height:340px">Loading mail...</div></section>
  </div>
  <style>@media(max-width:760px){.askdeal-mail-layout{grid-template-columns:1fr!important}.askdeal-mail-layout aside{border-right:0!important;border-bottom:1px solid #eaecf0!important;padding:0 0 12px!important;display:flex;gap:6px;flex-wrap:wrap}.askdeal-mail-layout aside button{width:auto!important}}</style>`;
  openMailView('inbox');
}

function mailNavButton(view,icon,label){return `<button id="mailNav-${view}" class="btn btn-light" style="width:100%;justify-content:flex-start;margin-bottom:6px" onclick="openMailView('${view}')">${icon} ${label}</button>`}
function setMailNavActive(view){document.querySelectorAll('[id^="mailNav-"]').forEach(b=>{b.style.background='';b.style.color='';b.style.borderColor=''});const b=document.getElementById('mailNav-'+view);if(b){b.style.background='#eef2ff';b.style.color='#24358f';b.style.borderColor='#c7d2fe'}}
function openMailView(view){window.askDealMailView=view;setMailNavActive(view);if(view==='sent')return loadSentMail();const filter=view==='support'||view==='social'?view:'all';return loadInbox(filter)}
function refreshCurrentMailView(){openMailView(window.askDealMailView||'inbox')}

async function mailFn(payload){const {data:{session}}=await db.auth.getSession();if(!session)throw new Error('Please sign in again.');const cfg=window.NAPS_SUPABASE||{};const res=await fetch(`${cfg.url}/functions/v1/admin-mail`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`,'apikey':cfg.anonKey},body:JSON.stringify(payload)});const json=await res.json().catch(()=>({}));if(!res.ok)throw new Error(json.error||'Mail request failed');return json}

async function loadInbox(type='all'){
  window.askDealInboxFilter=type;const host=document.getElementById('inboxList');if(!host)return;host.innerHTML=mailLoading('Loading inbox...');
  try{const r=await mailFn({action:'list',filter:type});const rows=r.emails||[];const title=type==='support'?'Support':type==='social'?'Social':'Inbox';
    if(!rows.length){host.innerHTML=mailEmpty(`No ${title.toLowerCase()} messages`,`New incoming messages will appear here automatically.`);return}
    host.innerHTML=`<div class="deals-head" style="margin-bottom:10px"><div><h3 style="margin:0">${title}</h3><div class="result-count">${rows.length} received message${rows.length===1?'':'s'}</div></div></div>${mailTable(rows,false)}`;
  }catch(e){host.innerHTML=mailError('Inbox connection error',e.message)}
}

async function loadSentMail(){
  const host=document.getElementById('inboxList');if(!host)return;host.innerHTML=mailLoading('Loading sent mail...');
  try{const r=await mailFn({action:'list_sent'});const rows=r.emails||[];
    if(!rows.length){host.innerHTML=mailEmpty('No sent emails yet','Emails you send from Ask Deal Mail will appear here.');return}
    host.innerHTML=`<div class="deals-head" style="margin-bottom:10px"><div><h3 style="margin:0">Sent</h3><div class="result-count">${rows.length} sent message${rows.length===1?'':'s'}</div></div></div>${mailTable(rows,true)}`;
  }catch(e){host.innerHTML=mailError('Sent mail connection error',e.message)}
}

function mailTable(rows,sent){return `<div style="overflow:auto;border:1px solid #eaecf0;border-radius:14px"><table class="admin-table" style="margin:0"><thead><tr>${sent?'<th>To</th><th>From</th>':'<th>From</th><th>To</th>'}<th>Subject</th>${sent?'<th>Status</th>':''}<th>Date</th></tr></thead><tbody>${rows.map(m=>`<tr style="cursor:pointer" onclick="${sent?`openSentMail('${mailEscAttr(m.id)}')`:`openInboxMail('${mailEscAttr(m.id)}')`}">${sent?`<td><b>${mailEsc((m.to||[]).join(', '))}</b></td><td>${mailEsc(m.from||'')}</td>`:`<td><b>${mailEsc(m.from||'')}</b></td><td>${mailEsc((m.to||[]).join(', '))}</td>`}<td>${mailEsc(m.subject||'(No subject)')}${m.attachments?.length?` <span class="hint">📎 ${m.attachments.length}</span>`:''}</td>${sent?`<td>${mailStatusBadge(m.last_event||'sent')}</td>`:''}<td>${m.created_at?new Date(m.created_at).toLocaleString('en-MY'):'—'}</td></tr>`).join('')}</tbody></table></div>`}

async function openInboxMail(id){
  const host=document.getElementById('inboxList');if(!host)return;host.innerHTML=mailLoading('Opening message...');
  try{const r=await mailFn({action:'get',id});const m=r.email||{};window.askDealOpenMail=m;const replyTo=(m.reply_to&&m.reply_to[0])||extractEmail(m.from||'');const subject=/^re:/i.test(m.subject||'')?(m.subject||''):'Re: '+(m.subject||'');
    host.innerHTML=`${mailMessageHeader(m,false)}<div style="display:flex;gap:8px;margin:14px 0"><button class="btn btn-light" onclick="openMailView(window.askDealMailView||'inbox')">← Back</button><button class="btn btn-primary" onclick="showComposeMail('${mailEscAttr(replyTo)}','${mailEscAttr(subject)}','${mailEscAttr(m.message_id||'')}')">↩ Reply</button></div>${mailMessageBody(m)}${m.attachments?.length?mailAttachments(m):''}`;
  }catch(e){host.innerHTML=mailError('Unable to open message',e.message)}
}

async function openSentMail(id){
  const host=document.getElementById('inboxList');if(!host)return;host.innerHTML=mailLoading('Opening sent message...');
  try{const r=await mailFn({action:'get_sent',id});const m=r.email||{};
    host.innerHTML=`${mailMessageHeader(m,true)}<div style="display:flex;gap:8px;margin:14px 0"><button class="btn btn-light" onclick="openMailView('sent')">← Sent</button><button class="btn btn-primary" onclick="showComposeMail('${mailEscAttr((m.to||[])[0]||'')}','${mailEscAttr(/^re:/i.test(m.subject||'')?m.subject:'Re: '+(m.subject||''))}','${mailEscAttr(m.message_id||'')}')">↩ Follow up</button></div>${mailMessageBody(m)}`;
  }catch(e){host.innerHTML=mailError('Unable to open sent message',e.message)}
}

function mailMessageHeader(m,sent){return `<div style="padding:16px;border:1px solid #eaecf0;border-radius:14px;background:#f9fafb"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap"><div><h2 style="margin:0 0 8px">${mailEsc(m.subject||'(No subject)')}</h2><div class="hint"><b>From:</b> ${mailEsc(m.from||'')}<br><b>To:</b> ${mailEsc((m.to||[]).join(', '))}${m.cc?.length?`<br><b>Cc:</b> ${mailEsc(m.cc.join(', '))}`:''}<br>${m.created_at?`<b>Date:</b> ${mailEsc(new Date(m.created_at).toLocaleString('en-MY'))}`:''}</div></div>${sent?mailStatusBadge(m.last_event||'sent'):''}</div></div>`}
function mailMessageBody(m){return `<div style="margin-top:16px;border:1px solid #eaecf0;border-radius:14px;padding:20px;line-height:1.65;background:#fff;min-height:160px">${m.html?sanitizeMailHtml(m.html):`<div style="white-space:pre-wrap">${mailEsc(m.text||'')}</div>`}</div>`}
function mailAttachments(m){return `<div style="margin-top:18px"><h3>Attachments</h3><div style="display:flex;gap:8px;flex-wrap:wrap">${m.attachments.map(a=>`<button class="btn btn-light" onclick="openMailAttachment('${mailEscAttr(m.id)}','${mailEscAttr(a.id)}')">📎 ${mailEsc(a.filename||'Attachment')}</button>`).join('')}</div></div>`}
function mailStatusBadge(status){const s=String(status||'sent').toLowerCase();const label=({delivered:'Delivered',opened:'Opened',clicked:'Clicked',bounced:'Bounced',complained:'Complained',failed:'Failed',sent:'Sent',delivery_delayed:'Delayed',suppressed:'Suppressed'})[s]||s.replace(/_/g,' ');const bad=['bounced','failed','complained','suppressed'].includes(s);const warn=['delivery_delayed'].includes(s);const bg=bad?'#fef3f2':warn?'#fffaeb':'#ecfdf3',fg=bad?'#b42318':warn?'#b54708':'#027a48';return `<span style="display:inline-block;padding:5px 9px;border-radius:999px;background:${bg};color:${fg};font-size:11px;font-weight:800;text-transform:capitalize">${mailEsc(label)}</span>`}
function mailLoading(text){return `<div style="padding:36px;text-align:center" class="hint">${mailEsc(text)}</div>`}
function mailEmpty(title,text){return `<div style="padding:46px 20px;text-align:center;border:1px dashed #d0d5dd;border-radius:14px"><div style="font-size:32px;margin-bottom:8px">✉️</div><h3 style="margin:0 0 6px">${mailEsc(title)}</h3><p class="hint">${mailEsc(text)}</p></div>`}
function mailError(title,text){return `<div class="notice"><b>${mailEsc(title)}</b><br>${mailEsc(text)}<br><br>Deploy the latest Supabase Edge Function <code>admin-mail</code> and confirm <code>RESEND_API_KEY</code> is configured.</div>`}

async function openMailAttachment(emailId,attachmentId){try{const r=await mailFn({action:'attachment',email_id:emailId,attachment_id:attachmentId});if(r.attachment?.download_url)window.open(r.attachment.download_url,'_blank','noopener');else alert('Attachment link is unavailable.')}catch(e){alert(e.message)}}

function showComposeMail(to='',subject='',inReplyTo=''){
  const host=document.getElementById('inboxList');if(!host)return;
  host.innerHTML=`<div style="background:#fff;border:1px solid #e4e7ec;border-radius:18px;box-shadow:0 14px 40px rgba(16,24,40,.08);overflow:hidden"><div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:#f8fafc;border-bottom:1px solid #eaecf0"><div><h3 style="margin:0;font-size:17px">New Message</h3><div class="hint" style="margin-top:2px">Ask Deal Mail</div></div><button class="btn btn-light" style="padding:6px 10px" onclick="openMailView(window.askDealMailView||'inbox')">✕</button></div><div style="padding:0 18px"><div style="display:grid;grid-template-columns:84px 1fr;align-items:center;border-bottom:1px solid #eef1f4;min-height:50px"><label style="margin:0;color:#667085">From</label><select id="mailFrom" style="border:0;outline:0;background:transparent;padding:10px 0;font:inherit"><option value="support@askdeal.com.my">Ask Deal Support &lt;support@askdeal.com.my&gt;</option><option value="social@askdeal.com.my">Ask Deal Social &lt;social@askdeal.com.my&gt;</option></select></div><div style="display:grid;grid-template-columns:84px 1fr auto;align-items:center;border-bottom:1px solid #eef1f4;min-height:50px"><label style="margin:0;color:#667085">To</label><input id="mailTo" value="${mailEscAttr(to)}" placeholder="Recipient email" style="border:0;outline:0;padding:10px 0;font:inherit"><button type="button" onclick="toggleCcBcc()" style="border:0;background:none;color:#667085;font-weight:700;cursor:pointer">Cc Bcc</button></div><div id="mailCcBcc" style="display:none"><div style="display:grid;grid-template-columns:84px 1fr;align-items:center;border-bottom:1px solid #eef1f4;min-height:46px"><label style="margin:0;color:#667085">Cc</label><input id="mailCc" placeholder="CC recipients, comma separated" style="border:0;outline:0;padding:10px 0;font:inherit"></div><div style="display:grid;grid-template-columns:84px 1fr;align-items:center;border-bottom:1px solid #eef1f4;min-height:46px"><label style="margin:0;color:#667085">Bcc</label><input id="mailBcc" placeholder="BCC recipients, comma separated" style="border:0;outline:0;padding:10px 0;font:inherit"></div></div><div style="display:grid;grid-template-columns:84px 1fr;align-items:center;border-bottom:1px solid #eef1f4;min-height:50px"><label style="margin:0;color:#667085">Subject</label><input id="mailSubject" value="${mailEscAttr(subject)}" placeholder="Subject" style="border:0;outline:0;padding:10px 0;font:inherit;font-weight:600"></div><div style="padding:14px 0 0"><div id="mailRichEditor" style="min-height:280px;border:0"></div></div></div><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 18px;border-top:1px solid #eaecf0;background:#fff;flex-wrap:wrap"><div style="display:flex;gap:8px;align-items:center"><button id="mailSendBtn" class="btn btn-primary" onclick="sendAdminMail('${mailEscAttr(inReplyTo)}')">Send</button><span id="mailSendStatus" class="hint"></span></div><button class="btn btn-light" onclick="clearMailComposer()">🗑 Discard</button></div></div>`;
  askDealMailEditor=new Quill('#mailRichEditor',{theme:'snow',placeholder:'Write your message...',modules:{toolbar:[[{header:[1,2,3,false]}],['bold','italic','underline','strike'],[{list:'ordered'},{list:'bullet'}],[{align:[]}],['blockquote','code-block'],['link'],['clean']]}});
}
function toggleCcBcc(){const el=document.getElementById('mailCcBcc');if(el)el.style.display=el.style.display==='none'?'block':'none'}
function clearMailComposer(){if(confirm('Discard this message?'))openMailView(window.askDealMailView||'inbox')}
async function sendAdminMail(inReplyTo=''){const from=document.getElementById('mailFrom')?.value||'',to=document.getElementById('mailTo')?.value.trim()||'',cc=document.getElementById('mailCc')?.value.trim()||'',bcc=document.getElementById('mailBcc')?.value.trim()||'',subject=document.getElementById('mailSubject')?.value.trim()||'',html=askDealMailEditor?.root?.innerHTML||'',text=askDealMailEditor?.getText()?.trim()||'',status=document.getElementById('mailSendStatus'),btn=document.getElementById('mailSendBtn');if(!to||!subject||!text){if(status)status.textContent='To, subject and message are required.';return}btn.disabled=true;btn.textContent='Sending...';try{await mailFn({action:'send',from,to,cc,bcc,subject,text,html,in_reply_to:inReplyTo||undefined});if(status)status.innerHTML='<b>Email sent successfully.</b>';window.askDealMailView='sent';setTimeout(()=>openMailView('sent'),700)}catch(e){if(status)status.textContent=e.message}finally{btn.disabled=false;btn.textContent='Send'}}
function extractEmail(v){const m=String(v||'').match(/<([^>]+)>/);return (m?m[1]:String(v||'')).trim()}
function sanitizeMailHtml(html){const t=document.createElement('template');t.innerHTML=String(html||'');t.content.querySelectorAll('script,iframe,object,embed,form').forEach(e=>e.remove());t.content.querySelectorAll('*').forEach(e=>[...e.attributes].forEach(a=>{if(/^on/i.test(a.name))e.removeAttribute(a.name);if((a.name==='href'||a.name==='src')&&/^javascript:/i.test(a.value))e.removeAttribute(a.name)}));return t.innerHTML}
function mailEsc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function mailEscAttr(v){return mailEsc(v).replace(/`/g,'&#96;')}

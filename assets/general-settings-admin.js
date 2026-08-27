const GENERAL_SETTING_FIELDS=[
  ['topbar_left','Top Header — Left Text','text'],
  ['topbar_right','Top Header — Right Text','text'],
  ['hero_title','Hero Title','text'],
  ['hero_highlight','Hero Highlighted Text','text'],
  ['hero_description','Hero Description','textarea'],
  ['footer_brand','Footer Brand','text'],
  ['footer_tagline','Footer Tagline','text'],
  ['social_facebook','Facebook URL','url'],
  ['social_instagram','Instagram URL','url'],
  ['social_linkedin','LinkedIn URL','url'],
  ['social_youtube','YouTube URL','url'],
  ['social_tiktok','TikTok URL','url'],
  ['social_x','X / Twitter URL','url']
];

async function showGeneralSettings(){
  setAdminSectionUrl('general');
  moduleCard.innerHTML=`<div class="deals-head"><div><h2 style="margin:0">⚙️ General Settings</h2><div class="result-count">Manage homepage header, hero, footer and social media links.</div></div><a class="btn btn-light" href="./" target="_blank">View Website ↗</a></div><div id="generalSettingsForm">Loading...</div>`;
  const {data,error}=await db.from('site_settings').select('key,value');
  const host=document.getElementById('generalSettingsForm');
  if(error){host.innerHTML=`<div class="notice"><b>General Settings database is not ready.</b><br>${gsEsc(error.message)}<br><br>Run <code>supabase/site-settings.sql</code> once in Supabase SQL Editor.</div>`;return;}
  const values=Object.fromEntries((data||[]).map(x=>[x.key,x.value||'']));
  host.innerHTML=`<form class="admin-form" onsubmit="saveGeneralSettings(event)">${GENERAL_SETTING_FIELDS.map(([key,label,type])=>type==='textarea'?`<div class="field full"><label>${label}</label><textarea name="${key}" rows="3" style="width:100%;border:1px solid #d0d5dd;border-radius:10px;padding:12px;font:inherit">${gsEsc(values[key]||'')}</textarea></div>`:`<div class="field ${key.startsWith('social_')?'':'full'}"><label>${label}</label><input name="${key}" type="${type}" value="${gsAttr(values[key]||'')}" placeholder="${key.startsWith('social_')?'https://...':''}"></div>`).join('')}<div class="full"><button class="btn btn-primary" type="submit">Save General Settings</button><span id="generalSettingsMsg" class="hint" style="margin-left:10px"></span></div></form>`;
}

async function saveGeneralSettings(e){
  e.preventDefault();const msg=document.getElementById('generalSettingsMsg');const rows=[];new FormData(e.target).forEach((value,key)=>rows.push({key,value:String(value).trim(),updated_at:new Date().toISOString()}));const {error}=await db.from('site_settings').upsert(rows,{onConflict:'key'});if(error){msg.textContent=error.message;return;}msg.textContent='Saved ✓';setTimeout(()=>msg.textContent='',2200);
}
function gsEsc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function gsAttr(v){return gsEsc(v).replace(/`/g,'&#96;')}

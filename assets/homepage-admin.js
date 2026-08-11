async function showHomepageSettings(){
  if(!db){alert('Admin database is not ready.');return;}
  const {data,error}=await db.from('homepage_settings').select('*').eq('id',1).single();
  if(error){moduleCard.innerHTML='<p>'+escapeHtmlOffer(error.message)+'</p>';return;}
  moduleCard.innerHTML=`<div class="deals-head"><div><h2 style="margin:0">🏠 Homepage Highlight</h2><div class="result-count">Control the orange banner shown inside “Deals near you”</div></div></div>
  <form onsubmit="saveHomepageSettings(event)" class="admin-form">
    <div class="field"><label>Small Heading</label><input id="homeEyebrow" value="${attr(data.eyebrow||'')}"></div>
    <div class="field"><label>Main Highlight</label><input id="homeTitle" value="${attr(data.title||'')}"></div>
    <div class="field full"><label>Subtitle</label><input id="homeSubtitle" value="${attr(data.subtitle||'')}"></div>
    <div class="field full"><label>Click Link</label><input id="homeLink" value="${attr(data.link_url||'deals.html')}"></div>
    <div class="field full"><label style="display:flex;align-items:center;gap:8px"><input id="homeActive" type="checkbox" ${data.active?'checked':''}> Show highlight banner on homepage</label></div>
    <div class="full"><button class="btn btn-primary">Save Homepage Highlight</button><div id="homeSaveMsg" class="hint" style="margin-top:8px"></div></div>
  </form>`;
}

async function saveHomepageSettings(e){
  e.preventDefault();
  const obj={eyebrow:document.getElementById('homeEyebrow').value.trim(),title:document.getElementById('homeTitle').value.trim(),subtitle:document.getElementById('homeSubtitle').value.trim(),link_url:document.getElementById('homeLink').value.trim()||'deals.html',active:document.getElementById('homeActive').checked,updated_at:new Date().toISOString()};
  const {error}=await db.from('homepage_settings').update(obj).eq('id',1);
  document.getElementById('homeSaveMsg').textContent=error?error.message:'Saved. Homepage highlight updated.';
}

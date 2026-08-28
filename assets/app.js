(()=>{if(!document.querySelector('script[data-askdeal-shell]')){const s=document.createElement('script');s.src='assets/global-shell.js?v=1';s.dataset.askdealShell='1';document.head.appendChild(s)}})();

function toggleDrawer(open=true){document.getElementById('drawer')?.classList.toggle('open',open);document.getElementById('backdrop')?.classList.toggle('show',open)}
function showToast(t){const el=document.getElementById('toast');if(!el)return;el.textContent=t;el.style.display='block';setTimeout(()=>el.style.display='none',2400)}

// Public deal data is loaded only from Supabase by assets/offers-public.js.
// No prototype/sample offers are kept in the production frontend.
function renderDeals(){
  const grid=document.getElementById('dealGrid');
  if(!grid)return;
  if(!grid.innerHTML.trim())grid.innerHTML='<div class="card" style="grid-column:1/-1;text-align:center"><h3>Loading published offers...</h3><p>Checking the latest Ask Deal listings.</p></div>';
}
function useLocation(){
  const text=document.getElementById('locationText');
  if(!navigator.geolocation){if(text)text.textContent='Location is not supported by this browser.';return}
  if(text)text.textContent='Requesting location permission...';
  navigator.geolocation.getCurrentPosition(p=>{
    if(text)text.textContent=`Location enabled ✓ (${p.coords.latitude.toFixed(3)}, ${p.coords.longitude.toFixed(3)}). Nearby ranking activated.`;
    showToast('Location enabled.');
  },()=>{if(text)text.textContent='Location access was not allowed. Filter by state instead.'})
}
function resetFilters(){['keyword','state','category','period'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});const s=document.getElementById('sort');if(s)s.value='recommended';location.href='deals.html'}

// Product comparison remains available as a feature shell, but production shows no fabricated prices.
function renderComparison(){
  const host=document.getElementById('compareResult');
  if(!host)return;
  host.innerHTML='<div class="card" style="text-align:center"><h3>No comparison data available yet</h3><p>Verified product price data will appear here when it is added from approved sources.</p></div>';
}

/* PWA */
let askDealDeferredInstallPrompt=null;
function setupPwaHead(){if(!document.querySelector('link[rel="manifest"]')){const m=document.createElement('link');m.rel='manifest';m.href='manifest.webmanifest';document.head.appendChild(m)}if(!document.querySelector('meta[name="theme-color"]')){const t=document.createElement('meta');t.name='theme-color';t.content='#e53935';document.head.appendChild(t)}if(!document.querySelector('meta[name="apple-mobile-web-app-capable"]')){const a=document.createElement('meta');a.name='apple-mobile-web-app-capable';a.content='yes';document.head.appendChild(a)}if(!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')){const a=document.createElement('meta');a.name='apple-mobile-web-app-status-bar-style';a.content='default';document.head.appendChild(a)}if(!document.querySelector('link[data-askdeal-pwa-css]')){const c=document.createElement('link');c.rel='stylesheet';c.href='assets/pwa.css';c.dataset.askdealPwaCss='1';document.head.appendChild(c)}if(!document.querySelector('script[data-askdeal-v2]')){const s=document.createElement('script');s.src='assets/pwa-v2.js';s.dataset.askdealV2='1';document.body.appendChild(s)}}
function setupPwaNav(){if(document.querySelector('.naps-bottom-nav')||location.pathname.endsWith('admin.html')||location.pathname.endsWith('accept-invite.html'))return;const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();const nav=document.createElement('nav');nav.className='naps-bottom-nav';nav.setAttribute('aria-label','App navigation');const active=(pages)=>pages.includes(page)?'active':'';nav.innerHTML=`<a class="${active(['index.html',''])}" href="index.html"><span class="ico">🏠</span><span>Home</span></a><a class="${active(['deals.html','deal-detail.html','offer.html'])}" href="deals.html"><span class="ico">🔥</span><span>Deals</span></a><a class="${active(['compare.html'])}" href="compare.html"><span class="ico">⚖️</span><span>Compare</span></a><a href="deals.html?near=1"><span class="ico">📍</span><span>Near Me</span></a><button type="button" onclick="toggleDrawer(true)"><span class="ico">☰</span><span>More</span></button>`;document.body.appendChild(nav);const install=document.createElement('button');install.className='naps-install-fab';install.id='askDealInstallButton';install.textContent='⬇ Install Ask Deal';install.onclick=installAskDealPwa;document.body.appendChild(install)}
async function installAskDealPwa(){if(!askDealDeferredInstallPrompt){showToast('Use your browser menu and choose “Add to Home Screen”.');return}askDealDeferredInstallPrompt.prompt();await askDealDeferredInstallPrompt.userChoice;askDealDeferredInstallPrompt=null;document.getElementById('askDealInstallButton')?.classList.remove('show')}
function registerAskDealServiceWorker(){if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(e=>console.warn('Ask Deal service worker:',e))}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();askDealDeferredInstallPrompt=e;document.getElementById('askDealInstallButton')?.classList.add('show')});window.addEventListener('appinstalled',()=>{askDealDeferredInstallPrompt=null;document.getElementById('askDealInstallButton')?.classList.remove('show');showToast('Ask Deal installed successfully.')});
document.addEventListener('DOMContentLoaded',()=>{setupPwaHead();setupPwaNav();registerAskDealServiceWorker();renderDeals();renderComparison()});
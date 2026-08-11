const dealData = [
 {merchant:"Lotus's",product:"Saji Cooking Oil 5kg",title:"Cooking Oil Promotion",category:"Grocery",state:"Kuala Lumpur",period:"now",price:29.90,originalPrice:34.90,discount:14,distance:2.1,ends:"Today",tag:"Cooking Oil",icon:"🛢️"},
 {merchant:"NSK",product:"Knife Cooking Oil 5kg",title:"Value Pack Cooking Oil Deal",category:"Grocery",state:"Selangor",period:"now",price:28.50,originalPrice:33.50,discount:15,distance:4.1,ends:"4 days",tag:"Cooking Oil",icon:"🛢️"},
 {merchant:"AEON",product:"Buruh Cooking Oil 5kg",title:"Member Price Cooking Oil",category:"Grocery",state:"Selangor",period:"week",price:30.90,originalPrice:35.90,discount:14,distance:5.6,ends:"Sunday",tag:"Cooking Oil",icon:"🛢️"},
 {merchant:"Jaya Grocer",product:"Naturel Cooking Oil 3kg",title:"Healthy Cooking Oil Special",category:"Grocery",state:"Kuala Lumpur",period:"week",price:24.90,originalPrice:28.90,discount:14,distance:3.5,ends:"Sunday",tag:"Cooking Oil",icon:"🛢️"},
 {merchant:"Watsons",product:"Selected Skincare",title:"Member Weekend — Buy 2, Get 1 Free",category:"Shop",state:"Kuala Lumpur",period:"now",price:19.90,originalPrice:29.90,discount:33,distance:0.7,ends:"2 days",tag:"Beauty & Pharmacy",icon:"💄"},
 {merchant:"Padini",product:"Selected Fashion Items",title:"Mid-Season Clearance",category:"Shop",state:"Selangor",period:"clearance",price:19.00,originalPrice:69.00,discount:70,distance:5.2,ends:"Sunday",tag:"Fashion",icon:"👕"},
 {merchant:"UNIQLO",product:"AIRism T-Shirt",title:"Limited Offer on AIRism Essentials",category:"Shop",state:"Kuala Lumpur",period:"week",price:39.90,originalPrice:49.90,discount:20,distance:2.8,ends:"5 days",tag:"Fashion",icon:"👚"},
 {merchant:"KFC",product:"Lunch Combo",title:"Lunch Combo Special",category:"Restaurant",state:"Negeri Sembilan",period:"now",price:12.99,originalPrice:16.90,discount:23,distance:1.4,ends:"Today",tag:"Food Deal",icon:"🍗"},
 {merchant:"McDonald's",product:"Value Meal",title:"App Exclusive Meal Voucher",category:"Restaurant",state:"Selangor",period:"freebies",price:10.90,originalPrice:13.90,discount:22,distance:0.9,ends:"3 days",tag:"Promo Code",icon:"🍔"},
 {merchant:"Jaya Grocer",product:"Fresh Vegetables Bundle",title:"Fresh Picks Weekend Promotion",category:"Grocery",state:"Kuala Lumpur",period:"week",price:15.90,originalPrice:19.90,discount:20,distance:3.5,ends:"Sunday",tag:"Grocery",icon:"🛒"},
 {merchant:"Tech Expo",product:"Entry Laptop",title:"Laptop & Smartphone Expo Deals",category:"Electronics",state:"Penang",period:"upcoming",price:1499.00,originalPrice:1899.00,discount:21,distance:12.0,ends:"Starts Fri",tag:"Electronics",icon:"💻"},
 {merchant:"Sports Direct",product:"Running Shoes",title:"Running Shoes Clearance",category:"Sports",state:"Johor",period:"clearance",price:89.00,originalPrice:179.00,discount:50,distance:7.8,ends:"6 days",tag:"Sports",icon:"👟"},
 {merchant:"GSC",product:"Movie Ticket",title:"Tuesday Movie Ticket Promotion",category:"Movie",state:"Kuala Lumpur",period:"week",price:12.00,originalPrice:18.00,discount:33,distance:1.9,ends:"Tuesday",tag:"Cinema",icon:"🎬"},
 {merchant:"Travel Fair",product:"Travel Package",title:"Weekend Travel Fair — Flight & Hotel Deals",category:"Fair",state:"Kuala Lumpur",period:"upcoming",price:399.00,originalPrice:599.00,discount:33,distance:6.3,ends:"Starts Sat",tag:"Travel Fair",icon:"✈️"},
 {merchant:"Home Expo",product:"Air Fryer",title:"Home Appliance Expo Deal",category:"Exhibition",state:"Selangor",period:"upcoming",price:199.00,originalPrice:299.00,discount:33,distance:10.5,ends:"Starts Fri",tag:"Home Expo",icon:"🏠"}
];

function toggleDrawer(open=true){
  document.getElementById('drawer')?.classList.toggle('open',open);
  document.getElementById('backdrop')?.classList.toggle('show',open);
}
function showToast(t){const el=document.getElementById('toast'); if(!el)return; el.textContent=t;el.style.display='block';setTimeout(()=>el.style.display='none',2400);}

function renderDeals(){
  const grid=document.getElementById('dealGrid'); if(!grid)return;

  const kw=(document.getElementById('keyword')?.value||'').trim().toLowerCase();
  const state=document.getElementById('state')?.value||'';
  const cat=document.getElementById('category')?.value||'';
  const period=document.getElementById('period')?.value||'';
  const minPrice=parseFloat(document.getElementById('minPrice')?.value);
  const maxPrice=parseFloat(document.getElementById('maxPrice')?.value);
  const sort=document.getElementById('sort')?.value||'recommended';

  let list=dealData.filter(d=>{
    const searchable=(d.merchant+' '+d.product+' '+d.title+' '+d.tag+' '+d.category).toLowerCase();
    return (!kw || searchable.includes(kw))
      && (!state || d.state===state)
      && (!cat || d.category===cat)
      && (!period || d.period===period)
      && (Number.isNaN(minPrice) || d.price>=minPrice)
      && (Number.isNaN(maxPrice) || d.price<=maxPrice);
  });

  if(sort==='price_low') list.sort((a,b)=>a.price-b.price);
  if(sort==='price_high') list.sort((a,b)=>b.price-a.price);
  if(sort==='discount') list.sort((a,b)=>b.discount-a.discount);
  if(sort==='distance') list.sort((a,b)=>a.distance-b.distance);

  grid.innerHTML=list.map(d=>`
    <article class="deal">
      <div class="deal-img">
        <div><div style="font-size:38px">${d.icon}</div><div class="merchant">${d.merchant}</div></div>
        <span class="badge">${d.period==='now'?'LIVE':d.period.toUpperCase()}</span>
      </div>
      <div class="deal-body">
        <div class="tag">${d.tag}</div>
        <h3 style="margin-bottom:3px">${d.product}</h3>
        <div style="color:#667085;font-size:13px">${d.title}</div>
        <div class="meta"><span>📍 ${d.state}</span><span>🚗 ${d.distance} km</span><span>⏰ ${d.ends}</span></div>
        <div style="display:flex;align-items:baseline;gap:8px;margin:8px 0 12px">
          <strong style="font-size:22px;color:#168a55">RM ${d.price.toFixed(2)}</strong>
          <span style="text-decoration:line-through;color:#98a2b3;font-size:13px">RM ${d.originalPrice.toFixed(2)}</span>
        </div>
        <div class="price-row">
          <div class="discount">${d.discount}% OFF</div>
          <a class="view" href="deal-detail.html">View deal →</a>
        </div>
      </div>
    </article>`).join('');

  if(!list.length) grid.innerHTML='<div class="card" style="grid-column:1/-1;text-align:center"><h3>No matching products found</h3><p>Try another product name, price range, category or state.</p></div>';

  const c=document.getElementById('resultCount');
  if(c)c.textContent=list.length+' product offers found';
}

function useLocation(){
  const text=document.getElementById('locationText');
  if(!navigator.geolocation){if(text)text.textContent='Location is not supported by this browser.';return;}
  if(text)text.textContent='Requesting location permission...';
  navigator.geolocation.getCurrentPosition(
    p=>{
      if(text)text.textContent=`Location enabled ✓ (${p.coords.latitude.toFixed(3)}, ${p.coords.longitude.toFixed(3)}). Nearby ranking activated.`;
      const s=document.getElementById('sort');if(s)s.value='distance';
      renderDeals();showToast('Nearby offers are prioritized.');
    },
    ()=>{if(text)text.textContent='Location access was not allowed. Filter by state instead.';}
  );
}
function resetFilters(){
  ['keyword','state','category','period','minPrice','maxPrice'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});
  const s=document.getElementById('sort');if(s)s.value='recommended';
  renderDeals();
}
document.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search).get('q');
  if(q && document.getElementById('keyword')) document.getElementById('keyword').value=q;
  renderDeals();
});

const comparisonProducts = [
 {name:"Saji Cooking Oil 5kg",merchant:"Lotus's",price:29.90,original:34.90,discount:14,state:"Kuala Lumpur",distance:2.1},
 {name:"Knife Cooking Oil 5kg",merchant:"NSK",price:28.50,original:33.50,discount:15,state:"Selangor",distance:4.1},
 {name:"Buruh Cooking Oil 5kg",merchant:"AEON",price:30.90,original:35.90,discount:14,state:"Selangor",distance:5.6},
 {name:"Naturel Cooking Oil 3kg",merchant:"Jaya Grocer",price:24.90,original:28.90,discount:14,state:"Kuala Lumpur",distance:3.5},
 {name:"Entry Laptop 14 inch",merchant:"Tech Expo",price:1499.00,original:1899.00,discount:21,state:"Penang",distance:12},
 {name:"Running Shoes",merchant:"Sports Direct",price:89.00,original:179.00,discount:50,state:"Johor",distance:7.8}
];
function renderComparison(){
  const host=document.getElementById('compareResult'); if(!host)return;
  const q=(document.getElementById('compareSearch')?.value||'').toLowerCase().trim();
  const sort=document.getElementById('compareSort')?.value||'low';
  let rows=comparisonProducts.filter(x=>!q || (x.name+' '+x.merchant).toLowerCase().includes(q));
  if(sort==='low')rows.sort((a,b)=>a.price-b.price);
  if(sort==='high')rows.sort((a,b)=>b.price-a.price);
  if(sort==='discount')rows.sort((a,b)=>b.discount-a.discount);
  if(sort==='near')rows.sort((a,b)=>a.distance-b.distance);
  const cheapest=rows.length?Math.min(...rows.map(x=>x.price)):null;
  host.innerHTML=rows.length?`<div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>Product</th><th>Seller</th><th>Offer Price</th><th>Original</th><th>Discount</th><th>Location</th><th>Distance</th></tr></thead><tbody>${rows.map(x=>`<tr class="${x.price===cheapest?'best-row':''}"><td><b>${x.name}</b>${x.price===cheapest?' <span class="best-badge">Cheapest</span>':''}</td><td>${x.merchant}</td><td><b>RM ${x.price.toFixed(2)}</b></td><td><span style="text-decoration:line-through;color:#98a2b3">RM ${x.original.toFixed(2)}</span></td><td>${x.discount}%</td><td>${x.state}</td><td>${x.distance} km</td></tr>`).join('')}</tbody></table></div>`:'<div class="card"><h3>No comparison found</h3><p>Try another product keyword.</p></div>';
}
document.addEventListener('DOMContentLoaded',()=>renderComparison());

(function(){
  function cleanPath(path){
    if(!path.endsWith('.html'))return path;
    if(path.endsWith('/index.html'))return path.slice(0,-10)||'/';
    return path.slice(0,-5);
  }
  function cleanAnchor(a){
    const raw=a.getAttribute('href');
    if(!raw||raw.startsWith('#')||raw.startsWith('mailto:')||raw.startsWith('tel:')||raw.startsWith('javascript:'))return;
    try{
      const u=new URL(raw,location.href);
      if(u.origin!==location.origin||!u.pathname.endsWith('.html'))return;
      a.setAttribute('href',cleanPath(u.pathname)+u.search+u.hash);
    }catch(e){}
  }
  function cleanAll(root=document){root.querySelectorAll?.('a[href]').forEach(cleanAnchor)}
  cleanAll();
  const observer=new MutationObserver(muts=>muts.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.matches?.('a[href]'))cleanAnchor(n);cleanAll(n)})));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(location.pathname.endsWith('.html'))history.replaceState(history.state,'',cleanPath(location.pathname)+location.search+location.hash);
})();
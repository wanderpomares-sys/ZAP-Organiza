const CACHE='zo-static';
const ASSETS=['./','./index.html','./parser.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{const c=await caches.open(CACHE);await Promise.all(ASSETS.map(a=>c.add(new Request(a,{cache:'reload'})).catch(()=>{})));await self.skipWaiting()})());
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!=='zo-shared').map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method==='POST'&&url.pathname.endsWith('/share-target')){
    e.respondWith((async()=>{
      try{const fd=await req.formData();const f=fd.get('file');
        if(f){const c=await caches.open('zo-shared');await c.put('shared-file',new Response(f,{headers:{'Content-Type':f.type||'image/jpeg'}}))}}catch{}
      return Response.redirect('./index.html?shared=1',303);
    })());
    return;
  }
  if(req.method!=='GET')return;
  // Arquivos do próprio app: SEMPRE tenta a versão nova primeiro; sem internet usa a cópia guardada.
  if(url.origin===location.origin){
    e.respondWith((async()=>{
      try{
        const res=await fetch(req,{cache:'no-cache'});
        if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}
        return res;
      }catch{
        return (await caches.match(req,{ignoreSearch:true}))||(req.mode==='navigate'?await caches.match('./index.html'):Response.error());
      }
    })());
    return;
  }
  // Leitor de OCR (CDN): não muda, então usa a cópia guardada primeiro.
  if(url.hostname.includes('jsdelivr')){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res})));
  }
});

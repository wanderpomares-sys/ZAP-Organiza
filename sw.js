const CACHE='zo-v4';
const ASSETS=['./','./index.html','./parser.js','./manifest.webmanifest?v=4','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!=='zo-shared').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
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
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    if(res.ok&&(url.origin===location.origin||url.hostname.includes('jsdelivr'))){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}
    return res;
  }).catch(()=>hit)));
});

// Read Aloud PDF - offline service worker
const SHELL = "read-aloud-pdf-v7";
const RUNTIME = "neural-runtime-v1";
const ASSETS = ["./","./index.html","./pdf.min.js","./pdf.worker.min.js","./manifest.webmanifest","./apple-touch-icon.png","./icon-192.png","./icon-512.png","./icon-512-maskable.png"];
self.addEventListener("install", (e)=>{ self.skipWaiting(); e.waitUntil(caches.open(SHELL).then((c)=>c.addAll(ASSETS)).catch(()=>{})); });
self.addEventListener("activate", (e)=>{
  e.waitUntil(caches.keys().then((keys)=>Promise.all(keys.map((k)=>{
    // Only remove OUR OWN outdated shell/runtime caches. Never touch third-party
    // caches such as transformers.js's "transformers-cache" (the ~80MB neural
    // voice model), so the natural voice stays offline-ready across app updates.
    if(k!==SHELL && k!==RUNTIME && /^(read-aloud-pdf|neural-runtime)-v/.test(k)) return caches.delete(k);
  }))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", (e)=>{
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  // Our own app shell: cache-first, offline fallback to index.
  if(url.origin === self.location.origin){
    e.respondWith(caches.match(req).then((hit)=> hit || fetch(req).catch(()=>caches.match("./index.html"))));
    return;
  }
  // Neural engine + ONNX runtime from jsDelivr: durably cache in Cache Storage so
  // the natural voice keeps working offline after one online session. Falls back to
  // a normal network fetch if anything goes wrong, so it can never break the app.
  if(url.hostname === "cdn.jsdelivr.net" || url.hostname === "unpkg.com" || url.hostname === "tessdata.projectnaptha.com"){
    e.respondWith(
      caches.open(RUNTIME).then((cache)=> cache.match(req).then((hit)=> hit || fetch(req).then((res)=>{
        if(res && res.ok && res.type !== "opaque"){ cache.put(req, res.clone()); }
        return res;
      }))).catch(()=>fetch(req))
    );
    return;
  }
  // Everything else (e.g. the HuggingFace model files) passes through; Transformers.js caches those itself.
});

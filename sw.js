// Read Aloud PDF - offline service worker
// Bump CACHE on every release so installed clients pick up the new build.
const CACHE = "read-aloud-pdf-v9";
const RUNTIME = "read-aloud-runtime-v2";   // neural engine scripts + voice files
const ASSETS = [
  "./","./index.html","./manifest.webmanifest",
  "./apple-touch-icon.png","./icon-192.png","./icon-512.png","./icon-512-maskable.png"
];
self.addEventListener("install", (e)=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c)=>Promise.all(
      // cache:"reload" bypasses the HTTP cache so a new release is not
      // pre-cached from a stale copy; per-asset catch tolerates one miss.
      ASSETS.map((u)=>c.add(new Request(u,{cache:"reload"})).catch(()=>{}))
    ))
  );
});
self.addEventListener("activate", (e)=>{
  e.waitUntil(
    caches.keys().then((keys)=>Promise.all(
      keys.filter((k)=>k!==CACHE && k!==RUNTIME).map((k)=>caches.delete(k))   // includes "transformers-cache" from the old engine
    )).then(()=>self.clients.claim())
  );
});

// Cross-origin assets the neural voice needs offline: the kokoro-js /
// onnxruntime scripts and wasm binary from jsDelivr, and the per-voice style
// files from Hugging Face. The model weights themselves are persisted by
// transformers.js in its own cache, so they are deliberately excluded here.
function isEngineAsset(url){
  if(url.hostname === "cdn.jsdelivr.net") return true;   // engine scripts, +esm modules, wasm
  // All Hugging Face traffic: Piper voice models (~60MB each) and their
  // configs. Cache-first means each voice crosses the network exactly once,
  // regardless of what happens to the browser's private file storage.
  return url.hostname === "huggingface.co" || url.hostname.endsWith(".huggingface.co") ||
         url.hostname === "hf.co" || url.hostname.endsWith(".hf.co");
}

self.addEventListener("fetch", (e)=>{
  const req = e.request;
  if(req.method !== "GET") return;
  let url;
  try{ url = new URL(req.url); }catch(err){ return; }

  if(url.origin !== self.location.origin){
    if(!isEngineAsset(url)) return;                    // everything else passes through
    e.respondWith(
      caches.open(RUNTIME).then((c)=>
        c.match(req).then((hit)=> hit || fetch(req).then((res)=>{
          if(res && (res.ok || res.type === "opaque")){ c.put(req, res.clone()).catch(()=>{}); }
          return res;
        }))
      )
    );
    return;
  }

  e.respondWith(
    caches.match(req, {ignoreSearch:true}).then((hit)=>
      hit || fetch(req).then((res)=>{
        if(res && res.ok){
          const copy = res.clone();
          caches.open(CACHE).then((c)=>c.put(req, copy)).catch(()=>{});
        }
        return res;
      }).catch(()=> req.mode === "navigate" ? caches.match("./index.html") : Response.error())
    )
  );
});

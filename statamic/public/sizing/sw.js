/* Constructure Indicative Sizing — service worker.
   Bump VERSION to force clients to pick up a new build. */
var VERSION='cst-sizing-v3';
var RUNTIME='cst-runtime-v1';
var SHELL=['./','./index.html','./manifest.webmanifest',
           './icon-192.png','./icon-512.png','./apple-touch-icon-180.png','./favicon-32.png'];

self.addEventListener('install',function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(VERSION).then(function(c){return c.addAll(SHELL);}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k!==VERSION && k!==RUNTIME) return caches.delete(k);
      }));
    }).then(function(){return self.clients.claim();})
  );
});

self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET') return;
  var url=new URL(req.url);

  if(req.mode==='navigate'){
    e.respondWith(fetch(req).catch(function(){return caches.match('./index.html');}));
    return;
  }

  var sameOrigin=url.origin===self.location.origin;
  var isFont=url.origin.indexOf('fonts.googleapis.com')>-1 || url.origin.indexOf('fonts.gstatic.com')>-1;
  if(!sameOrigin && !isFont) return;

  e.respondWith(
    caches.match(req).then(function(hit){
      if(hit) return hit;
      return fetch(req).then(function(res){
        var copy=res.clone();
        caches.open(sameOrigin?VERSION:RUNTIME).then(function(c){try{c.put(req,copy);}catch(_){}});
        return res;
      }).catch(function(){return hit;});
    })
  );
});

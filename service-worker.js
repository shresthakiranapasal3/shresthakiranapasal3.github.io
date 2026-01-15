const CACHE_NAME = "kirana-v1";
const FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/logo.png",
  "/manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});

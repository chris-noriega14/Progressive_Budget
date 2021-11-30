const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const CACHEFILES = [
  '/',
  './index.html',
  './styles.css',
  './index.js',
  './indexeddb.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
];

// install
self.addEventListener("install", (event) => { 

  // pre cache all static files
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHEFILES))
    .then(self.skipWaiting())
  ); 
});

// activate
self.addEventListener("activate", function(event) {
    event.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });

// fetch
self.addEventListener("fetch", function(event) {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(event.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        return response || fetch(event.request);
      });
    })
  );
});
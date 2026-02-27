// Version your cache for updates
const CACHE_NAME = "dart-counter-v2.1.0";

// Files to cache
const urlsToCache = [
  "/",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/screens/home.js",
  "/screens/players.js",
  "/screens/cricketScreen.js",
  "/screens/halveItScreen.js",
  "/screens/x01Screen.js",
  "/screens/aroundTheWorldScreen.js",
  "/games/cricket.js",
  "/games/halveIt.js",
  "/games/x01.js",
  "/games/aroundTheWorld.js",
  "/models/player.js",
  "/models/cricket.js",
  "/models/halveIt.js",
  "/storage/storage.js"
];

// Detect if running on localhost (dev) to disable aggressive caching
const isDev = location.hostname === "localhost" || location.hostname === "127.0.0.1";

/* ===============================
   INSTALL
   =============================== */
self.addEventListener("install", event => {
  console.log("[SW] Install event");
  if (!isDev) {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log("[SW] Caching app shell");
          return cache.addAll(urlsToCache);
        })
    );
  }
  self.skipWaiting();
});

/* ===============================
   FETCH
   =============================== */
self.addEventListener("fetch", event => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return; // ignore cross-origin requests
  }

  // In dev, just fetch network (no caching)
  if (isDev) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  // In prod: network-first strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

/* ===============================
   ACTIVATE
   =============================== */
self.addEventListener("activate", event => {
  console.log("[SW] Activate event");
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log("[SW] Removing old cache:", name);
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

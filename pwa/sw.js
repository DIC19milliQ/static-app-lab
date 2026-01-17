const CACHE_VERSION = "v2";
const CACHE_NAME = `static-app-lab-${CACHE_VERSION}`;
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./src/db.js",
  "./src/model.js",
  "./src/ui.js",
  "./src/list.js",
  "./src/editor.js",
  "./src/dashboard.js",
  "./src/settings.js",
  "./src/import_export.js",
  "./src/utils.js",
  "./src/data_viewer.js",
  "./src/media_lab.js",
  "./src/calculator_lab.js",
  "./src/offline_lab.js",
  "./pwa/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached ||
      fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
    )
  );
});

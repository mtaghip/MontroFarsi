// Minimal service worker — enables "Add to Home Screen" install on Android.
// Network-first; no aggressive caching so data always stays fresh.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  // let the browser handle everything normally; just proxy through
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

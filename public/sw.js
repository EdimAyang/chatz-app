const VERSION = "1.0.1"; // bump this string on every deploy — this is what triggers update detection

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
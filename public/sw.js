// Bump this string on every deploy — the byte-diff is what triggers update detection.
const VERSION = "1.0.4";

self.addEventListener("install", () => {
  // Deliberately NOT calling self.skipWaiting() here.
  // The new worker will sit in "waiting" state until the user
  // clicks Reload, at which point main.tsx tells it to skip waiting.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
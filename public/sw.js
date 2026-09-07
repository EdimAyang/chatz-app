const VERSION = "1.0.5";

/* =========================
   Firebase
========================= */

importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "...",
  authDomain: "chatz-29664.firebaseapp.com",
  projectId: "chatz-29664",
  storageBucket: "chatz-29664.firebasestorage.app",
  messagingSenderId: "62212306014",
  appId: "1:62212306014:web:470662fc9d0dc24b2cf0cf",
});

const messaging = firebase.messaging();


/* =========================
   Service Worker Lifecycle
========================= */

self.addEventListener("install", () => {
  console.log("SW installing:", VERSION);

  // IMPORTANT:
  // Don't call skipWaiting() automatically.
});


self.addEventListener("activate", (event) => {

  event.waitUntil(
    clients.claim()
  );
});


/* =========================
   PWA Update
========================= */

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    console.log("SW received SKIP_WAITING");

    self.skipWaiting();
  }
});


/* =========================
   Firebase Notifications
========================= */

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[sw.js] Background message:",
    payload
  );

  const data = payload.data || {};

  self.registration.showNotification(
    data.title || "Chatz",
    {
      body: data.body || "",

      icon: new URL(
        data.icon || "/icons/icon-192.png",
        self.location.origin
      ).href,

      badge: new URL(
        data.badge || "/icons/notification.png",
        self.location.origin
      ).href,

      requireInteraction:
        data.requireInteraction === "true",

      vibrate: data.vibrate
        ? JSON.parse(data.vibrate)
        : [200, 100, 200],

      data: payload.data,
    }
  );
});


/* =========================
   Notification Click
========================= */

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const url =
      event.notification.data?.url || "/";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          for (const client of clientList) {
            if ("focus" in client) {
              client.navigate(url);
              return client.focus();
            }
          }

          return clients.openWindow(url);
        })
    );
  }
);
// const VERSION = "1.0.5";

// /* =========================
//    Firebase
// ========================= */

// importScripts(
//   "https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js"
// );

// importScripts(
//   "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js"
// );

// firebase.initializeApp({
//   apiKey: "...",
//   authDomain: "chatz-29664.firebaseapp.com",
//   projectId: "chatz-29664",
//   storageBucket: "chatz-29664.firebasestorage.app",
//   messagingSenderId: "62212306014",
//   appId: "1:62212306014:web:470662fc9d0dc24b2cf0cf",
// });

// const messaging = firebase.messaging();

// /* =========================
//    Service Worker Lifecycle
// ========================= */

// self.addEventListener("install", () => {
//   console.log("SW installing:", VERSION);

//   // IMPORTANT:
//   // Don't call skipWaiting() automatically.
// });

// self.addEventListener("activate", (event) => {

//   event.waitUntil(
//     clients.claim()
//   );
// });

// /* =========================
//    PWA Update
// ========================= */

// self.addEventListener("message", (event) => {
//   if (event.data === "SKIP_WAITING") {
//     console.log("SW received SKIP_WAITING");

//     self.skipWaiting();
//   }
// });

// /* =========================
//    Firebase Notifications
// ========================= */

// messaging.onBackgroundMessage((payload) => {
//   console.log(
//     "[sw.js] Background message:",
//     payload
//   );

//   const data = payload.data || {};

//   self.registration.showNotification(
//     data.title || "Chatz",
//     {
//       body: data.body || "",

//       icon: new URL(
//         data.icon || "/icons/icon-192.png",
//         self.location.origin
//       ).href,

//       badge: new URL(
//         data.badge || "/icons/notification.png",
//         self.location.origin
//       ).href,

//       requireInteraction:
//         data.requireInteraction === "true",

//       vibrate: data.vibrate
//         ? JSON.parse(data.vibrate)
//         : [200, 100, 200],

//       data: payload.data,
//     }
//   );
// });

// /* =========================
//    Notification Click
// ========================= */

// self.addEventListener(
//   "notificationclick",
//   (event) => {
//     event.notification.close();

//     const url =
//       event.notification.data?.url || "/";

//     event.waitUntil(
//       clients
//         .matchAll({
//           type: "window",
//           includeUncontrolled: true,
//         })
//         .then((clientList) => {
//           for (const client of clientList) {
//             if ("focus" in client) {
//               client.navigate(url);
//               return client.focus();
//             }
//           }

//           return clients.openWindow(url);
//         })
//     );
//   }
// );

const VERSION = "1.0.6";

/* =========================
   Firebase
========================= */

importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js",
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js",
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

  // Don't call skipWaiting automatically.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
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
   Notification Helpers
========================= */

const getNotificationIcon = (path) => {
  return new URL(path || "/icons/icon-192.png", self.location.origin).href;
};

const getVibrationPattern = (data, isCall) => {
  if (isCall) {
    return [500, 300, 500, 300, 500];
  }

  if (data.vibrate) {
    try {
      return JSON.parse(data.vibrate);
    } catch {
      return [200, 100, 200];
    }
  }

  return [200, 100, 200];
};

/* =========================
   Firebase Background Messages
========================= */

messaging.onBackgroundMessage(async (payload) => {
  console.log("[sw.js] Background message:", payload);

  const data = payload.data || {};

  const isIncomingCall = data.type === "INCOMING_CALL";

  const title = isIncomingCall
    ? data.title || "Incoming call"
    : data.title || "Chatz";

  const options = {
    body: data.body || "",

    icon: getNotificationIcon(data.icon || "/icons/icon-192.png"),

    badge: getNotificationIcon(data.badge || "/icons/notification.png"),

    tag: isIncomingCall
      ? `incoming-call-${data.callId || "unknown"}`
      : data.tag || "chatz-notification",

    renotify: true,

    requireInteraction: isIncomingCall
      ? true
      : data.requireInteraction === "true",

    vibrate: getVibrationPattern(data, isIncomingCall),

    data: {
      ...data,
      notificationType: isIncomingCall ? "INCOMING_CALL" : "GENERAL",
      url: data.url || "/",
    },

    actions: isIncomingCall
      ? [
          {
            action: "open-call",
            title: "Open call",
          },
        ]
      : [],
  };

  try {
    await self.registration.showNotification(title, options);

    console.log("[sw.js] Notification displayed:", title);
  } catch (error) {
    console.error("[sw.js] Failed to display notification:", error);
  }
});

/* =========================
   Notification Click
========================= */

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};

  const targetUrl = new URL(notificationData.url || "/", self.location.origin);

  // Only allow navigation within Chatz.
  if (targetUrl.origin !== self.location.origin) {
    return;
  }

  event.waitUntil(
    (async () => {
      try {
        const clientList = await clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });

        for (const client of clientList) {
          if ("focus" in client) {
            await client.navigate(targetUrl.href);
            await client.focus();
            return;
          }
        }

        await clients.openWindow(targetUrl.href);
      } catch (error) {
        console.error("[sw.js] Notification click error:", error);
      }
    })(),
  );
});

/* =========================
   Notification Close
========================= */

self.addEventListener("notificationclose", (event) => {
  console.log("[sw.js] Notification closed:", event.notification.data);
});

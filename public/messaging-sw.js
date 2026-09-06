importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js",
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyBXyg2kLAfyWezheM7b27OzjRvZiYzrcRg",
  authDomain: "chatz-29664.firebaseapp.com",
  projectId: "chatz-29664",
  storageBucket: "chatz-29664.firebasestorage.app",
  messagingSenderId: "62212306014",
  appId: "1:62212306014:web:470662fc9d0dc24b2cf0cf",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};

  self.registration.showNotification(data.title || "Chatz", {
    body: data.body || "",
    icon: data.icon || "/icons/icon-192.png",
    badge: data.badge || "/icons/notification.png",
    requireInteraction: data.requireInteraction === "true",
    vibrate: data.vibrate ? JSON.parse(data.vibrate) : [200, 100, 200],
    data: payload.data,
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const clickData = event.webpush.fcmOptions.link;
  const url = clickData?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
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
});
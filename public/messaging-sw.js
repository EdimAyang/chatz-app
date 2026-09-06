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
  console.log("[firebase-messaging-sw.js] Background message:", payload);

  const title = payload.data.title;

  const options = {
    body: payload.data.body,

    icon: "/icons/icon-192.png",

    badge: "/icons/notification.png",

    vibrate: [200, 100, 200],

    requireInteraction: true,

    data: {
      url: payload.data.url || "/",
      conversationId: payload.data.conversationId,
      messageId: payload.data.messageId,
    },
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

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
      }),
  );
});

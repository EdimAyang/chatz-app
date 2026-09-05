importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js",
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js",
);



firebase.initializeApp({
  apiKey:"AIzaSyBXyg2kLAfyWezheM7b27OzjRvZiYzrcRg",
  authDomain: "chatz-29664.firebaseapp.com",
  projectId: "chatz-29664",
  storageBucket: "chatz-29664.firebasestorage.app",
  messagingSenderId: "62212306014",
  appId: "1:62212306014:web:470662fc9d0dc24b2cf0cf"
});



const messaging = firebase.messaging();


messaging.onBackgroundMessage((payload) => {
  const notification = payload.webPush?.notification;

  if (!notification) return;

  console.log("Displaying notification:", notification.title, notification.body);

  self.registration.showNotification(notification.title, {
    body: notification.body,
    icon: notification.icon || "/favicon.svg",
    badge: notification.badge || "/favicon-16x16.png",
    data: payload.data,
  });


  self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data;

  const url = data?.url || "/";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList) => {
      // If Chatz is already open, focus it and navigate
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      // Otherwise open Chatz
      return clients.openWindow(url);
    })
  );
});
});

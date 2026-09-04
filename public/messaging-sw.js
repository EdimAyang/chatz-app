importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js",
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js",
);

console.log("firebase-messaging-sw.js loaded");


firebase.initializeApp({
  apiKey:"AIzaSyBXyg2kLAfyWezheM7b27OzjRvZiYzrcRg",
  authDomain: "chatz-29664.firebaseapp.com",
  projectId: "chatz-29664",
  storageBucket: "chatz-29664.firebasestorage.app",
  messagingSenderId: "62212306014",
  appId: "1:62212306014:web:470662fc9d0dc24b2cf0cf"
});

console.log("Firebase initialized in service worker");


const messaging = firebase.messaging();

console.log("Firebase Messaging instance created in service worker");

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message", payload);

  const notification = payload.notification;

  if (!notification) return;

  console.log("Displaying notification:", notification.title, notification.body);

  self.registration.showNotification(notification.title, {
    body: notification.body,
    icon: notification.icon || "/android-chrome-192x192.png",
    badge: notification.badge || "/favicon-16x16.png",
    data: payload.data,
  });
});

import { getToken } from "firebase/messaging";
import { getFirebaseMessagingInstance } from "@/firebase/index";
import { registerFirebaseMessagingSW } from "@/firebase/register";

export async function registerForPushNotifications() {
  if (!("Notification" in window)) {
    return null;
  }

  if (!("serviceWorker" in navigator)) {
    return null;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.log("Notification permission denied");

    return null;
  }

  const messaging = await getFirebaseMessagingInstance();

  if (!messaging) {
    console.log("Firebase Messaging isn't supported");

    return null;
  }

  const serviceWorkerRegistration = await registerFirebaseMessagingSW();

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: serviceWorkerRegistration ?? undefined,
  });

  console.log("📱 FCM TOKEN:", token);

  alert(`FCM Token:\n${token}`);

  if (!token) {
    console.log("No FCM token available");

    return null;
  }

  return token;
}

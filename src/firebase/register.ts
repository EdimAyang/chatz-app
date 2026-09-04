export async function registerFirebaseMessagingSW() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  return navigator.serviceWorker.register(
    "/messaging-sw.js"
  );
}
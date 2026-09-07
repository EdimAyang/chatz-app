export async function registerFirebaseMessagingSW(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported");
  }

  return navigator.serviceWorker.ready;
}
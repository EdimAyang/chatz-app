export function registerAppServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
 
  navigator.serviceWorker.register("/sw.js").then((registration) => {
    // Check for a new version immediately, and then periodically while the app is open.
    registration.update();
    setInterval(() => registration.update(), 60_000);
 
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;
 
      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller // only true on a real update, not the very first install
        ) {
          window.dispatchEvent(new CustomEvent("app-update-available"));
        }
      });
    });
  });
}
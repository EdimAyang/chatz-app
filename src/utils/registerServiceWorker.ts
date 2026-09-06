let refreshing = false; // prevents a reload loop within a single page load
 
/**
 * Registers the app's service worker (/sw.js) and watches for new versions.
 * Call this ONCE, at app startup (e.g. in main.tsx), before rendering.
 */
export function registerAppServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
 
  // Capture this BEFORE registering. If the page was already controlled,
  // any later controllerchange is a genuine update. If this is null,
  // it's the very first-ever install for this client — that can still
  // auto-activate on its own (spec behavior, no prior worker to protect),
  // and must NOT be treated as "user wants to reload".
  const hadControllerAlready = Boolean(navigator.serviceWorker.controller);
 
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadControllerAlready) return; // ignore first-ever install false trigger
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
 
  navigator.serviceWorker.register("/sw.js").then((registration) => {
    registration.update();
    setInterval(() => registration.update(), 60_000);
 
    // Covers the rare case where a worker was already waiting before this tab loaded
    if (registration.waiting && hadControllerAlready) {
      window.dispatchEvent(
        new CustomEvent("app-update-available", { detail: registration })
      );
    }
 
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;
 
      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller // a real update, not the first-ever install
        ) {
          // Worker is installed and WAITING — it will not activate until told to.
          window.dispatchEvent(
            new CustomEvent("app-update-available", { detail: registration })
          );
        }
      });
    });
  });
}
 
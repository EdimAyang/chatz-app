let refreshing = false;
let updateRequested = false;

export function registerAppServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => {
    

      registration.addEventListener("updatefound", () => {
       
        const newWorker = registration.installing;

        if (!newWorker) {
          console.log("❌ No installing worker");
          return;
        }


        newWorker.addEventListener("statechange", () => {
          console.log(
            "SW state:",
            newWorker.state
          );

          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            console.log(
              "🟢 New SW installed and waiting"
            );

            window.dispatchEvent(
              new CustomEvent(
                "app-update-available",
                {
                  detail: registration,
                }
              )
            );
          }
        });
      });

      // Check for updates.
      registration.update();
    })
    .catch((error) => {
      console.error(
        "❌ SW registration failed:",
        error
      );
    });

  navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => {
      console.log("🔄 controllerchange");

      if (!updateRequested) {
        console.log(
          "Ignoring controllerchange - update not requested"
        );
        return;
      }

      if (refreshing) return;

      refreshing = true;

      window.location.reload();
    }
  );

  window.addEventListener(
    "app-update-requested",
    () => {
      updateRequested = true;
    }
  );
}
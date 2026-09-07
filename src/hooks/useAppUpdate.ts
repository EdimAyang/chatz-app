import { useEffect, useState, useRef } from "react";

export function useAppUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);

  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<ServiceWorkerRegistration>;

      const registration = custom.detail;

      if (!registration?.waiting) return;

      registrationRef.current = registration;

      setNeedRefresh(true);
    };

    window.addEventListener("app-update-available", handler);

    return () => {
      window.removeEventListener("app-update-available", handler);
    };
  }, []);

  const reload = () => {
    const waitingWorker = registrationRef.current?.waiting;

    console.log("Update clicked");
    console.log("Waiting worker:", waitingWorker);

    setNeedRefresh(false);

    if (!waitingWorker) {
      window.location.reload();
      return;
    }

    // Tell the SW system that this controllerchange
    // was intentionally triggered by the user.
    window.dispatchEvent(new Event("app-update-requested"));

    waitingWorker.postMessage("SKIP_WAITING");
  };

  const dismiss = () => {
    setNeedRefresh(false);
  };

  return {
    needRefresh,
    reload,
    dismiss,
  };
}

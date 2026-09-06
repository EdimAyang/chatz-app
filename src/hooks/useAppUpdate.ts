import { useEffect, useState, useRef } from "react";

export function useAppUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<ServiceWorkerRegistration>;
      registrationRef.current = custom.detail;
      setNeedRefresh(true);
    };
    window.addEventListener("app-update-available", handler);
    return () => window.removeEventListener("app-update-available", handler);
  }, []);

  const reload = () => {
    setNeedRefresh(false); // hide the toast immediately

    const waitingWorker = registrationRef.current?.waiting;
    if (waitingWorker) {
      waitingWorker.postMessage("SKIP_WAITING");
    } else {
      window.location.reload(); // fallback, shouldn't normally hit this
    }
  };

  const dismiss = () => setNeedRefresh(false);

  return { needRefresh, reload, dismiss };
}

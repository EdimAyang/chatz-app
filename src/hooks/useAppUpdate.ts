import { useEffect, useState } from "react";



// A small hook/component to listen for that event and show your toast
export function useAppUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
 
  useEffect(() => {
    const handler = () => setNeedRefresh(true);
    window.addEventListener("app-update-available", handler);
    return () => window.removeEventListener("app-update-available", handler);
  }, []);
 
  const reload = () => window.location.reload();
  const dismiss = () => setNeedRefresh(false);
 
  return { needRefresh, reload, dismiss };
}
 
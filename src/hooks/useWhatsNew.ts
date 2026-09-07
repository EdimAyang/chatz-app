import { useEffect, useState } from "react";
import {
  APP_UPDATE,
  APP_VERSION,
} from "@/lib/updateConfig";

const STORAGE_KEY = "chatz-seen-version";

export function useWhatsNew() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seenVersion =
      localStorage.getItem(STORAGE_KEY);

    if (seenVersion !== APP_VERSION) {
      setShow(true);
    }
  }, []);

  const close = () => {
    localStorage.setItem(
      STORAGE_KEY,
      APP_VERSION
    );

    setShow(false);
  };

  return {
    show,
    close,
    update: APP_UPDATE,
  };
}
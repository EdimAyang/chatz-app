import { useCallback, useState } from "react";

type NotificationPermissionState =
  | "default"
  | "granted"
  | "denied"
  | "unsupported";

export const useNotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermissionState>(
    () => {
      if (!("Notification" in window)) {
        return "unsupported";
      }

      return Notification.permission;
    },
  );

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return "unsupported";
    }

    // Already decided
    if (Notification.permission !== "default") {
      setPermission(Notification.permission);
      return Notification.permission;
    }

    const result = await Notification.requestPermission();

    setPermission(result);

    return result;
  }, []);

  return {
    permission,
    requestPermission,
    isGranted: permission === "granted",
    isDenied: permission === "denied",
    isDefault: permission === "default",
    isSupported: permission !== "unsupported",
  };
};

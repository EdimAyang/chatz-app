import { api } from "#/api/axios";
import { PATHS } from "#/lib/paths";

export const testNotification = async () => {
  try {
    const result = await api.get(PATHS.PUSH_NOTIFICATIONS.TEST);
    return result;
  } catch (err) {
    console.log(err);
  }
};


export function TestNotificationButton() {
  const handleTestNotification = async () => {
    try {
      const response = await testNotification();

      console.log("Notification response:", response);
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  return (
    <button onClick={handleTestNotification}>
      Send Test Notification
    </button>
  );
}
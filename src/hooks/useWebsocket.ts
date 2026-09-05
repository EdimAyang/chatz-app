import { useEffect } from "react";
import { useWebSocketStore } from "@/store/websocket.store";
import { useOnlineUsersStore } from "@/store/onlineUser.store";
// import toast from "react-hot-toast";

export function useWebSocket(token: string | null) {
  const connect = useWebSocketStore((state) => state.connect);

  const disconnect = useWebSocketStore((state) => state.disconnect);

  useEffect(() => {
    if (!token) return;

    connect(token);
  }, [token, connect]);

  useEffect(() => {
    const handleOnline = () => {
      const { isConnected, isConnecting, connect } =
        useWebSocketStore.getState();

      if (!isConnected && !isConnecting) {
        console.log("🌐 Network online. Checking WebSocket...");

        connect();
      }
    };

    const handleOffline = () => {
      useOnlineUsersStore.getState().clearOnlineUsers();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const { isConnected, isConnecting, connect } =
          useWebSocketStore.getState();

        if (!isConnected && !isConnecting) {
          console.log("👀 App visible. Checking WebSocket...");

          connect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return {
    disconnect,
  };
}

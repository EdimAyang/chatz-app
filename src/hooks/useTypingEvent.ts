import { useEffect } from "react";
import { useWebSocketStore } from "@/store/websocket.store";
import { SocketEvent } from "#/lib/constants";

export const useTyping = (
  conversationId: string | undefined,
  recipientId: string | undefined,
  message: string,
  userId: string,
) => {
  const send = useWebSocketStore((s) => s.send);

  useEffect(() => {
    send({
      type: SocketEvent.TYPING,
      conversationId,
      recipientId,
      isTyping: Boolean(message.length > 0),
      userId,
    });

    const timeout = setTimeout(() => {
      send({
        type: SocketEvent.STOP_TYPING,
        conversationId,
        recipientId,
        isTyping: false,
        userId,
      });
    }, 1200);

    return () => clearTimeout(timeout);
  }, [message, conversationId, recipientId, send, userId]);
};

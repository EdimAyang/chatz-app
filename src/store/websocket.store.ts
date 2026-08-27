import { create } from "zustand";
import { SocketEvent } from "#/lib/constants";
import { queryClient } from "@/lib/query-client";
import { useOnlineUsersStore } from "./onlineUser.store";
import toast from "react-hot-toast";

type CachedMessages = {
  pages: {
    messages: any[];
    nextCursor: string | null;
  }[];
  pageParams: unknown[];
};

type WebSocketState = {
  socket: WebSocket | null;
  token: string | null;

  isConnected: boolean;
  isConnecting: boolean;

  typingKey: string | null;
  typingUserId: string | null;

  createdConversationId: string | null;

  shouldReconnect: boolean;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  reconnectAttempts: number;

  setTyping: (typingKey: string, userId: string) => void;
  setCreatedConversationId: (id: string | null) => void;

  connect: (token?: string | null) => void;
  disconnect: () => void;

  send: (payload: any) => void;
};

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  socket: null,
  token: null,

  isConnected: false,
  isConnecting: false,

  typingKey: null,
  typingUserId: null,

  createdConversationId: null,

  shouldReconnect: true,
  reconnectTimer: null,
  reconnectAttempts: 0,

  setTyping: (typingKey, userId) => {
    set({
      typingKey,
      typingUserId: userId,
    });
  },

  setCreatedConversationId: (id) => {
    set({
      createdConversationId: id,
    });
  },

  connect: (newToken) => {
    const state = get();

    // Save token when provided
    const token = newToken ?? state.token;

    if (!token) {
      toast.error("No WebSocket token available");
      return;
    }

    const currentSocket = state.socket;

    // Don't create another connection if already connected
    if (
      currentSocket?.readyState === WebSocket.OPEN ||
      currentSocket?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    // Clear any existing reconnect timer
    if (state.reconnectTimer) {
      clearTimeout(state.reconnectTimer);
    }

    set({
      token,
      isConnecting: true,
      shouldReconnect: true,
      reconnectTimer: null,
    });

    const socket = new WebSocket(
      `${import.meta.env.VITE_WS_URL}?token=${encodeURIComponent(token)}`,
    );

    socket.onopen = () => {
      console.log("🟢 WebSocket connected");

      set({
        socket,
        isConnected: true,
        isConnecting: false,
        reconnectAttempts: 0,
      });
    };

    socket.onclose = () => {
      console.log("🔴 WebSocket disconnected");

      set({
        socket: null,
        isConnected: false,
        isConnecting: false,
        typingKey: null,
        typingUserId: null,
      });

      const { shouldReconnect, reconnectAttempts, reconnectTimer } = get();

      if (!shouldReconnect) {
        return;
      }

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      // Exponential backoff
      const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);

      toast.success(`🔄 Reconnecting in ${delay / 1000} seconds...`);

      const timer = setTimeout(() => {
        set({
          reconnectAttempts: reconnectAttempts + 1,
          reconnectTimer: null,
        });

        get().connect();
      }, delay);

      set({
        reconnectTimer: timer,
      });
    };

    socket.onerror = (error: any) => {
      toast.error("WebSocket error:", error.message);
    };

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      switch (payload.type) {
        case SocketEvent.TYPING:
          set({
            typingKey: payload.typingKey,
            typingUserId: payload.senderId,
          });
          break;

        case SocketEvent.STOP_TYPING:
          set({
            typingKey: null,
            typingUserId: null,
          });
          break;

        case SocketEvent.USER_ONLINE:
          useOnlineUsersStore.getState().setOnlineUsers(payload.users);
          break;

        case SocketEvent.NEW_MESSAGE: {
          const newMessage = {
            id: payload.messageId,
            conversationId: payload.conversationId,
            senderId: payload.senderId,
            messageType: payload.messageType,
            message: payload.message,
            attachmentUrl: payload.attachmentUrl,
            attachmentPublicId: payload.attachmentPublicId,
            mimeType: payload.mimeType,
            duration: payload.duration,
            isRead: payload.isRead,
            createdAt: new Date().toISOString(),
            readAt: null,
            updatedAt: null,
            isDeleted: false,
            deletedAt: null,
          };

          queryClient.setQueryData<CachedMessages>(
            ["messages", payload.conversationId],
            (old) => {
              if (!old) {
                return {
                  pages: [
                    {
                      messages: [newMessage],
                      nextCursor: null,
                    },
                  ],
                  pageParams: [],
                };
              }

              const pages = [...old.pages];
              const lastPage = pages[pages.length - 1];

              pages[pages.length - 1] = {
                ...lastPage,
                messages: [...lastPage.messages, newMessage],
              };

              return {
                ...old,
                pages,
              };
            },
          );

          queryClient.invalidateQueries({
            queryKey: ["conversations"],
          });

          // queryClient.invalidateQueries({
          //   queryKey: ["messages", payload.conversationId],
          // });

          if (payload.conversationId) {
            set({
              createdConversationId: payload.conversationId,
            });
          }

          break;
        }
      }
    };

    set({
      socket,
    });
  },

  disconnect: () => {
    const { socket, reconnectTimer } = get();

    // Stop automatic reconnection FIRST
    set({
      shouldReconnect: false,
    });

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    socket?.close();

    set({
      socket: null,
      token: null,
      isConnected: false,
      isConnecting: false,
      typingKey: null,
      typingUserId: null,
      reconnectTimer: null,
      reconnectAttempts: 0,
    });
  },

  send: (payload) => {
    const socket = get().socket;

    if (!socket) {
      toast.error("WebSocket not connected");
      return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
      toast.error("WebSocket is not ready");
      return;
    }

    socket.send(JSON.stringify(payload));
    queryClient.invalidateQueries({
      queryKey: ["messages", payload.conversationId],
    });
  },
}));

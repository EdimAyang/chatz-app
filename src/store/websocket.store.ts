import { create } from "zustand";
import { SocketEvent } from "#/lib/constants";
// import type { ClientMessagePayload } from "#/schema/websocket.schema";
import { queryClient } from "@/lib/query-client";
import { useOnlineUsersStore } from "./onlineUser.store";

type CachedMessages = {
  pages: {
    messages: any[];
    nextCursor: string | null;
  }[];
  pageParams: unknown[];
};

type WebSocketState = {
  socket: WebSocket | null;

  isConnected: boolean;

  // typing state
  typingKey: string | null;
  typingUserId: string | null;

  // new conversation created from first message
  createdConversationId: string | null;

  setTyping: (typingKey: string, userId: string) => void;

  setCreatedConversationId: (id: string | null) => void;

  connect: (token: string | null) => void;

  disconnect: () => void;

  send: (payload: any) => void;
};

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  socket: null,

  isConnected: false,

  typingKey: null,

  typingUserId: null,

  createdConversationId: null,

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

  connect: (token) => {
    const currentSocket = get().socket;

    if (currentSocket?.readyState === WebSocket.OPEN) {
      return;
    }

    const socket = new WebSocket(`${import.meta.env.VITE_WS_URL}?token=${token}`);

    socket.onopen = () => {
      console.log("🟢 Websocket connected");

      set({
        isConnected: true,
      });
    };

    socket.onclose = () => {
      console.log("🔴 Websocket disconnected");

      set({
        socket: null,

        isConnected: false,

        typingKey: null,

        typingUserId: null,
      });
    };

    socket.onerror = (error) => {
      console.error("Websocket error", error);
    };

    socket.onmessage = (event) => {
      // console.log(event)
      const payload = JSON.parse(event.data);
      // console.log(payload)

      switch (payload.type) {
        // =========================
        // TYPING
        // =========================

        case SocketEvent.TYPING:
          // console.log(payload)
          set({
            typingKey: payload.typingKey,

            typingUserId: payload.senderId,
          });

          break;

        // =========================
        // STOP TYPING
        // =========================

        case SocketEvent.STOP_TYPING:
          set({
            typingKey: null,

            typingUserId: null,
          });

          break;

        // =========================
        // USER ONLINE
        // =========================

        case SocketEvent.USER_ONLINE:
          useOnlineUsersStore.getState().setOnlineUsers(payload.users);

          break;

        // =========================
        // NEW MESSAGE
        // =========================

        case SocketEvent.NEW_MESSAGE: {
          // console.log("new message", payload);

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

          // update message cache

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

          // update conversations list

          queryClient.invalidateQueries({
            queryKey: ["conversations"],
          });

          queryClient.invalidateQueries({
            queryKey: ["messages", payload.conversationId],
          });

          // first message created conversation

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
    const socket = get().socket;

    socket?.close();

    set({
      socket: null,

      isConnected: false,

      typingKey: null,

      typingUserId: null,
    });
  },

  send: (payload) => {
    const socket = get().socket;

    if (!socket) return;

    if (socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify(payload));

    // only invalidate messages
    // for actual messages

    if (payload.type === SocketEvent.NEW_MESSAGE && payload.conversationId) {
      queryClient.invalidateQueries({
        queryKey: ["messages", payload.conversationId],
      });
    }
  },
}));

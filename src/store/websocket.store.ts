import { create } from "zustand";
import { SocketEvent } from "#/lib/constants";
import { queryClient } from "@/lib/query-client";
import { useOnlineUsersStore } from "./onlineUser.store";
import type { ChatMessage } from "#/types";
import {
  getPendingActions,
  removePendingAction,
} from "#/lib/offline/messageQueue";
import { useCallStore } from "./call.store";
import {
  configureWebRTC,
  createOffer,
  acceptOffer,
  acceptAnswer,
  addIceCandidate,
  closeWebRTC,
} from "@/webRTC";

export type CachedMessages = {
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

  send: (payload: any) => boolean;

  // 👇 THIS MUST BE HERE
  flushPendingActions: () => Promise<void>;
};

export const useWebSocketStore = create<WebSocketState>((set, get) => {
  configureWebRTC({
    onLocalStream: (stream) => {
      useCallStore.getState().setLocalStream(stream);
    },

    onIceCandidate: (candidate) => {
      const callId = useCallStore.getState().callId;

      if (!callId) {
        console.warn("Cannot send ICE candidate: callId is missing.");
        return;
      }

      const sent = get().send({
        type: "ICE_CANDIDATE",
        callId,
        candidate,
      });

      if (!sent) {
        console.error("Failed to send ICE candidate.");
      }
    },

    onRemoteStream: (stream) => {
      useCallStore.getState().setRemoteStream(stream);
    },
    
    onConnectionStateChange: (state) => {
      console.log("WebRTC connection state:", state);

      if (state === "connected") {
        useCallStore.getState().setStatus("connected");
      }

      if (state === "failed") {
        closeWebRTC();
        useCallStore
          .getState()
          .setError("The connection failed. Please try again.");
      }
    },

    onError: (error) => {
      console.error("WebRTC error:", error);
      closeWebRTC();
      useCallStore.getState().setError(error.message);
    },
  });

  return {
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

    flushPendingActions: async () => {
      const socket = get().socket;

      if (!navigator.onLine) {
        console.log("📴 Still offline, cannot flush actions");
        return;
      }

      if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.log("🔴 WebSocket not connected");
        return;
      }

      const pendingActions = await getPendingActions();

      if (!pendingActions.length) {
        console.log("📭 No pending actions");
        return;
      }

      console.log(`📦 Flushing ${pendingActions.length} pending action(s)`);

      for (const action of pendingActions) {
        if (!navigator.onLine) {
          console.log("📴 Went offline during flush");
          break;
        }

        if (socket.readyState !== WebSocket.OPEN) {
          console.log("🔴 Socket closed during flush");
          break;
        }

        console.log(`📤 Flushing ${action.type}:`, action.clientActionId);

        try {
          switch (action.type) {
            // =====================================================
            // SEND MESSAGE
            // =====================================================

            case "SEND_MESSAGE": {
              socket.send(
                JSON.stringify({
                  type: SocketEvent.NEW_MESSAGE,

                  conversationId: action.conversationId,

                  messageType: action.messageType,

                  message: action.message,

                  ...(action.recipientId && {
                    recipientId: action.recipientId,
                  }),

                  replyToMessageId: action.replyToMessageId ?? null,

                  clientMessageId: action.clientMessageId,

                  ...(action.duration != null && {
                    duration: action.duration,
                  }),
                }),
              );

              break;
            }

            // =====================================================
            // EDIT MESSAGE
            // =====================================================

            case "EDIT_MESSAGE": {
              if (!action.messageId) {
                console.warn("⚠️ EDIT_MESSAGE missing messageId", action);

                await removePendingAction(action.clientActionId);

                break;
              }

              socket.send(
                JSON.stringify({
                  type: SocketEvent.EDIT_MESSAGE,

                  conversationId: action.conversationId,

                  messageId: action.messageId,

                  message: action.message ?? "",

                  clientActionId: action.clientActionId,
                }),
              );

              break;
            }

            // =====================================================
            // DELETE MESSAGE
            // =====================================================

            case "DELETE_MESSAGE": {
              if (!action.messageId) {
                console.warn("⚠️ DELETE_MESSAGE missing messageId", action);

                await removePendingAction(action.clientActionId);

                break;
              }

              socket.send(
                JSON.stringify({
                  type: SocketEvent.DELETE_MESSAGE,

                  conversationId: action.conversationId,

                  messageId: action.messageId,

                  clientActionId: action.clientActionId,
                }),
              );

              break;
            }

            // =====================================================
            // ADD REACTION
            // =====================================================

            case "REACTION_ADD": {
              if (!action.messageId || !action.emoji) {
                console.warn(
                  "⚠️ REACTION_ADD missing messageId or emoji",
                  action,
                );

                await removePendingAction(action.clientActionId);

                break;
              }

              socket.send(
                JSON.stringify({
                  type: SocketEvent.MESSAGE_REACTION,

                  conversationId: action.conversationId,

                  messageId: action.messageId,

                  emoji: action.emoji,

                  action: "add",

                  clientActionId: action.clientActionId,
                }),
              );

              break;
            }

            // =====================================================
            // REMOVE REACTION
            // =====================================================

            case "REACTION_REMOVE": {
              if (!action.messageId || !action.emoji) {
                console.warn(
                  "⚠️ REACTION_REMOVE missing messageId or emoji",
                  action,
                );

                await removePendingAction(action.clientActionId);

                break;
              }

              socket.send(
                JSON.stringify({
                  type: SocketEvent.MESSAGE_REACTION,

                  conversationId: action.conversationId,

                  messageId: action.messageId,

                  emoji: action.emoji,

                  action: "remove",

                  clientActionId: action.clientActionId,
                }),
              );

              break;
            }

            // =====================================================
            // UNKNOWN
            // =====================================================

            default: {
              console.warn("⚠️ Unknown pending action:", action);

              await removePendingAction(action.clientActionId);
            }
          }
        } catch (error) {
          console.error(`❌ Failed to flush ${action.type}`, error);

          break;
        }
      }
    },

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

        void get().flushPendingActions();
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
        useOnlineUsersStore.getState().clearOnlineUsers();

        const { shouldReconnect, reconnectAttempts, reconnectTimer } = get();

        if (!shouldReconnect) {
          return;
        }

        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
        }

        // Exponential backoff
        const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);

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

      socket.onerror = () => undefined;

      socket.onmessage = async (event) => {
        const payload = JSON.parse(event.data);

        console.log("[WS RECEIVED]", payload);

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

          case "CALL_STARTED": {
            const callStore = useCallStore.getState();
            callStore.setCallId(payload.callId);

            if (
              callStore.status === "ended" &&
              callStore.recipientId &&
              callStore.conversationId
            ) {
              const sent = get().send({
                type: "END_CALL",
                callId: payload.callId,
                conversationId: callStore.conversationId,
              });

              if (!sent) {
                console.error(
                  "Failed to cancel outgoing call after receiving its call ID.",
                );
              }
            }
            break;
          }

          case "INCOMING_CALL": {
            useCallStore.getState().receiveIncomingCall(payload);
            break;
          }

          case "CALL_ACCEPTED": {
            try {
              const callStore = useCallStore.getState();
              const callId = payload.callId ?? callStore.callId;
              const callType = callStore.callType ?? "audio";

              if (!callId) {
                throw new Error("Cannot create offer: callId is missing.");
              }

              callStore.setStatus("connecting");

              const offer = await createOffer(callType);

              const sent = get().send({
                type: "WEBRTC_OFFER",
                callId,
                offer,
              });

              if (!sent) {
                throw new Error("Failed to send WebRTC offer.");
              }

              console.log("WebRTC offer sent successfully.");
            } catch (error) {
              if (error instanceof Error && error.name === "AbortError") {
                break;
              }

              console.error("Failed to create WebRTC offer:", error);
              useCallStore
                .getState()
                .setError(
                  error instanceof Error
                    ? error.message
                    : "Failed to start the call.",
                );
            }

            break;
          }

          case "CALL_REJECTED":
          case "CALL_ENDED": {
            closeWebRTC();
            useCallStore.getState().setStatus("ended");
            break;
          }

          case "CALL_BUSY": {
            closeWebRTC();
            useCallStore.getState().setError("The recipient is busy");
            break;
          }

          case "CALL_ERROR": {
            closeWebRTC();
            useCallStore.getState().setError(payload.message);
            break;
          }

          case "WEBRTC_OFFER": {
            try {
              const answer = await acceptOffer(
                payload.offer,
                useCallStore.getState().callType ?? "audio",
              );

              get().send({
                type: "WEBRTC_ANSWER",
                callId: payload.callId,
                answer,
              });
            } catch (error) {
              if (error instanceof Error && error.name === "AbortError") {
                break;
              }

              console.error("Failed to handle WebRTC offer:", error);
            }

            break;
          }

          case "WEBRTC_ANSWER": {
            try {
              await acceptAnswer(payload.answer);
            } catch (error) {
              console.error("Failed to handle WebRTC answer:", error);
            }

            break;
          }

          case "ICE_CANDIDATE": {
            try {
              await addIceCandidate(payload.candidate);
            } catch (error) {
              console.error("Failed to add ICE candidate:", error);
            }

            break;
          }

          case SocketEvent.MESSAGE_REACTION: {
            // ----------------------------------------
            // ACTION SUCCESSFULLY PROCESSED
            // ----------------------------------------

            if (payload.clientActionId) {
              void removePendingAction(payload.clientActionId);
            }

            queryClient.setQueryData(
              ["messages", payload.conversationId],
              (oldData: any) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  pages: oldData.pages.map((page: any) => ({
                    ...page,
                    messages: page.messages.map((message: any) => {
                      if (message.id !== payload.messageId) {
                        return message;
                      }

                      const reactions = message.reactions ?? [];

                      // ----------------------------------------
                      // REMOVE REACTION
                      // ----------------------------------------

                      if (payload.action === "remove") {
                        return {
                          ...message,
                          reactions: reactions.filter(
                            (reaction: any) =>
                              reaction.userId !== payload.senderId,
                          ),
                        };
                      }

                      // ----------------------------------------
                      // ADD / CHANGE REACTION
                      // ----------------------------------------

                      const existingReaction = reactions.find(
                        (reaction: any) => reaction.userId === payload.senderId,
                      );

                      if (existingReaction) {
                        return {
                          ...message,
                          reactions: reactions.map((reaction: any) =>
                            reaction.userId === payload.senderId
                              ? {
                                  ...reaction,
                                  emoji: payload.emoji,
                                }
                              : reaction,
                          ),
                        };
                      }

                      return {
                        ...message,
                        reactions: [
                          ...reactions,
                          {
                            userId: payload.senderId,
                            emoji: payload.emoji,
                          },
                        ],
                      };
                    }),
                  })),
                };
              },
            );

            break;
          }

          case SocketEvent.DELETE_MESSAGE: {
            // ----------------------------------------
            // ACTION SUCCESSFULLY PROCESSED
            // ----------------------------------------

            if (payload.clientActionId) {
              void removePendingAction(payload.clientActionId);
            }

            queryClient.setQueryData(
              ["messages", payload.conversationId],
              (oldData: any) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  pages: oldData.pages.map((page: any) => ({
                    ...page,
                    messages: page.messages.map((message: any) =>
                      message.id === payload.messageId
                        ? {
                            ...message,
                            isDeleted: true,
                            deletedAt: payload.deletedAt,
                          }
                        : message,
                    ),
                  })),
                };
              },
            );

            break;
          }

          case SocketEvent.EDIT_MESSAGE: {
            // ----------------------------------------
            // ACTION SUCCESSFULLY PROCESSED
            // ----------------------------------------

            if (payload.clientActionId) {
              void removePendingAction(payload.clientActionId);
            }

            queryClient.setQueryData(
              ["messages", payload.conversationId],
              (oldData: any) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  pages: oldData.pages.map((page: any) => ({
                    ...page,
                    messages: page.messages.map((message: any) =>
                      message.id === payload.messageId
                        ? {
                            ...message,
                            message: payload.message,
                            editedAt: payload.editedAt,
                          }
                        : message,
                    ),
                  })),
                };
              },
            );

            break;
          }

          case SocketEvent.EDIT_MESSAGE: {
            queryClient.setQueryData(
              ["messages", payload.conversationId],
              (oldData: any) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  pages: oldData.pages.map((page: any) => ({
                    ...page,
                    messages: page.messages.map((message: any) =>
                      message.id === payload.messageId
                        ? {
                            ...message,
                            message: payload.message,
                            editedAt: payload.editedAt,
                          }
                        : message,
                    ),
                  })),
                };
              },
            );

            break;
          }

          case SocketEvent.USER_ONLINE:
            useOnlineUsersStore.getState().setOnlineUsers(payload.users);
            break;

          case SocketEvent.READ_RECEIPT:
            queryClient.setQueryData<CachedMessages>(
              ["messages", payload.conversationId],
              (old) => {
                if (!old) return old;

                return {
                  ...old,
                  pages: old.pages.map((page) => ({
                    ...page,
                    messages: page.messages.map((message) =>
                      message.id === payload.messageId
                        ? {
                            ...message,
                            isRead: true,
                            readAt: new Date().toISOString(),
                          }
                        : message,
                    ),
                  })),
                };
              },
            );
            break;

          case SocketEvent.NEW_MESSAGE: {
            if (payload.clientMessageId) {
              void removePendingAction(payload.clientMessageId);
            }

            const newMessage: ChatMessage = {
              id: payload.messageId,
              clientMessageId: payload.clientMessageId ?? null,

              conversationId: payload.conversationId,
              senderId: payload.senderId,

              messageType: payload.messageType,
              message: payload.message,

              attachmentUrl: payload.attachmentUrl ?? null,
              attachmentPublicId: payload.attachmentPublicId ?? null,
              mimeType: payload.mimeType ?? null,
              duration: payload.duration ?? null,

              isRead: payload.isRead ?? false,
              readAt: payload.readAt ?? null,

              createdAt: payload.createdAt ?? new Date().toISOString(),
              updatedAt: payload.updatedAt ?? null,

              isDeleted: false,
              deletedAt: null,
              editedAt: null,

              replyToMessageId: payload.replyToMessageId ?? null,
              replyTo: payload.replyTo ?? null,

              reactions: payload.reactions ?? [],

              status: "sent",
            };

            queryClient.setQueryData<CachedMessages>(
              ["messages", payload.conversationId],
              (old) => {
                console.log("🟡 OLD CACHE", old);

                // No cache yet
                if (!old?.pages?.length) {
                  return {
                    pages: [
                      {
                        messages: [newMessage],
                        nextCursor: null,
                      },
                    ],
                    pageParams: [""],
                  };
                }

                const pages = old.pages.map((page) => ({
                  ...page,
                  messages: [...page.messages],
                }));

                let replacedOptimistic = false;

                // ----------------------------------------
                // FIND AND REPLACE OPTIMISTIC MESSAGE
                // ----------------------------------------

                if (payload.clientMessageId) {
                  for (let i = 0; i < pages.length; i++) {
                    const index = pages[i].messages.findIndex(
                      (message) =>
                        message.id === payload.clientMessageId ||
                        message.clientMessageId === payload.clientMessageId,
                    );

                    if (index !== -1) {
                      pages[i].messages[index] = newMessage;
                      replacedOptimistic = true;
                      break;
                    }
                  }
                }

                // ----------------------------------------
                // NEW MESSAGE FROM OTHER USER
                // ----------------------------------------

                if (!replacedOptimistic) {
                  const firstPage = pages[0];

                  // Prevent duplicates
                  const alreadyExists = pages.some((page) =>
                    page.messages.some(
                      (message) => message.id === newMessage.id,
                    ),
                  );

                  if (!alreadyExists) {
                    pages[0] = {
                      ...firstPage,
                      messages: [...firstPage.messages, newMessage],
                    };
                  }
                }

                return {
                  ...old,
                  pages,
                };
              },
            );

            void queryClient.invalidateQueries({
              queryKey: ["conversations"],
            });

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

      // console.log("========== WS SEND ==========");
      // console.log("payload:", payload);
      // console.log("socket:", socket);
      // console.log("readyState:", socket?.readyState);
      // console.log("OPEN:", WebSocket.OPEN);

      if (!socket) {
        console.error("No connection");
        return false;
      }

      if (socket.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not ready");
        return false;
      }

      console.log("✅ Sending through WebSocket");

      socket.send(JSON.stringify(payload));

      console.log("✅ socket.send() completed");

      // socket.send(JSON.stringify(payload));
      // queryClient.invalidateQueries({
      //   queryKey: ["messages", payload.conversationId],
      // });

      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });

      return true;
    },
  };
});

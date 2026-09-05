import { create } from "zustand";

type WebSocketStore = {
  socket: WebSocket | null;

  onlineUsers: string[];
  presenceKnown: boolean;

  setSocket: (socket: WebSocket) => void;

  setOnlineUsers: (users: string[]) => void;
  clearOnlineUsers: () => void;

  send: (payload: unknown) => void;
};

export const useOnlineUsersStore = create<WebSocketStore>((set, get) => ({
  socket: null,

  onlineUsers: [],
  presenceKnown: false,

  setSocket: (socket) =>
    set({
      socket,
    }),

  setOnlineUsers: (users) =>
    set({
      onlineUsers: users,
      presenceKnown: true,
    }),

  clearOnlineUsers: () =>
    set({
      onlineUsers: [],
      presenceKnown: false,
    }),

  send: (payload) => {
    const socket = get().socket;

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  },
}));

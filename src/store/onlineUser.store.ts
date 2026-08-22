import { create } from "zustand";

type WebSocketStore = {
  socket: WebSocket | null;

  onlineUsers: string[];

  setSocket: (socket: WebSocket) => void;

  setOnlineUsers: (users: string[]) => void;

  send: (payload: unknown) => void;
};

export const useOnlineUsersStore = create<WebSocketStore>((set, get) => ({
  socket: null,

  onlineUsers: [],

  setSocket: (socket) =>
    set({
      socket,
    }),

  setOnlineUsers: (users) =>
    set({
      onlineUsers: users,
    }),

  send: (payload) => {
    const socket = get().socket;

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  },
}));

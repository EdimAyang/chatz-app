import { create } from "zustand";

export type CallType = "audio" | "video";

export type CallStatus =
  | "idle"
  | "calling"
  | "ringing"
  | "connecting"
  | "connected"
  | "ended"
  | "error";

type CallState = {
  callId: string | null;
  conversationId: string | null;
  callType: CallType | null;
  status: CallStatus;
  callerId: string | null;
  recipientId: string | null;
  error: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;

  startOutgoingCall: (args: {
    conversationId: string;
    recipientId: string;
    callType: CallType;
  }) => void;

  receiveIncomingCall: (payload: {
    callId: string;
    conversationId: string;
    callerId: string;
    callType: "VOICE" | "VIDEO";
  }) => void;

  setCallId: (callId: string) => void;
  setStatus: (status: CallStatus) => void;
  setError: (message: string) => void;
  resetCall: () => void;
};

const initialState = {
  callId: null,
  conversationId: null,
  callType: null,
  status: "idle" as CallStatus,
  callerId: null,
  recipientId: null,
  error: null,
  localStream: null,
  remoteStream: null,
};

export const useCallStore = create<CallState>((set) => ({
  ...initialState,

  setLocalStream: (stream) => set({ localStream: stream }),

  setRemoteStream: (stream) => set({ remoteStream: stream }),

  startOutgoingCall: ({ conversationId, recipientId, callType }) =>
    set({
      ...initialState,
      conversationId,
      recipientId,
      callType,
      status: "calling",
    }),

  receiveIncomingCall: (payload) =>
    set({
      callId: payload.callId,
      conversationId: payload.conversationId,
      callerId: payload.callerId,
      callType: payload.callType === "VIDEO" ? "video" : "audio",
      recipientId: null,
      status: "ringing",
      error: null,
    }),

  setCallId: (callId) => set({ callId }),

  setStatus: (status) => set({ status }),

  setError: (message) =>
    set({
      status: "error",
      error: message,
    }),

  resetCall: () => set(initialState),
}));
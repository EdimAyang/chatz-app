export const BASE_URL = `${import.meta.env.VITE_API_URL}/`;

export const ENDPOINTS = {
  //auth
  LOGIN: "auth/login",
  REGISTER: "auth/register",
  FORGOT_PASSWORD: "auth/forgot-password",
  RESET_PASSWORD: "auth/reset-password",

  //profile
  PROFILE: (id: string) => `users/${id}`,
  UPDATE_PROFILE: "users/me",
  UPDATE_PROFILE_AVATAR: "users/me/avatar",

  //conversation
  CONVERSATIONS: "/conversations",
  MESSAGES: (conversationId: string) =>
    `conversations/${conversationId}/messages`,
  CONVERSATIONBETWEENUSERS: (id: string) => `conversations/between/${id}`,
  CREATE_CONVERSATION: (id: string) => `conversations/${id}/create`,

  //message
  GETMESSAGES: (id: string) => `messages/${id}/messages`,
  SENDMESSAGE: "messages/send",

  //users
  GET_USERS: "users",
  GET_USER: (id: string) => `users/${id}`,

  //media
  SEND_AUDIO: "messages/audio",
  SEND_IMAGE: "media/photo",
  SEND_VIDEO: "media/video",
  SEND_DOCUMENT: "media/document",
} as const;

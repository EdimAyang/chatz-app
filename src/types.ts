import type { MessageType } from "./lib/constants";

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isMine: boolean;
  isGroup?: boolean;
  createdAt: string;

  type: "text" | "audio";

  content?: string;
  audioUrl?: string;
  duration?: number;
}

//DTOs
export interface LoginDto {
  email: string;
  password: string;
}
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

//API Response
export interface AuthResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  token: string;
}

export interface ProfileResponse {
  success: boolean;
  isOnline: boolean;
  data: {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    lastSeen: string;
    createdAt: string;
  };
}

export interface ConversationsResponse {
  success: boolean;
  page: number;
  limit: number;
  hasMore: boolean;
  totalPages: number;
  nextCursor: string | null;
  data: {
    id: string;
    isGroup: boolean;
    recipient: {
      id: string;
      username: string;
      avatarUrl: string | null;
      bio: string | null;
      isOnline: boolean;
      lastSeen: string;
    };
    lastMessage: {
      id: string;
      message: string;
      senderId: string;
      createdAt: string;
    };
    unreadCount: number;
    updatedAt: string;
  }[];
}

export interface MessageResponse {
  success: boolean;
  page: number;
  limit: number;
  hasMore: boolean;
  totalPages: number;
  nextCursor: string | null;
  recipient: {
    id: string;
    conversationId: string;
    userId: string;
    createdAt: string;
    lastReadAt: boolean;
    unreadCount: number;
    user: {
      id: string;
      username: string;
      avatarUrl: string;
      bio: string;
      isOnline: boolean;
      lastSeen: string;
    };
  };
  messages: {
    id: string;
    conversationId: string;
    senderId: string;
    message: string;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
    updatedAt: string | null;
    isDeleted: boolean;
    deletedAt: string | null;
    duration: number | null;
    messageType: MessageType;
    attachmentUrl: string | null;
    attachmentPublicId: string | null;
    mimeType: string | null;
  }[];
  sender: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
}

export interface UsersResponse {
  success: boolean;
  page: number;
  limit: number;
  hasMore: boolean;
  totalPages: number;
  nextCursor: string | null;
  data: {
    id: string;
    username: string;
    email: string;
    lastSeen: string;
    createdAt: string;
    isOnline: boolean;
    bio: string | null;
    avatarUrl: string | null;
  }[];
}

export interface UserResponse {
  success: boolean;
  isOnline: boolean;
  data: {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    phoneNumber: string | null;
    lastSeen: string;
    createdAt: string;
    isOnline: boolean;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
}

export interface SendMessageResponse {
  success: boolean;
  message: {
    id: string;
    conversationId: string;
    senderId: string;
    message: string;
    isRead: boolean | null;
    readAt: boolean | null;
    createdAt: string;
    updatedAt: string | null;
    isDeleted: boolean | null;
    deletedAt: boolean | null;
    duration: number | null;
    messageType: MessageType;
    attachmentUrl: string | null;
    attachmentPublicId: string | null;
    mimeType: string | null;
    sender: {
      id: string;
      username: string;
      avatarUrl: string | null;
    };
  };
}

export interface ConversationBetweenUsers {
  success: boolean;
  conversation: {
    id: string;
    conversationKey: string;
    isGroup: boolean;
    createdAt: string;
    updatedAt: string;
    lastMessageAt: string;
    lastMessageId: string;
  };
}

export type MessagePayload = {
  type: string;
  conversationId: string;
  message: string;
  isRead: boolean;
  isTyping: boolean;
  userId: string;
};

export type AudioPayload = {
  audio: Blob;
  conversationId?: string;
  recipientId?: string;
};

export type AudioResponse = {};


export interface Conversation {
  id: string;
  conversationKey: string;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  lastMessageId: string;
}

export interface CreateConversationResponse {
  success: boolean;
  conversation: Conversation;
}

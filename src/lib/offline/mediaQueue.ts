import type { MessageType } from "../constants";

type PendingMediaMessage = {
  clientMessageId: string;
  conversationId: string;
  recipientId?: string;

  messageType: MessageType;

  file: Blob;
  fileName: string;
  mimeType: string;

  message?: string | null;
  duration?: number | null;

  replyToMessageId?: string | null;

  createdAt: string;
};
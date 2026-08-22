import { z } from "zod";
import { SocketEvent } from "@/lib/constants";

// --------------------
// NEW MESSAGE
// --------------------

export const newMessageSchema = z.object({
  type: z.literal(SocketEvent.NEW_MESSAGE),

  conversationId: z.string().optional(),

  recipientId: z.string().optional(),

  messageType: z.string(),

  message: z.string().optional(),
  messageId: z.string().optional(),

  isRead: z.boolean(),
});

// --------------------
// TYPING
// --------------------

export const typingSchema = z.object({
  type: z.literal(SocketEvent.TYPING),

  conversationId: z.string().optional(),

  recipientId: z.string().optional(),

  isTyping: z.boolean(),
});

// --------------------
// STOP TYPING
// --------------------

export const stopTypingSchema = z.object({
  type: z.literal(SocketEvent.STOP_TYPING),

  conversationId: z.string().optional(),

  recipientId: z.string().optional(),

  isTyping: z.literal(false),
});

// --------------------
// READ RECEIPT
// --------------------

export const readReceiptSchema = z.object({
  type: z.literal(SocketEvent.READ_RECEIPT),

  conversationId: z.string(),

  messageId: z.string(),

  userId: z.string(),
});

// --------------------
// UNION
// --------------------

export const clientMessageSchema = z.discriminatedUnion("type", [
  newMessageSchema,
  typingSchema,
  stopTypingSchema,
  readReceiptSchema,
]);

// --------------------
// TYPES
// --------------------

export type NewMessagePayload = z.infer<typeof newMessageSchema>;

export type TypingPayload = z.infer<typeof typingSchema>;

export type StopTypingPayload = z.infer<typeof stopTypingSchema>;

export type ReadReceiptPayload = z.infer<typeof readReceiptSchema>;

export type ClientMessagePayload = z.infer<typeof clientMessageSchema>;

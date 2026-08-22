import z from "zod";


export const messageSchema = z.object({
  type: z.string().min(2, "no messsage type"),
  conversationId: z.string().min(8, "no conversation id"),
  message: z.string().min(5, "can't send empty message"),
  isRead: z.boolean().default(false)
});

export type MessageFormData = z.infer<typeof messageSchema>;
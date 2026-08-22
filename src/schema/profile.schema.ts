import { z } from "zod";

export const ProfileSchema = z.object({
  username: z.string().min(3, "Name must be at least 3 characters"),
  location: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof ProfileSchema>;
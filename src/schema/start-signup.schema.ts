import z from "zod";
 
export const startSignupSchema = z.object({
  email: z.email("Please enter a valid email address"),
  name: z.string().min(3, "Name must be at least 3 characters"),
});

export type StartSignupFormData = z.infer<typeof startSignupSchema>;
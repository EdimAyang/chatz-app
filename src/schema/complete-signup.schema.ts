import z from "zod";

export const completeSignupSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

export type CompleteSignupFormData = z.infer<typeof completeSignupSchema>;

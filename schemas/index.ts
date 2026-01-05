import z from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(1, "name too short").max(50, "name too long"),
    email: z.email(),
    password: z.string().min(8, "password too short"),
    confirmPassword: z.string().min(8, "password too short"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Password don't match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(1, "please set a password")
    .min(8, "password too short"),
});

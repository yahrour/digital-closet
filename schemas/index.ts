import { colorsType, seasonsType } from "@/constants";
import z from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(1, "please set a name").max(50, "name too long"),
    email: z.email(),
    password: z
      .string()
      .min(1, "please set a password")
      .min(8, "password too short"),
    confirmPassword: z
      .string()
      .min(1, "please set a password")
      .min(8, "password too short"),
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

export const accountDetailsSchema = z
  .object({
    name: z.string().min(1, "name too short").max(50, "name too long"),
    email: z.email(),
    currentPassword: z
      .string()
      .min(1, "please set current password")
      .min(8, "password too short")
      .optional(),
    newPassword: z
      .string()
      .min(1, "please set new password")
      .min(8, "password too short")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (Boolean(data.currentPassword) !== Boolean(data.newPassword)) {
      if (!Boolean(data.currentPassword)) {
        ctx.addIssue({
          path: ["currentPassword"],
          message: "Current password is required",
          code: "custom",
        });
      }
      if (!Boolean(data.newPassword)) {
        ctx.addIssue({
          path: ["newPassword"],
          message: "New password is required",
          code: "custom",
        });
      }
    }
  });

export const newGarmentSchema = z.object({
  name: z.string().trim().min(1, "please set a name").max(50, "name too long"),
  seasons: z
    .array(z.enum(seasonsType, "please select a season"))
    .min(1, "please select a season(s)"),
  primaryColor: z.enum(colorsType, "please select a primary color"),
  secondaryColors: z.array(z.enum(colorsType)).optional(),
  brand: z.string().min(1, "please set a brand name"),
  category: z.string().min(1, "please select a category"),
  tags: z.array(z.string()).optional(),
  tagInput: z.string("tag too short").max(25, "tag too long"),
  imageUrl: z.url(),
});

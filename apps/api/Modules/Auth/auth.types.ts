import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { usersTable } from "../../Infra/Database/schema";

export type DBUser = InferSelectModel<typeof usersTable>;
export type DBUserInsert = InferInsertModel<typeof usersTable>;

export type UserResponse = Omit<DBUser, "password" | "isDelete">;

export const registerInputSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(255),
  password: z.string().min(8),
});

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const verifyEmailInputSchema = z.object({
  token: z.string().min(1),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const updateProfileInputSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  email: z.string().email().optional(),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailInputSchema>;
export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

import { z } from "zod";

/**
 * FAOS v5 — Auth Contracts
 *
 * Authoritative shape for all auth API responses.
 * Types are derived from schemas — never declared separately.
 */

export const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const RegisterCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  username: z.string(),
  name: z.string().optional(),
});

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  name: z.string().nullable(),
  role: z.string(),
  avatar: z.string().nullable(),
  onboardingCompleted: z.boolean(),
});

export const LoginResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: AuthUserSchema,
  }),
});

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type RegisterCredentials = z.infer<typeof RegisterCredentialsSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

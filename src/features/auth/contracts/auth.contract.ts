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
  // The API omits this key entirely (via `user.avatar?.fileUrl`) rather than
  // sending `null` when there's no avatar file — .optional() to accept a
  // missing key, not just an explicit null.
  avatar: z.string().nullable().optional(),
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

/**
 * GET /v2/users/me — the raw AuthUser row (minus password), used to
 * rehydrate useAuthStore's `user` on load (see AuthListener.tsx). Its
 * `avatar` shape (a full relation object, or omitted) differs from
 * LoginResponseSchema's (a flattened fileUrl string) and isn't used by the
 * UI yet, so it's left out here rather than reconciled.
 */
export const CurrentUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  name: z.string().nullable(),
  role: z.string(),
});

export const CurrentUserApiEnvelopeSchema = z.object({
  data: CurrentUserSchema,
});

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type RegisterCredentials = z.infer<typeof RegisterCredentialsSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type CurrentUser = z.infer<typeof CurrentUserSchema>;

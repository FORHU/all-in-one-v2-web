import { fetcher } from "@/shared/lib/http";
import { getRefreshToken } from "@/shared/lib/token";
import {
  LoginResponseSchema,
  CurrentUserApiEnvelopeSchema,
  type LoginCredentials,
  type LoginResponse,
  type RegisterCredentials,
  type CurrentUser,
} from "../contracts/auth.contract";

export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  const raw = await fetcher<unknown>("/api/v2/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return LoginResponseSchema.parse(raw);
};

export const register = async (
  credentials: RegisterCredentials,
): Promise<LoginResponse> => {
  const raw = await fetcher<unknown>("/api/v2/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return LoginResponseSchema.parse(raw);
};

/**
 * Signs in (or registers, on first use) with a Google ID token — see the
 * API's AuthService.loginWithGoogle, which verifies the token server-side
 * and returns the same session shape as login()/register() above.
 */
export const loginWithGoogle = async (
  idToken: string,
): Promise<LoginResponse> => {
  const raw = await fetcher<unknown>("/api/v2/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
  return LoginResponseSchema.parse(raw);
};

/** GET /v2/users/me — see CurrentUserSchema's doc comment. */
export const getCurrentUser = async (): Promise<CurrentUser> => {
  const raw = await fetcher<unknown>("/api/v2/users/me");
  return CurrentUserApiEnvelopeSchema.parse(raw).data;
};

export const logout = async () => {
  // Sends the refresh token so the backend deletes that session outright
  // (see auth.service.ts's logout) instead of leaving it valid server-side
  // for up to 7 more days after the user has already signed out locally.
  return fetcher("/api/v2/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken: getRefreshToken() }),
  });
};

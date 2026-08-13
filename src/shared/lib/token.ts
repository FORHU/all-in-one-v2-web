/**
 * FAOS — Auth token storage (single source of truth)
 *
 * Both the HTTP layer (`shared/lib/http.ts`) and the auth store
 * (`features/auth/stores/auth.store.ts`) read/write the token through here,
 * so the two can never drift out of sync.
 *
 * ⚠️ SECURITY NOTE
 * This template persists the JWT in `localStorage` for portability with any
 * backend. `localStorage` is readable by any script on the page, so it is
 * vulnerable to XSS token theft. For production, prefer an httpOnly, Secure,
 * SameSite cookie set by your backend and drop this module. Swapping the four
 * functions below is the only change needed if you keep a client-side store.
 */

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * The refresh token (see auth.service.ts's refreshToken) — used by
 * shared/lib/http.ts's fetcher() to silently renew an expired access token
 * instead of forcing a sign-in every ACCESS_TOKEN_EXPIRY (15m in this repo's
 * .env). Single-use server-side: the value here goes stale the moment it's
 * exchanged, so it's always overwritten with the new one from that response.
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

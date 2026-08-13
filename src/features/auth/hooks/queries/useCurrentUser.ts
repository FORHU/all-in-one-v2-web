import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getCurrentUser } from "@/features/auth/api";

/**
 * Fetches the signed-in user's real profile (GET /v2/users/me) — used by
 * AuthListener.tsx to rehydrate useAuthStore's `user` on load, since only
 * the token is persisted across reloads (see shared/lib/token.ts); `user`
 * itself is only ever set transiently after a fresh login/register.
 *
 * `enabled` must stay caller-driven (token present AND user not already
 * loaded) — same reasoning as useLatestAddress.ts's gating, to avoid firing
 * an authenticated request before there's a token to send.
 */
export function useCurrentUser(enabled: boolean) {
  return useSafeQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    enabled,
  });
}

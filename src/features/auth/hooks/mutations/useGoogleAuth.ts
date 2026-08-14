import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { loginWithGoogle } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/stores/auth.store";

/**
 * Signs in with a Google ID token and applies the returned session — same
 * pattern as useLogin.ts, just backed by POST /v2/auth/google instead of
 * /v2/auth/login. Named useGoogleAuth (not useGoogleLogin) to avoid
 * colliding with @react-oauth/google's own exported useGoogleLogin hook.
 */
export function useGoogleAuth() {
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: loginWithGoogle,
    // Same reasoning as useLogin.ts: a failed Google sign-in is a normal
    // form outcome, not a session expiring.
    meta: { suppressErrorToast: true, suppressAuthRedirect: true },
    onSuccess: (response) => {
      setToken(response.data.accessToken, response.data.refreshToken);
      setUser({
        id: response.data.user.id,
        email: response.data.user.email,
        username: response.data.user.username,
        name: response.data.user.name,
      });
      queryClient.invalidateQueries();
    },
  });
}

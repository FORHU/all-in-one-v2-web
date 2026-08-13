import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { login } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/stores/auth.store";

/** Logs in with email/password and applies the returned session. */
export function useLogin() {
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: login,
    // A failed login is a normal form outcome (wrong credentials), not a
    // session expiring — suppress the global "Session expired" toast and
    // auth:unauthorized redirect so it only shows as an inline form error.
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

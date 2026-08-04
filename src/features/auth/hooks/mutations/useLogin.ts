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
    onSuccess: (response) => {
      setToken(response.data.accessToken);
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

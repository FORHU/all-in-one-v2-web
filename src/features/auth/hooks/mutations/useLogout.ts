import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { logout } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/stores/auth.store";

/**
 * Logs out and clears local session state.
 * Local state is cleared in a `finally` so the user is always signed out
 * locally even if the logout request itself fails.
 */
export function useLogout() {
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: async () => {
      try {
        await logout();
      } finally {
        setToken(null);
        setUser(null);
        queryClient.clear();
      }
    },
  });
}

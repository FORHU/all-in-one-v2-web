import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, logout } from "../api/login.api";
import { useAuthStore } from "../stores/auth.store";

export function useAuth() {
  const setToken = useAuthStore((state) => state.setToken);
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setToken(response.data.accessToken);
      // Invalidate queries that depend on auth
      queryClient.invalidateQueries();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setToken(null);
      queryClient.clear();
    },
    // Even if logout API fails, we want to clear local state
    onError: () => {
      setToken(null);
      queryClient.clear();
    },
  });

  return {
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}

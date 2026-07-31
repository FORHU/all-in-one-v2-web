import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, logout, register, type LoginResponse } from "../api/login.api";
import { useAuthStore } from "../stores/auth.store";

export function useAuth() {
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  const applySession = (response: LoginResponse) => {
    setToken(response.data.accessToken);
    setUser({
      id: response.data.user.id,
      email: response.data.user.email,
      username: response.data.user.username,
      name: response.data.user.name,
    });
    queryClient.invalidateQueries();
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: applySession,
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: applySession,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setToken(null);
      setUser(null);
      queryClient.clear();
    },
    // Even if logout API fails, we want to clear local state
    onError: () => {
      setToken(null);
      setUser(null);
      queryClient.clear();
    },
  });

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}

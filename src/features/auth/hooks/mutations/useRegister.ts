import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { register } from "@/features/auth/api";

/**
 * Registers a new account. Deliberately does NOT apply the returned session
 * (setToken/setUser) — registering shouldn't auto-sign-in; the caller sends
 * the user to sign in with their new credentials instead (see AuthForm).
 */
export function useRegister() {
  return useSafeMutation({
    mutationFn: register,
    // Same reasoning as useLogin — a failed register (e.g. email taken) is a
    // form outcome, not a session expiring.
    meta: { suppressErrorToast: true, suppressAuthRedirect: true },
  });
}

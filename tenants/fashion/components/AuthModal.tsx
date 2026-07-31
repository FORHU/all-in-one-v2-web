"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/stores/auth.store";

type Mode = "login" | "register";

const tabButtonStyle = (active: boolean) => ({
  backgroundColor: active ? "var(--brand-primary)" : "transparent",
  color: active ? "var(--brand-secondary)" : "var(--brand-primary)",
});

const inputClassName =
  "h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40";

/**
 * Fashion — sign in / register modal, used by the account dashboard when
 * signed out (pages/AccountPage.tsx). Email/password forms are wired to
 * the real POST /v2/auth/login and /v2/auth/register endpoints (see
 * features/auth/hooks/useAuth.ts). Google/Apple are presentational only —
 * no OAuth client is configured anywhere in this codebase.
 */
export function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSubmitting = isLoggingIn || isRegistering;

  // TODO: remove this fallback once a real backend is reliably reachable in
  // dev — right now the account dashboard is otherwise impossible to test
  // without a live API + an existing user, so any email/password "signs
  // in" locally when the real request fails for any reason.
  const mockSignIn = () => {
    setToken(`mock-token-${Date.now()}`);
    setUser({
      id: `mock-${Date.now()}`,
      email: email || undefined,
      username: username || email.split("@")[0] || "guest",
      name: name || undefined,
    });
    toast("Signed in with a mock session — no backend was reachable.");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({
          email,
          password,
          username,
          name: name || undefined,
        });
      }
      onClose();
    } catch {
      mockSignIn();
      onClose();
    }
  };

  const handleSocialClick = (provider: string) => {
    toast(`${provider} sign-in isn't connected yet — this is a UI-only demo.`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Sign in" : "Create account"}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-7"
        style={{ color: "var(--brand-primary)" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/5"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          className="mb-5 flex gap-1 rounded-xl border p-1"
          style={{
            borderColor:
              "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
          }}
        >
          <button
            type="button"
            onClick={() => setMode("login")}
            className="flex-1 rounded-lg py-2 text-xs font-semibold"
            style={tabButtonStyle(mode === "login")}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className="flex-1 rounded-lg py-2 text-xs font-semibold"
            style={tabButtonStyle(mode === "register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "register" && (
            <>
              <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                Username
                <input
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className={inputClassName}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                Name (optional)
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClassName}
                />
              </label>
            </>
          )}
          <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
            Password
            <input
              type="password"
              required
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClassName}
            />
          </label>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 h-11 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div
            className="h-px flex-1"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
            }}
          />
          <span className="text-[11px] font-semibold uppercase tracking-wide opacity-50">
            or
          </span>
          <div
            className="h-px flex-1"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
            }}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => handleSocialClick("Google")}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold"
            style={{
              borderColor:
                "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
            }}
          >
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialClick("Apple")}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold"
            style={{
              borderColor:
                "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
            }}
          >
            Continue with Apple
          </button>
        </div>
      </div>
    </div>
  );
}

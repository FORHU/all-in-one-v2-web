"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  GoogleLogin,
  GoogleOAuthProvider,
  type CredentialResponse,
} from "@react-oauth/google";
import { useLogin, useRegister, useGoogleAuth } from "@/features/auth/hooks";
import { ApiError } from "@/shared/errors/api-error";
import { env } from "@/shared/lib/env";
import { useFashionColorMode } from "../stores/colorMode.store";

type Mode = "login" | "register";

const tabButtonStyle = (active: boolean) => ({
  backgroundColor: active ? "var(--brand-primary)" : "transparent",
  color: active ? "var(--brand-secondary)" : "var(--brand-primary)",
});

const inputClassName =
  "h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40";

// Inputs had no explicit background/text color, so the field's native
// background (light) collided with the inherited page text color (also
// light in dark mode — see AccountPage's `color: var(--brand-primary)`),
// making typed text invisible. Pin both explicitly, matching the same
// light-field/dark-text pairing the submit button already uses below.
const inputStyle = {
  backgroundColor: "var(--brand-primary)",
  color: "var(--brand-secondary)",
};

/**
 * Fashion — inline sign in / register form, used by the account dashboard
 * when signed out (pages/AccountPage.tsx). Renders directly in the page
 * (not a modal) — on success useAuthStore's token updates and AccountPage
 * re-renders into the signed-in view on its own.
 * Email/password forms are wired to the real POST /v2/auth/login and
 * /v2/auth/register endpoints (see features/auth/hooks/mutations/useLogin.ts
 * and useRegister.ts). Google is wired to the real POST /v2/auth/google
 * (see useGoogleAuth.ts and the API's AuthService.loginWithGoogle) —
 * Google's Identity Services requires rendering its own branded button for
 * this flow, so it can't be pixel-matched to Apple's still-placeholder
 * button below; `theme` is picked from the site's own light/dark toggle to
 * blend in as closely as Google's rules allow. Apple remains
 * presentational only — no OAuth client configured for it.
 */
export function AuthForm() {
  const { mutateAsync: login, isPending: isLoggingIn } = useLogin();
  const { mutateAsync: register, isPending: isRegistering } = useRegister();
  const { mutateAsync: googleAuth } = useGoogleAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  const isSubmitting = isLoggingIn || isRegistering;

  // Google's button theme follows the site's light/dark toggle — gated
  // behind a mount flag since useFashionColorMode persists to localStorage,
  // unavailable during SSR (same pattern used throughout this tenant).
  const colorMode = useFashionColorMode((s) => s.mode);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  const resolvedColorMode = hasMounted ? colorMode : "dark";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (mode === "login") {
        await login({ email, password });
        toast.success("Signed in successfully.");
      } else {
        if (password !== confirmPassword) {
          toast.error("Passwords don't match.");
          return;
        }
        await register({
          email,
          password,
          username,
          name: name || undefined,
        });
        // Registering doesn't sign the user in — send them to the Sign In
        // tab to log in with the account they just created. Keep the email
        // filled in so they don't have to retype it; clear the passwords
        // since they were for account creation, not this sign-in attempt.
        setPassword("");
        setConfirmPassword("");
        setMode("login");
        toast.success("Account created — sign in to continue.");
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Unable to sign in right now.",
      );
    }
  };

  const handleSocialClick = (provider: string) => {
    toast(`${provider} sign-in isn't connected yet — this is a UI-only demo.`);
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    if (!credentialResponse.credential) {
      toast.error("Google didn't return a token. Please try again.");
      return;
    }
    try {
      await googleAuth(credentialResponse.credential);
      toast.success("Signed in successfully.");
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Unable to sign in with Google right now.",
      );
    }
  };

  const handleGoogleError = () => {
    toast.error("Google sign-in failed. Please try again.");
  };

  return (
    <div className="w-full max-w-sm" style={{ color: "var(--brand-primary)" }}>
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
                style={inputStyle}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
              Name (optional)
              <input
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClassName}
                style={inputStyle}
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
            style={inputStyle}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
          Password
          <input
            type="password"
            required
            // Backend Joi schema requires min 6 chars on register (see
            // AuthController.register) — only enforced client-side there,
            // not on login, since an existing account's password predates
            // this rule and must still be able to sign in.
            minLength={mode === "register" ? 6 : undefined}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
            style={inputStyle}
          />
        </label>
        {mode === "register" && (
          <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
            Confirm Password
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={inputClassName}
              style={inputStyle}
            />
          </label>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 h-11 rounded-xl text-sm font-semibold disabled:opacity-50"
          style={{
            backgroundColor: "var(--brand-primary)",
            color: "var(--brand-secondary)",
          }}
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

      <div className="flex flex-col items-stretch gap-2.5">
        <div className="flex justify-center">
          <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme={resolvedColorMode === "dark" ? "filled_black" : "outline"}
              shape="pill"
              size="large"
              width={336}
              text="continue_with"
            />
          </GoogleOAuthProvider>
        </div>
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
  );
}

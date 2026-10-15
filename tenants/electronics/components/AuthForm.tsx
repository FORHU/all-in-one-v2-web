"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  GoogleLogin,
  GoogleOAuthProvider,
  type CredentialResponse,
} from "@react-oauth/google";
import { useLogin, useRegister, useGoogleAuth } from "@/features/auth/hooks";
import { ApiError } from "@/shared/errors/api-error";
import { env } from "@/shared/lib/env";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";

type Mode = "login" | "register";

const tabButtonStyle = (active: boolean) => ({
  backgroundColor: active ? COLORS.ink : "transparent",
  color: active ? "#ffffff" : COLORS.ink,
});

const inputClassName =
  "h-11 rounded-xl border px-3 text-sm font-normal outline-none";

/**
 * DigitFriend — inline sign in / register form, same real POST
 * /v2/auth/login, /v2/auth/register, /v2/auth/google endpoints as
 * fashion's/beauty's AuthForm (features/auth/hooks), restyled to the
 * light cream/near-black/lime palette. Apple stays presentational only —
 * no OAuth client configured for it, same as the other tenants.
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

  const inputStyle = {
    backgroundColor: "#ffffff",
    borderColor: COLORS.borderStrong,
    color: COLORS.ink,
  };

  return (
    <div className="w-full max-w-sm" style={{ color: COLORS.ink }}>
      <div
        className="mb-5 flex gap-1 rounded-xl border p-1"
        style={{ borderColor: COLORS.borderStrong }}
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
            <label
              className="flex flex-col gap-1.5 text-xs font-semibold"
              style={{ color: COLORS.muted }}
            >
              Username
              <input
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClassName}
                style={inputStyle}
              />
            </label>
            <label
              className="flex flex-col gap-1.5 text-xs font-semibold"
              style={{ color: COLORS.muted }}
            >
              Name (optional)
              <input
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClassName}
                style={inputStyle}
              />
            </label>
          </>
        )}
        <label
          className="flex flex-col gap-1.5 text-xs font-semibold"
          style={{ color: COLORS.muted }}
        >
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName}
            style={inputStyle}
          />
        </label>
        <label
          className="flex flex-col gap-1.5 text-xs font-semibold"
          style={{ color: COLORS.muted }}
        >
          Password
          <input
            type="password"
            required
            minLength={mode === "register" ? 6 : undefined}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
            style={inputStyle}
          />
        </label>
        {mode === "register" && (
          <label
            className="flex flex-col gap-1.5 text-xs font-semibold"
            style={{ color: COLORS.muted }}
          >
            Confirm Password
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClassName}
              style={inputStyle}
            />
          </label>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 h-11 rounded-xl text-sm font-bold disabled:opacity-50"
          style={{ backgroundColor: COLORS.accent, color: COLORS.accentInk }}
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
          style={{ backgroundColor: COLORS.border }}
        />
        <span
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: COLORS.muted }}
        >
          or
        </span>
        <div
          className="h-px flex-1"
          style={{ backgroundColor: COLORS.border }}
        />
      </div>

      <div className="flex flex-col items-stretch gap-2.5">
        <div className="flex justify-center">
          <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
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
          style={{ borderColor: COLORS.borderStrong }}
        >
          Continue with Apple
        </button>
      </div>
    </div>
  );
}

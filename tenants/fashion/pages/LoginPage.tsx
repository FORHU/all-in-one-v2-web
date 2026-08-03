"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ApiError } from "@/shared/errors/api-error";
import { fashionConfig } from "../tenant.config";
import logo from "../assets/addictstyle-logo.png";

/**
 * Fashion — login page.
 * Wired to the real POST /v2/auth/login endpoint via features/auth's
 * useAuth(). No registration form yet — /v2/auth/register exists on the
 * backend but isn't scoped here.
 */
export function FashionLoginPage() {
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      router.push("/account");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to sign in right now.",
      );
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6 py-16"
      style={{
        backgroundColor: "var(--brand-secondary)",
        color: "var(--brand-primary)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Image src={logo} alt={fashionConfig.name} className="h-14 w-auto" />
        </Link>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-current/10 p-8"
          style={{ backgroundColor: "var(--brand-secondary)" }}
        >
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Sign In
          </h1>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold opacity-70">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-xl border border-current/15 px-3.5 text-sm outline-none focus:border-current/40"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-semibold opacity-70"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 rounded-xl border border-current/15 px-3.5 text-sm outline-none focus:border-current/40"
            />
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="mt-2 h-11 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "var(--brand-secondary)",
            }}
          >
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Zap } from "lucide-react";
import { ElectronicsStorefrontLayout } from "../layouts/StorefrontLayout";
import { AuthForm } from "../components/AuthForm";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";

/**
 * DigitFriend — login page, split-screen like fashion's/beauty's
 * LoginPage.tsx (dark promo panel + AuthForm). Canonical sign-in
 * destination: AccountPage.tsx redirects here when signed out, and
 * StorefrontLayout's header Account button links straight here. Already
 * signed-in visitors are bounced to /account.
 */
export function ElectronicsLoginPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (hasMounted && token) router.push("/account");
  }, [hasMounted, token, router]);

  return (
    <ElectronicsStorefrontLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-10">
        <div className="grid grid-cols-1 overflow-hidden rounded-[28px] lg:grid-cols-2">
          <div
            className="hidden flex-col justify-center gap-8 px-12 py-16 text-white lg:flex xl:px-20"
            style={{ backgroundColor: COLORS.ink, colorScheme: "dark" }}
          >
            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest"
                style={{ opacity: 0.6 }}
              >
                DigitFriend
              </div>
              <h1
                className="mt-3 text-5xl font-bold leading-[1.05] tracking-tight xl:text-6xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Tech that just{" "}
                <span style={{ color: COLORS.accent }}>works</span>.
              </h1>
              <p className="mt-4 max-w-sm text-base" style={{ opacity: 0.75 }}>
                Track orders, save your favorite gear, and check out faster next
                time.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {(
                [
                  { icon: Package, label: "Track every order in one place" },
                  { icon: Zap, label: "Faster checkout, every time" },
                ] as const
              ).map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3.5">
                  <div
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ opacity: 0.85 }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-center gap-6 rounded-[28px] px-6 py-16 lg:rounded-l-none"
            style={{
              backgroundColor: "#ffffff",
              border: `1px solid ${COLORS.border}`,
              color: COLORS.ink,
            }}
          >
            <div className="text-center">
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Welcome
              </h2>
              <p
                className="mt-2 max-w-xs text-sm"
                style={{ color: COLORS.muted }}
              >
                Sign in to view your orders, saved addresses, and account
                details.
              </p>
            </div>
            <AuthForm />
          </div>
        </div>
      </div>
    </ElectronicsStorefrontLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Zap } from "lucide-react";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { AuthForm } from "../components/AuthForm";
import { useAuthStore } from "@/features/auth/stores/auth.store";

/**
 * Fashion — login page ("Welcome" split screen: promo panel + AuthForm).
 * This used to be duplicated as an inline branch inside
 * pages/AccountPage.tsx's signed-out state — now it's the single canonical
 * login destination instead of two different-looking sign-in UIs.
 * AccountPage redirects here when signed out, as does
 * pages/ProductDetailPage.tsx's auth gate (viewing a product requires
 * sign-in). Already-signed-in visitors who land here get bounced to
 * /account.
 */
export function FashionLoginPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  // useAuthStore's token comes from localStorage, unavailable during SSR —
  // gating behind a mount flag avoids a hydration mismatch (see
  // pages/AccountPage.tsx for the same pattern).
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (hasMounted && token) router.push("/account");
  }, [hasMounted, token, router]);

  return (
    <FashionStorefrontLayout hideSearch hideFooter>
      <div className="grid min-h-[calc(100vh-150px)] grid-cols-1 lg:grid-cols-2">
        <div
          className="hidden flex-col justify-center gap-8 px-12 py-16 lg:flex xl:px-20"
          style={{
            backgroundColor: "var(--brand-primary)",
            color: "var(--brand-secondary)",
          }}
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-50">
              Your Account
            </div>
            <h1
              className="mt-3 text-5xl font-bold leading-[1.05] tracking-tight xl:text-6xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Made for the way you shop.
            </h1>
            <p className="mt-4 max-w-sm text-base opacity-70">
              Track orders, save your favorite pieces, and check out faster next
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
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--brand-secondary) 10%, transparent)",
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium opacity-80">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex flex-col items-center justify-center gap-6 px-6 py-16"
          style={{ color: "var(--brand-primary)" }}
        >
          <div className="text-center">
            <h2
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Welcome
            </h2>
            <p className="mt-2 max-w-xs text-sm opacity-60">
              Sign in to view your orders, saved addresses, and account details.
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    </FashionStorefrontLayout>
  );
}

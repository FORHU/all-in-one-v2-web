"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Sparkles } from "lucide-react";
import { BeautyStorefrontLayout } from "../layouts/StorefrontLayout";
import { AuthForm } from "../components/AuthForm";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { BEAUTY_MIRROR_COLORS as COLORS } from "../theme";

const glassBlur: React.CSSProperties = {
  backdropFilter: "blur(26px) saturate(170%)",
  WebkitBackdropFilter: "blur(26px) saturate(170%)",
};

/**
 * Beauty — login page, mirrors fashion's split-screen LoginPage.tsx
 * (promo panel + shared-shape AuthForm). Canonical sign-in destination:
 * CheckoutPage.tsx redirects here when signed out, same gate pattern as
 * fashion's ProductDetailPage/CheckoutPage. Already-signed-in visitors
 * who land here get bounced to /account.
 *
 * Re-matched to the rest of the tenant's warm terracotta *glass* theme
 * (see StorefrontLayout/MirrorShelfHero) — this page previously kept its
 * original edge-to-edge solid-ink/solid-cream two-tone layout from before
 * that retheme, which read as a visibly different, older design sitting
 * right under the new glass header. Both panels are now floating,
 * rounded, frosted-glass cards over the layout's blurred-photo backdrop
 * (dark glass on the left, same treatment as the home hero's "Live"
 * badge; light glass on the right, same as a category card), inside the
 * same centered max-w-7xl container every other page uses, instead of a
 * full-bleed grid.
 */
export function BeautyLoginPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (hasMounted && token) router.push("/account");
  }, [hasMounted, token, router]);

  return (
    <BeautyStorefrontLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-10">
        <div className="grid grid-cols-1 overflow-hidden rounded-[28px] lg:grid-cols-2">
          <div
            className="hidden flex-col justify-center gap-8 px-12 py-16 lg:flex xl:px-20"
            style={{
              backgroundColor: COLORS.glassDarkBg,
              border: `1px solid ${COLORS.glassDarkBorder}`,
              borderRight: "none",
              color: COLORS.accentInk,
              ...glassBlur,
            }}
          >
            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest"
                style={{ opacity: 0.6 }}
              >
                Your Mirror Shelf
              </div>
              <h1
                className="mt-3 text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Made for your everyday{" "}
                <span style={{ fontStyle: "italic", color: COLORS.accent }}>
                  routine
                </span>
                .
              </h1>
              <p className="mt-4 max-w-sm text-base" style={{ opacity: 0.75 }}>
                Track orders, save your favorite picks, and check out faster
                next time.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {(
                [
                  { icon: Package, label: "Track every order in one place" },
                  { icon: Sparkles, label: "Faster checkout, every time" },
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
              backgroundColor: COLORS.glassBg,
              border: `1px solid ${COLORS.glassBorder}`,
              boxShadow: "0 1px 0 rgba(255,255,255,.7) inset",
              color: COLORS.ink,
              ...glassBlur,
            }}
          >
            <div className="text-center">
              <h2
                className="text-3xl font-semibold tracking-tight sm:text-4xl"
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
    </BeautyStorefrontLayout>
  );
}

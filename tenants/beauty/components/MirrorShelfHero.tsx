"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useWishlistStore } from "@/features/storefront/stores/wishlist.store";
import { useCategories } from "@/features/storefront/hooks/queries/useCategories";
import type { Category } from "@/features/storefront/contracts/categories.contract";
import { BEAUTY_MIRROR_COLORS as COLORS, beautyPlexMono } from "../theme";
import {
  MirrorShelfCategoryCard,
  MirrorShelfCategoryCardView,
} from "./MirrorShelfCategoryCard";
import {
  SAMPLE_SKINCARE,
  SAMPLE_MAKEUP,
} from "../data/mirrorShelfSampleCategories";

const TABS = ["DAILY", "EVENING", "MY SHELF"] as const;
type Tab = (typeof TABS)[number];

function monoStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    fontFamily: beautyPlexMono.style.fontFamily,
    letterSpacing: "0.16em",
    ...extra,
  };
}

/**
 * Beauty — "Mirror Shelf" landing hero. Adapts Mirror Shelf.dc.html's dark,
 * glossy dashboard-style design into a normal responsive page (no literal
 * fixed-size device-frame bezel) — see the approved plan for the full
 * rationale on what's real vs. decorative here:
 *   - Clock/date: real, live, client-side (gated behind hasMounted to avoid
 *     an SSR/hydration mismatch, same pattern as CheckoutPage.tsx).
 *   - Greeting: real signed-in user (useAuthStore), generic when signed out.
 *   - Top-left "weather" slot: swapped for something actually real instead
 *     of fabricated weather data a viewer could mistake for live — the
 *     signed-in user's real wishlist count ("shelf" saved-items), which
 *     fits the Mirror Shelf branding better anyway.
 *   - DAILY/EVENING/MY SHELF tabs: visual-only toggle — there's no
 *     "routine" concept in this data model, so switching tabs doesn't
 *     change anything else on the page.
 *   - Ambient portrait: no real asset exists, so this is ImagePlaceholder's
 *     own dashed-border fallback with a descriptive label.
 *   - "Ask me anything": a real, typeable input; submitting navigates to
 *     /categories, the closest real destination — there's no product
 *     search feature anywhere in this codebase yet (frontend or usably
 *     from the backend), same as the fashion header's own decorative
 *     search box.
 *   - Category columns: real data via useCategories(tenantSlug) +
 *     MirrorShelfCategoryCard's per-category useProducts(...).total, split
 *     Skincare vs. everything else. Beauty's catalog is currently empty (by
 *     explicit choice, not seeded), so each column falls back to
 *     data/mirrorShelfSampleCategories.ts's static sample content (taken
 *     from the Mirror Shelf.dc.html reference itself) rather than a bare
 *     "no product" line — once beauty has real categories, useCategories()
 *     returns real rows and this fallback stops being used automatically.
 *   - Bottom quick-nav: only items with a real destination are links
 *     (HOME, SHELVES → /categories, BAG → /cart) — CONSULTATION and SAVED
 *     have no backing feature/page yet, so they're label-only, not fake
 *     links to nowhere.
 */
export function MirrorShelfHero({ tenantSlug }: { tenantSlug: string }) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  const user = useAuthStore((s) => s.user);
  const wishlistCount = useWishlistStore((s) => s.ids.length);

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const [activeTab, setActiveTab] = useState<Tab>("DAILY");
  const [askInput, setAskInput] = useState("");
  const router = useRouter();

  const { data: categories, isLoading: isLoadingCategories } =
    useCategories(tenantSlug);

  const isSkincare = (c: Category) =>
    c.slug.includes("skincare") || c.name.toLowerCase().includes("skincare");
  const skincareCategories = (categories?.items ?? []).filter(isSkincare);
  const otherCategories = (categories?.items ?? []).filter(
    (c) => !isSkincare(c),
  );

  const submitAsk = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/categories");
  };

  const timeLabel = hasMounted && now ? formatTime(now) : "--:--";
  const dateLabel = hasMounted && now ? formatDate(now) : "";
  const greeting =
    hasMounted && user ? `Hello, ${user.name || user.username}` : "Welcome";

  return (
    <section
      className="px-4 pb-10 pt-6 sm:px-8"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, #1b1d21 0%, #14161a 55%, #0e0f11 100%)",
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {/* Top strip — shelf status / clock / greeting */}
        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-3 sm:items-baseline">
          <div className="flex items-baseline gap-3">
            <span
              className="text-2xl font-light"
              style={{ color: COLORS.inkSoft }}
            >
              ✦
            </span>
            <div
              className="text-[11px] leading-relaxed"
              style={monoStyle({ color: COLORS.mutedSoft })}
            >
              <div>MIRROR SHELF</div>
              <div>{hasMounted ? `${wishlistCount} SAVED` : "— SAVED"}</div>
            </div>
          </div>

          <div className="text-center">
            <div
              className="mx-auto mb-2 h-[7px] w-[7px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #ffffff, #7d858d)",
              }}
            />
            <div
              className="text-4xl font-light sm:text-5xl"
              style={{ color: COLORS.inkSoft, lineHeight: 1 }}
            >
              {timeLabel}
            </div>
            <div
              className="mt-2 text-[11px]"
              style={monoStyle({
                color: COLORS.mutedSoft,
                letterSpacing: "0.2em",
              })}
            >
              {dateLabel}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div
              className="text-[17px] font-light"
              style={{ color: COLORS.inkSoft }}
            >
              {greeting}
            </div>
            <div
              className="mt-2 flex gap-4 text-[11px] sm:justify-end"
              style={monoStyle({ color: COLORS.mutedSoft })}
            >
              <span>SAVED</span>
              <Link
                href="/account"
                className="hover:opacity-100"
                style={{ opacity: 0.9 }}
              >
                ACCOUNT
              </Link>
              <Link
                href="/cart"
                className="hover:opacity-100"
                style={{ opacity: 0.9 }}
              >
                BAG
              </Link>
            </div>
          </div>
        </div>

        {/* Main 3-column area */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-8">
          {/* Skincare column */}
          <div className="flex flex-col gap-3">
            <div
              className="text-[11px]"
              style={monoStyle({ color: COLORS.muted, letterSpacing: "0.2em" })}
            >
              SKINCARE
            </div>
            {isLoadingCategories ? (
              <p className="text-sm" style={{ color: COLORS.muted }}>
                Loading…
              </p>
            ) : skincareCategories.length > 0 ? (
              skincareCategories.map((c) => (
                <MirrorShelfCategoryCard
                  key={c.id}
                  tenantSlug={tenantSlug}
                  category={c}
                />
              ))
            ) : (
              SAMPLE_SKINCARE.map((sample) => (
                <MirrorShelfCategoryCardView
                  key={sample.name}
                  name={sample.name}
                  count={sample.count}
                  seed={sample.name}
                />
              ))
            )}
          </div>

          {/* Mirror Mode center panel */}
          <div className="flex flex-col items-center gap-5 py-2">
            <div
              className="text-3xl sm:text-4xl"
              style={{
                fontFamily: "var(--font-heading)",
                letterSpacing: "0.08em",
                color: COLORS.inkSoft,
              }}
            >
              Mirror Mode
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {TABS.map((tab) => {
                const active = tab === activeTab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className="rounded-full px-5 py-2 text-[11px] transition-colors"
                    style={
                      active
                        ? monoStyle({
                            background:
                              "linear-gradient(180deg, #f7f9fb 0%, #cdd5db 55%, #eef2f5 100%)",
                            color: COLORS.accentInk,
                            border: "1px solid rgba(255,255,255,.5)",
                            boxShadow: "0 6px 18px rgba(0,0,0,.35)",
                          })
                        : monoStyle({
                            background: "rgba(255,255,255,.04)",
                            color: COLORS.mutedSoft,
                            border: `1px solid ${COLORS.panelBorder}`,
                          })
                    }
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <ImagePlaceholder
              label="Ambient portrait — model applying makeup"
              imageUrl={null}
              aspect="3/4"
              className="w-full max-w-xs text-current"
              objectFit="cover"
            />

            <form onSubmit={submitAsk} className="w-full max-w-sm">
              <label className="sr-only" htmlFor="mirror-ask">
                Ask me anything
              </label>
              <div
                className="flex items-center gap-3 rounded-full px-4 py-2.5"
                style={{
                  border: `1px solid ${COLORS.panelBorder}`,
                  background:
                    "linear-gradient(150deg, rgba(255,255,255,.1), rgba(255,255,255,.03))",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,.2), 0 10px 26px rgba(0,0,0,.35)",
                }}
              >
                <div
                  className="h-4 w-[9px] flex-none rounded-full"
                  style={{
                    background: "linear-gradient(180deg, #ffffff, #a6aeb5)",
                  }}
                />
                <input
                  id="mirror-ask"
                  type="text"
                  value={askInput}
                  onChange={(e) => setAskInput(e.target.value)}
                  placeholder="Ask me anything"
                  className="w-full bg-transparent text-sm font-light outline-none"
                  style={{ color: COLORS.inkSoft }}
                />
              </div>
            </form>
          </div>

          {/* Makeup & Others column */}
          <div className="flex flex-col gap-3">
            <div
              className="text-right text-[11px]"
              style={monoStyle({ color: COLORS.muted, letterSpacing: "0.2em" })}
            >
              MAKEUP &amp; OTHERS
            </div>
            {isLoadingCategories ? (
              <p className="text-right text-sm" style={{ color: COLORS.muted }}>
                Loading…
              </p>
            ) : otherCategories.length > 0 ? (
              otherCategories.map((c) => (
                <MirrorShelfCategoryCard
                  key={c.id}
                  tenantSlug={tenantSlug}
                  category={c}
                />
              ))
            ) : (
              SAMPLE_MAKEUP.map((sample) => (
                <MirrorShelfCategoryCardView
                  key={sample.name}
                  name={sample.name}
                  count={sample.count}
                  seed={sample.name}
                />
              ))
            )}
          </div>
        </div>

        {/* Bottom quick-nav */}
        <div
          className="flex flex-wrap justify-center gap-8 border-t pt-5 text-[11px] sm:gap-11"
          style={{
            borderColor: COLORS.hairline,
            ...monoStyle({ color: COLORS.mutedSoft }),
          }}
        >
          <Link href="/" style={{ color: COLORS.inkSoft }}>
            HOME
          </Link>
          <Link href="/categories">SHELVES</Link>
          <span style={{ opacity: 0.5 }}>CONSULTATION</span>
          <span style={{ opacity: 0.5 }}>SAVED</span>
          <Link href="/cart">BAG</Link>
        </div>
      </div>
    </section>
  );
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(d: Date): string {
  return d
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();
}

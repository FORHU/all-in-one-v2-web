"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useWishlistStore } from "@/features/storefront/stores/wishlist.store";
import { useCategories } from "@/features/storefront/hooks/queries/useCategories";
import type { Category } from "@/features/storefront/contracts/categories.contract";
import { BEAUTY_MIRROR_COLORS as COLORS } from "../theme";
import {
  MirrorShelfCategoryCard,
  MirrorShelfCategoryCardView,
  type MirrorShelfPreviewProduct,
} from "./MirrorShelfCategoryCard";
import {
  SAMPLE_SKINCARE,
  SAMPLE_MAKEUP,
} from "../data/mirrorShelfSampleCategories";

// "Ask me anything" suggestion chips — each links straight to a real,
// currently-seeded category slug (see categories.seeder.ts) rather than
// being decorative/unlinked text, so a tap actually lands somewhere useful
// instead of just being a visual prompt. Concern -> category is a
// reasonable, not algorithmic, mapping (there's no real skin-concern
// taxonomy in this data model to query against).
const ASK_SUGGESTIONS: { label: string; categorySlug: string }[] = [
  { label: "Dry skin?", categorySlug: "skincare-moisturizers" },
  { label: "Oily skin?", categorySlug: "skincare-cleansers" },
  { label: "Acne-prone?", categorySlug: "skincare-serums" },
  { label: "Dull skin?", categorySlug: "skincare-masks" },
  { label: "Fine lines?", categorySlug: "skincare" },
  { label: "Hair damage?", categorySlug: "haircare" },
];

// No explicit fontFamily here — the Manrope `.variable` class lives on
// BeautyStorefrontLayout's root div (fontFamily: "var(--font-body)"),
// which every descendant already inherits normally. Re-reading
// beautyManrope.style.fontFamily directly in JS here previously caused a
// real, reproducible SSR/client hydration mismatch in dev mode (Next's
// font-loader object can resolve to a different literal value on the
// server vs. the client on a cold compile) — plain CSS inheritance has no
// such race.
function labelStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    ...extra,
  };
}

// Frosted-glass backdrop blur, matching Main.dc.html's `.glass` class —
// paired with a translucent `COLORS.glassBg` background wherever this
// hero renders a card/pill over the layout's blurred-photo backdrop.
const glassBlur: React.CSSProperties = {
  backdropFilter: "blur(26px) saturate(170%)",
  WebkitBackdropFilter: "blur(26px) saturate(170%)",
};

/**
 * Beauty — "Mirror Shelf" landing hero. Re-matched to Main.dc.html's warm
 * terracotta *glass* revision (Instrument Serif/Manrope, blurred photo
 * backdrop + frosted translucent cards — supersedes the earlier flat
 * cream/white-card pass). No opaque section background here on purpose —
 * BeautyStorefrontLayout now renders the blurred-photo backdrop behind
 * every page, and this hero's own cards are deliberately translucent
 * (`COLORS.glassBg` + backdrop-blur) so that backdrop shows through them,
 * matching the reference's `.glass`/`.glass-strong` treatment. What's real
 * vs. decorative hasn't changed from the previous visual pass, only the
 * skin:
 *   - Clock/date: real, live, client-side (gated behind hasMounted to avoid
 *     an SSR/hydration mismatch, same pattern as CheckoutPage.tsx).
 *   - Greeting: real signed-in user (useAuthStore), generic when signed out.
 *   - "Mirror Shelf / N Saved" eyebrow: the signed-in user's real wishlist
 *     count, not fabricated — fits the branding better than invented
 *     "weather" data a viewer could mistake for live.
 *   - Center panel image: clicking a *specific* product thumbnail inside a
 *     Skincare/Makeup & Others card (each thumbnail is its own button —
 *     see MirrorShelfCategoryCardView) mirrors that exact product into
 *     this panel — real thumbnail, title and price — instead of always
 *     showing the category's first item regardless of which thumbnail was
 *     clicked. The preview itself is the thing that links through to the
 *     real PDP; it stays showing until another thumbnail is clicked (no
 *     auto-revert — a click is a deliberate choice, unlike an earlier
 *     hover-based version, which also only ever showed one representative
 *     product per category rather than the one actually picked). This
 *     whole mechanism replaced an earlier Daily/Evening/My Shelf tab
 *     toggle that didn't change anything real when clicked.
 *   - Ambient portrait (the panel's resting state, nothing picked yet): a
 *     curated editorial stock photo (same ImagePlaceholder-via-Unsplash
 *     treatment as the category cards' product thumbnails) — not tied to
 *     any product/order data, so this is the one spot on the page where
 *     "real" just means "an honest, non-fabricated mood photo," not
 *     "backend-sourced."
 *   - "Ask me anything": a real, typeable input; submitting navigates to
 *     /categories, the closest real destination — there's no product
 *     search feature anywhere in this codebase yet (frontend or usably
 *     from the backend), same as the fashion header's own decorative
 *     search box. The suggestion chips below it (ASK_SUGGESTIONS) are real
 *     links straight to a specific, currently-seeded category each,
 *     rather than decorative prompt text — a more useful shortcut than
 *     the free-text input can offer today.
 *   - Category columns: real data via useCategories(tenantSlug) +
 *     MirrorShelfCategoryCard's per-category useProducts(...).total, split
 *     Skincare vs. everything else. Beauty's catalog is now seeded (10
 *     categories, 50 products — see imported-products.seeder.ts), so these
 *     columns render real categories in practice; data/
 *     mirrorShelfSampleCategories.ts's static sample content only remains
 *     as a fallback for if/when useCategories() ever returns zero rows.
 *   - No bottom quick-nav row — removed along with HomePage.tsx's
 *     `hideFooter` (see BeautyStorefrontLayout) so the home route ends
 *     right after this 3-column area, matching Main.dc.html's own
 *     single-screen "Mirror Mode" dashboard, which has no footer/nav row
 *     of its own either. Home/Shelves/Bag/Account are still reachable via
 *     the real header (logo, nav, Account icon, Bag button).
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

  const [askInput, setAskInput] = useState("");
  const [previewProduct, setPreviewProduct] =
    useState<MirrorShelfPreviewProduct | null>(null);
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
    <section className="px-4 pb-16 pt-6 sm:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {/* Status row — shelf status / clock / ritual, matching the
            reference's spark-icon eyebrow + glass "N saved" pill + centered
            giant clock + right-side glass pill, instead of the earlier
            flat-text layout. */}
        <div className="flex flex-wrap items-end justify-between gap-4 px-1.5">
          <div className="flex flex-col gap-1.5">
            <span
              className="flex items-center gap-2 text-xs"
              style={labelStyle({ color: COLORS.ink })}
            >
              <svg
                className="h-3.5 w-3.5 flex-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.accent}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
              </svg>
              Mirror Shelf
            </span>
            <span
              className="self-start rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor: COLORS.glassBg,
                border: `1px solid ${COLORS.glassBorder}`,
                color: COLORS.ink,
                ...glassBlur,
              }}
            >
              {hasMounted ? `${wishlistCount} saved` : "— saved"}
            </span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <span
              className="text-6xl font-extralight leading-none tracking-tight tabular-nums sm:text-7xl"
              style={{ color: COLORS.ink }}
            >
              {timeLabel}
            </span>
            <span
              className="text-xs"
              style={labelStyle({
                color: COLORS.muted,
                letterSpacing: "0.22em",
              })}
            >
              {dateLabel}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span
              className="text-xs"
              style={labelStyle({ color: COLORS.muted })}
            >
              {greeting}
            </span>
            <div
              className="flex gap-1 rounded-full px-1 py-1 text-[11px]"
              style={{
                backgroundColor: COLORS.glassBg,
                border: `1px solid ${COLORS.glassBorder}`,
                ...glassBlur,
              }}
            >
              <Link
                href="/account"
                className="rounded-full px-3 py-1.5 font-semibold transition-colors hover:text-current"
                style={{ color: COLORS.ink }}
              >
                Account
              </Link>
              <Link
                href="/cart"
                className="rounded-full px-3 py-1.5 font-semibold transition-colors hover:text-current"
                style={{ color: COLORS.ink }}
              >
                Bag
              </Link>
            </div>
          </div>
        </div>

        {/* Main 3-column area. Center track is minmax(0,1fr) — it fills
            whatever width is left of the max-w-7xl container after the two
            fixed 340px side columns, so the grid itself uses the full page
            width with no dead margin on either side. 340px (vs. an earlier
            280px) brings the card columns closer in width to the center
            panel's own max-w-sm (384px) cap, so the three columns read as
            comparable blocks instead of two narrow strips flanking a much
            wider center. */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)_340px] lg:gap-9">
          {/* Skincare column — label pinned at top (matches the mockup),
              but the card stack itself centers vertically in whatever
              space is left: real category counts are asymmetric per side
              (unlike the old fixed 5-sample-items-per-side mock data), so
              a short side flush-top would otherwise leave dead space below
              its last card instead of balancing against the taller side. */}
          <div className="flex h-full flex-col gap-4">
            <p className="text-xs" style={labelStyle({ color: COLORS.muted })}>
              Skincare
            </p>
            <div className="flex flex-1 flex-col justify-center gap-4">
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
                    onPreview={setPreviewProduct}
                  />
                ))
              ) : (
                SAMPLE_SKINCARE.map((sample) => (
                  <MirrorShelfCategoryCardView
                    key={sample.name}
                    name={sample.name}
                    count={sample.count}
                    href={`/products/${sample.productSlug}`}
                  />
                ))
              )}
            </div>
          </div>

          {/* Mirror Mode center panel — anchored to the top (not
              justify-center) so it lines up with the side columns' own
              labels instead of floating mid-row. With real, often
              multi-row category data the side columns can run much taller
              than this panel's fixed content; centering just splits that
              leftover height into two visible gaps (above AND below)
              instead of removing it — top-aligning keeps the one
              unavoidable gap below the panel, where it reads as normal
              column-height variance rather than broken layout. */}
          <div className="flex flex-col items-center gap-[18px] py-2">
            <h1
              className="mb-1 text-center text-5xl leading-none tracking-tight sm:text-[56px]"
              style={{ color: COLORS.ink, fontFamily: "var(--font-heading)" }}
            >
              Mirror{" "}
              <span style={{ fontStyle: "italic", color: COLORS.accent }}>
                Mode
              </span>
            </h1>

            {/* Default: the curated ambient portrait. Clicking a Skincare or
                Makeup & Others card (see MirrorShelfCategoryCard's
                onPreview) swaps this for that card's real representative
                product — real thumbnail, title, price, clickable through to
                its own PDP. Same glass-framed rounded-[34px]/[26px] box
                either way (the reference's own padded `.glass` photo
                frame), so switching the preview never shifts the
                surrounding layout. */}
            <div
              className="w-full max-w-[440px] rounded-[34px] p-2.5"
              style={{
                backgroundColor: COLORS.glassBg,
                border: `1px solid ${COLORS.glassBorder}`,
                boxShadow:
                  "0 1px 0 rgba(255,255,255,.7) inset, 0 18px 40px -18px rgba(70,35,20,.28)",
                ...glassBlur,
              }}
            >
              <div className="relative aspect-[290/391] overflow-hidden rounded-[26px]">
                {previewProduct ? (
                  <Link
                    href={`/products/${previewProduct.slug}`}
                    className="group relative block h-full w-full"
                  >
                    <ImagePlaceholder
                      imageUrl={previewProduct.thumbnailUrl}
                      label={previewProduct.title}
                      aspect="3/4"
                      className="h-full w-full text-current"
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 px-5 py-4"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,.65), transparent)",
                      }}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                        In the Mirror
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-white">
                        {previewProduct.title}
                      </div>
                      {previewProduct.price != null && (
                        <div className="text-xs text-white/80">
                          ${previewProduct.price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </Link>
                ) : (
                  <>
                    <ImagePlaceholder
                      imageUrl="https://images.unsplash.com/photo-1709477542170-f11ee7d471a0?w=800&q=80"
                      label="Ambient portrait — model applying makeup"
                      aspect="3/4"
                      className="h-full w-full text-current"
                    />
                    <span
                      className="absolute left-3.5 top-3.5 flex items-center gap-2 rounded-full px-3 py-[7px] text-xs font-semibold text-white"
                      style={{
                        backgroundColor: COLORS.glassDarkBg,
                        border: `1px solid ${COLORS.glassDarkBorder}`,
                        ...glassBlur,
                      }}
                    >
                      <span
                        className="h-[7px] w-[7px] rounded-full"
                        style={{
                          backgroundColor: "#ffb68a",
                          boxShadow: "0 0 0 3px rgba(255,182,138,.35)",
                        }}
                        aria-hidden="true"
                      />
                      Live
                    </span>
                  </>
                )}
              </div>
            </div>

            <form onSubmit={submitAsk} className="w-full max-w-[440px]">
              <label className="sr-only" htmlFor="mirror-ask">
                Ask me anything
              </label>
              <div
                className="flex items-center gap-2.5 rounded-full py-1.5 pl-[18px] pr-1.5 transition-colors focus-within:border-current"
                style={{
                  backgroundColor: COLORS.glassBg,
                  border: `1px solid ${COLORS.glassBorder}`,
                  color: COLORS.ink,
                  ...glassBlur,
                }}
              >
                <svg
                  className="h-[18px] w-[18px] flex-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={COLORS.accent}
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
                </svg>
                <input
                  id="mirror-ask"
                  type="text"
                  value={askInput}
                  onChange={(e) => setAskInput(e.target.value)}
                  placeholder="Ask me anything about your skin or hair"
                  className="h-11 w-full min-w-0 flex-1 bg-transparent text-sm outline-none"
                  style={{ color: COLORS.ink }}
                />
                <button
                  type="submit"
                  aria-label="Send"
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-full"
                  style={{
                    backgroundColor: COLORS.ink,
                    color: COLORS.accentInk,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </form>

            <div className="flex w-full max-w-[460px] flex-wrap justify-center gap-2">
              {ASK_SUGGESTIONS.map((s) => (
                <Link
                  key={s.label}
                  href={`/categories/${s.categorySlug}`}
                  className="rounded-full px-[18px] py-2.5 text-[13px] font-semibold transition-colors hover:text-current"
                  style={{
                    border: `1px solid ${COLORS.glassBorder}`,
                    color: COLORS.ink,
                    backgroundColor: COLORS.glassBg,
                    ...glassBlur,
                  }}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Makeup & Others column */}
          <div className="flex h-full flex-col gap-4">
            <p
              className="text-right text-xs"
              style={labelStyle({ color: COLORS.muted })}
            >
              Makeup &amp; Others
            </p>
            <div className="flex flex-1 flex-col justify-center gap-4">
              {isLoadingCategories ? (
                <p
                  className="text-right text-sm"
                  style={{ color: COLORS.muted }}
                >
                  Loading…
                </p>
              ) : otherCategories.length > 0 ? (
                otherCategories.map((c) => (
                  <MirrorShelfCategoryCard
                    key={c.id}
                    tenantSlug={tenantSlug}
                    category={c}
                    onPreview={setPreviewProduct}
                  />
                ))
              ) : (
                SAMPLE_MAKEUP.map((sample) => (
                  <MirrorShelfCategoryCardView
                    key={sample.name}
                    name={sample.name}
                    count={sample.count}
                    href={`/products/${sample.productSlug}`}
                  />
                ))
              )}
            </div>
          </div>
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

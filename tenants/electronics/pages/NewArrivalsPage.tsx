"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useCategories } from "@/features/storefront/hooks/queries/useCategories";
import { useProducts } from "@/features/storefront/hooks/queries/useProducts";
import type { Product } from "@/features/storefront/contracts/products.contract";
import { ElectronicsStorefrontLayout } from "../layouts/StorefrontLayout";
import { GridCard, ProductMedia, productHref } from "../components/ShopSection";
import { TrustBadges } from "../components/TrustBadges";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";

const NEW_ARRIVALS_LIMIT = 24;
const DAY_MS = 24 * 60 * 60 * 1000;

/** "Today", "3d ago", "2w ago" — from the product's real createdAt. */
function addedAgo(createdAt: Date): string {
  const days = Math.floor((Date.now() - createdAt.getTime()) / DAY_MS);
  if (days <= 0) return "Today";
  if (days < 14) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

/**
 * DigitFriend — /new-arrivals, the header's "New arrivals" link. The
 * newest NEW_ARRIVALS_LIMIT products (useProducts sort: "newest", the same
 * ordering the API applies by createdAt), opened by a dark hero showing the
 * three most recent as a mosaic, then a category chip filter (client-side
 * over that same list) and the shared GridCard with a "New · 3d ago" badge.
 */
export function ElectronicsNewArrivalsPage({
  tenantSlug,
}: {
  tenantSlug: string;
}) {
  const [category, setCategory] = useState("all");

  const { data: categoriesData } = useCategories(tenantSlug);
  const { data: productsData, isLoading } = useProducts(tenantSlug, {
    limit: NEW_ARRIVALS_LIMIT,
    sort: "newest",
  });

  const products = useMemo(() => productsData?.items ?? [], [productsData]);
  const idToSlug = useMemo(() => {
    const map: Record<string, string> = {};
    (categoriesData?.items ?? []).forEach((c) => (map[c.id] = c.slug));
    return map;
  }, [categoriesData]);
  const slugOf = (p: Product) => (p.categoryId ? idToSlug[p.categoryId] : "");

  // Only offer chips for categories that actually have a new arrival.
  const chipCategories = useMemo(
    () =>
      (categoriesData?.items ?? []).filter((c) =>
        products.some((p) => p.categoryId && idToSlug[p.categoryId] === c.slug),
      ),
    [categoriesData, products, idToSlug],
  );

  const shown =
    category === "all"
      ? products
      : products.filter((p) => slugOf(p) === category);
  const spotlight = products.slice(0, 3);
  const addedThisWeek = products.filter(
    (p) => Date.now() - p.createdAt.getTime() < 7 * DAY_MS,
  ).length;

  return (
    <ElectronicsStorefrontLayout>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-6 pt-7">
        <nav
          aria-label="Breadcrumb"
          className="flex gap-2 text-[13px]"
          style={{ color: COLORS.muted }}
        >
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span style={{ color: COLORS.ink }}>New arrivals</span>
        </nav>

        {/* Hero */}
        <section
          className="grid items-center gap-8 overflow-hidden rounded-[28px] p-7 sm:p-10 lg:grid-cols-[1.1fr_1fr]"
          style={{ backgroundColor: COLORS.ink, colorScheme: "dark" }}
        >
          <div className="flex flex-col gap-5 text-white">
            <span
              className="flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wide"
              style={{
                backgroundColor: COLORS.accent,
                color: COLORS.accentInk,
                fontFamily: "var(--font-mono)",
              }}
            >
              <Sparkles size={14} strokeWidth={2.4} />
              Just landed
            </span>
            <h1
              className="m-0 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              New arrivals
            </h1>
            <p
              className="m-0 max-w-md text-base leading-relaxed"
              style={{ color: COLORS.headerMuted }}
            >
              The latest gear to hit the shelves — fresh drops across audio,
              wearables, peripherals and smart home.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#latest"
                className="flex h-12 items-center gap-2 rounded-xl px-6 text-[15px] font-bold"
                style={{
                  backgroundColor: COLORS.accent,
                  color: COLORS.accentInk,
                }}
              >
                Shop the drop
                <ArrowRight size={18} strokeWidth={2.6} />
              </a>
              {!isLoading && addedThisWeek > 0 && (
                <span
                  className="text-sm"
                  style={{
                    color: COLORS.headerMuted,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {addedThisWeek} added this week
                </span>
              )}
            </div>
          </div>

          {/* Mosaic of the three newest */}
          <div className="grid h-[300px] grid-cols-2 grid-rows-2 gap-3 sm:h-[340px]">
            {isLoading || spotlight.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`animate-pulse rounded-[18px] ${i === 0 ? "row-span-2" : ""}`}
                    style={{ backgroundColor: COLORS.headerPanelBg }}
                  />
                ))
              : spotlight.map((p, i) => (
                  <Link
                    key={p.id}
                    href={productHref(p)}
                    className={`group relative overflow-hidden rounded-[18px] ${i === 0 ? "row-span-2" : ""}`}
                  >
                    <ProductMedia
                      product={p}
                      categorySlug={slugOf(p)}
                      iconSize={i === 0 ? 96 : 56}
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <span
                      className="absolute inset-x-2 bottom-2 truncate rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                      style={{
                        backgroundColor: "rgba(15,17,21,0.82)",
                        color: "#ffffff",
                      }}
                    >
                      {p.title}
                    </span>
                  </Link>
                ))}
          </div>
        </section>

        {/* Latest grid */}
        <section
          id="latest"
          aria-label="Latest products"
          className="flex scroll-mt-6 flex-col gap-4"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <h2
                className="m-0 text-3xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Latest drops
              </h2>
              <span
                className="text-[13px]"
                style={{ color: COLORS.muted, fontFamily: "var(--font-mono)" }}
              >
                {isLoading ? "…" : `${shown.length} items`}
              </span>
            </div>
            <Link
              href="/shop"
              className="flex items-center gap-1.5 text-sm font-semibold underline"
            >
              Browse everything
              <ArrowRight size={16} />
            </Link>
          </div>

          {chipCategories.length > 1 && (
            <div className="flex flex-wrap gap-2" role="group">
              {[{ slug: "all", name: "All" }, ...chipCategories].map((c) => {
                const on = c.slug === category;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setCategory(c.slug)}
                    className="h-10 rounded-full px-4 text-sm font-medium transition-colors"
                    style={{
                      border: `1px solid ${on ? COLORS.ink : COLORS.borderStrong}`,
                      backgroundColor: on ? COLORS.ink : COLORS.cardBg,
                      color: on ? "#ffffff" : COLORS.ink,
                    }}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] animate-pulse rounded-[22px]"
                  style={{ backgroundColor: COLORS.border }}
                />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 rounded-[22px] px-6 py-14 text-center"
              style={{
                backgroundColor: COLORS.cardBg,
                border: `1px dashed ${COLORS.borderStrong}`,
              }}
            >
              <span
                className="text-[22px] font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                No new arrivals yet
              </span>
              <span className="text-[15px]" style={{ color: COLORS.muted }}>
                Check back soon — new gear lands every week.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {shown.map((p) => (
                <GridCard
                  key={p.id}
                  product={p}
                  categorySlug={slugOf(p)}
                  badge={`New · ${addedAgo(p.createdAt)}`}
                />
              ))}
            </div>
          )}
        </section>
      </div>
      <TrustBadges />
    </ElectronicsStorefrontLayout>
  );
}

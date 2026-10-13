"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useProducts } from "@/features/storefront/hooks/queries/useProducts";
import { BeautyStorefrontLayout } from "../layouts/StorefrontLayout";
import { beautyCategories } from "../data/categories";
import { beautyMockProducts } from "../data/products";
import { BEAUTY_MIRROR_COLORS as COLORS } from "../theme";

// Frosted-glass card, matching the rest of the re-themed tenant
// (MirrorShelfCategoryCard, the header, etc.) instead of an opaque white
// surface — lets the layout's blurred-photo backdrop show through.
const cardStyle: React.CSSProperties = {
  backgroundColor: COLORS.glassBg,
  border: `1px solid ${COLORS.glassBorder}`,
  boxShadow: "0 1px 0 rgba(255,255,255,.7) inset",
  backdropFilter: "blur(26px) saturate(170%)",
  WebkitBackdropFilter: "blur(26px) saturate(170%)",
};

/**
 * Beauty — one category's product listing ("Mirror Shelf" aesthetic).
 * Tries real data first (useProducts(tenantSlug, { categorySlug })) —
 * beauty's catalog is currently empty, so this falls back to
 * data/products.ts's mock products for that category, rendered as a
 * clearly non-interactive preview (no link to a product detail page, no
 * Add to Bag) since a mock product has no real backend record a checkout
 * could resolve. Once beauty has real products, useProducts returns real
 * rows and the mock preview stops being used automatically — real products
 * render fully interactive tiles (linked, addable), same as any other
 * tenant's category page.
 */
export function BeautyCategoryDetailPage({
  slug,
  tenantSlug,
}: {
  slug: string;
  tenantSlug: string;
}) {
  const { data, isLoading, isError } = useProducts(tenantSlug, {
    categorySlug: slug,
    sort: "newest",
    page: 1,
    limit: 24,
  });

  const category = beautyCategories.find((c) => c.slug === slug);
  const label = category?.label ?? slug;
  const realProducts = data?.items ?? [];
  const mockProducts = beautyMockProducts.filter(
    (p) => p.categorySlug === slug,
  );
  const usingMock = !isLoading && realProducts.length === 0;

  return (
    <BeautyStorefrontLayout>
      <section
        className="mx-auto max-w-7xl px-6 py-16"
        style={{ color: COLORS.ink }}
      >
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex items-center gap-1.5 text-xs"
          style={{ color: COLORS.muted }}
        >
          <Link href="/" className="hover:opacity-100" style={{ opacity: 0.8 }}>
            Home
          </Link>
          <span>/</span>
          <Link
            href="/categories"
            className="hover:opacity-100"
            style={{ opacity: 0.8 }}
          >
            Categories
          </Link>
          <span>/</span>
          <span style={{ color: COLORS.inkSoft }}>{label}</span>
        </nav>

        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h1
            className="text-3xl sm:text-4xl"
            style={{
              fontFamily: "var(--font-heading)",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </h1>
          <span
            className="text-[11px] tracking-[0.14em]"
            style={{ color: COLORS.muted }}
          >
            {isLoading
              ? "LOADING…"
              : usingMock
                ? `${mockProducts.length} ITEMS (PREVIEW)`
                : `${data?.total ?? realProducts.length} ITEMS`}
          </span>
        </div>

        {isError ? (
          <div
            className="flex flex-col items-center gap-3 rounded-2xl py-20 text-center"
            style={{ border: `1px solid ${COLORS.panelBorder}` }}
          >
            <p className="text-sm" style={{ color: COLORS.muted }}>
              Something went wrong loading these products.
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl"
                style={{ backgroundColor: COLORS.panel }}
              />
            ))}
          </div>
        ) : realProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {realProducts.map((p) => {
              const finalPrice = p.salePrice ?? p.price ?? 0;
              const hasDiscount =
                p.compareAtPrice != null && p.compareAtPrice > finalPrice;
              const savingsPct = hasDiscount
                ? Math.round(
                    ((p.compareAtPrice! - finalPrice) / p.compareAtPrice!) *
                      100,
                  )
                : 0;

              return (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-lg"
                  style={cardStyle}
                >
                  <div className="relative overflow-hidden">
                    <ImagePlaceholder
                      label={p.title}
                      imageUrl={p.thumbnailUrl}
                      aspect="3/4"
                      className="text-current transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                    />
                    {hasDiscount && (
                      <span
                        className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                        style={{
                          backgroundColor: COLORS.ink,
                          color: COLORS.accentInk,
                        }}
                      >
                        -{savingsPct}%
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    {p.brand && (
                      <div
                        className="text-[10px] font-bold uppercase tracking-wide"
                        style={{ color: COLORS.muted }}
                      >
                        {p.brand}
                      </div>
                    )}
                    <div
                      className="text-sm font-semibold leading-snug"
                      style={{ color: COLORS.ink }}
                    >
                      {p.title}
                    </div>
                    {p.rating > 0 && (
                      <div
                        className="flex items-center gap-1 text-xs"
                        style={{ color: COLORS.muted }}
                      >
                        <Star
                          className="h-3 w-3"
                          fill={COLORS.gold}
                          style={{ color: COLORS.gold }}
                        />
                        {p.rating.toFixed(1)}
                      </div>
                    )}
                    <div className="mt-auto flex items-baseline gap-2 pt-1.5">
                      <span
                        className="text-sm font-bold"
                        style={{ color: COLORS.ink }}
                      >
                        ${finalPrice.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span
                          className="text-xs line-through"
                          style={{ color: COLORS.muted }}
                        >
                          ${p.compareAtPrice!.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : mockProducts.length > 0 ? (
          <>
            <p className="mb-6 text-sm" style={{ color: COLORS.muted }}>
              This category doesn&rsquo;t have real inventory yet — showing a
              preview of what it&rsquo;ll look like.
            </p>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {mockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-2xl opacity-90"
                  style={cardStyle}
                >
                  <ImagePlaceholder
                    label={p.thumbnailLabel}
                    aspect="3/4"
                    className="text-current"
                  />
                  <div className="flex flex-col gap-1 p-4">
                    <div
                      className="text-sm font-semibold leading-snug"
                      style={{ color: COLORS.ink }}
                    >
                      {p.title}
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: COLORS.ink }}
                    >
                      ${p.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div
            className="flex flex-col items-center gap-3 rounded-2xl py-20 text-center"
            style={{ border: `1px solid ${COLORS.panelBorder}` }}
          >
            <p className="text-sm" style={{ color: COLORS.muted }}>
              No products found in this category yet.
            </p>
          </div>
        )}
      </section>
    </BeautyStorefrontLayout>
  );
}

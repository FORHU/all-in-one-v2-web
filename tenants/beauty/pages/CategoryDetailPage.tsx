"use client";

import Link from "next/link";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useProducts } from "@/features/storefront/hooks/queries/useProducts";
import { BeautyStorefrontLayout } from "../layouts/StorefrontLayout";
import { beautyCategories } from "../data/categories";
import { beautyMockProducts } from "../data/products";
import { BEAUTY_MIRROR_COLORS as COLORS, beautyPlexMono } from "../theme";

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
            style={{
              color: COLORS.muted,
              fontFamily: beautyPlexMono.style.fontFamily,
            }}
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
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {realProducts.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group flex flex-col gap-3.5"
              >
                <ImagePlaceholder
                  label={p.title}
                  imageUrl={p.thumbnailUrl}
                  aspect="3/4"
                  className="text-current transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <div>
                  <div
                    className="text-[15px]"
                    style={{ color: COLORS.inkSoft }}
                  >
                    {p.title}
                  </div>
                  <div
                    className="mt-1 text-[13px]"
                    style={{
                      color: COLORS.muted,
                      fontFamily: beautyPlexMono.style.fontFamily,
                    }}
                  >
                    ${(p.salePrice ?? p.price ?? 0).toFixed(2)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : mockProducts.length > 0 ? (
          <>
            <p className="mb-6 text-sm" style={{ color: COLORS.muted }}>
              This category doesn&rsquo;t have real inventory yet — showing a
              preview of what it&rsquo;ll look like.
            </p>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {mockProducts.map((p) => (
                <div key={p.id} className="flex flex-col gap-3.5 opacity-90">
                  <ImagePlaceholder
                    label={p.thumbnailLabel}
                    aspect="3/4"
                    className="text-current"
                  />
                  <div>
                    <div
                      className="text-[15px]"
                      style={{ color: COLORS.inkSoft }}
                    >
                      {p.title}
                    </div>
                    <div
                      className="mt-1 text-[13px]"
                      style={{
                        color: COLORS.muted,
                        fontFamily: beautyPlexMono.style.fontFamily,
                      }}
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { useProducts } from "@/features/storefront/hooks/queries/useProducts";
import { useCategories } from "@/features/storefront/hooks/queries/useCategories";
import type { ProductListingParams } from "@/features/storefront/api";
import { ElectronicsStorefrontLayout } from "../layouts/StorefrontLayout";
import {
  ProductMedia,
  StockNote,
  WishlistHeart,
  CartControl,
  productHref,
} from "../components/ShopSection";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";

const SORT_OPTIONS: { value: ProductListingParams["sort"]; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popularity", label: "Most Popular" },
];

/**
 * DigitFriend — one category's product listing, restyled to the
 * "digitfriend ui.html" light cream/near-black/lime palette. Real data via
 * useProducts(tenantSlug, { categorySlug }); sort re-fires the query.
 * Cards reuse ProductMedia/StockNote/WishlistHeart/CartControl from
 * ShopSection.tsx (same photo/art + the same real wishlist/cart wiring, not
 * a separate copy).
 */
export function ElectronicsCategoryDetailPage({
  slug,
  tenantSlug,
}: {
  slug: string;
  tenantSlug: string;
}) {
  const [sort, setSort] =
    useState<NonNullable<ProductListingParams["sort"]>>("newest");

  const { data, isLoading, isError } = useProducts(tenantSlug, {
    categorySlug: slug,
    sort,
    page: 1,
    limit: 24,
  });

  const { data: categories } = useCategories(tenantSlug);
  const category = categories?.items.find((c) => c.slug === slug);
  const label = category?.name ?? slug;
  const products = data?.items ?? [];

  return (
    <ElectronicsStorefrontLayout>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex items-center gap-1.5 text-xs"
          style={{ color: COLORS.muted }}
        >
          <Link href="/" className="hover:text-current">
            Home
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-current">
            Categories
          </Link>
          <span>/</span>
          <span style={{ color: COLORS.ink }}>{label}</span>
        </nav>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {label}
          </h1>

          {products.length > 0 && (
            <label
              className="flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold"
              style={{
                backgroundColor: "#ffffff",
                border: `1px solid ${COLORS.borderStrong}`,
              }}
            >
              Sort
              <select
                value={sort}
                onChange={(e) =>
                  setSort(
                    e.target.value as NonNullable<ProductListingParams["sort"]>,
                  )
                }
                className="bg-transparent text-xs font-semibold outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {isError ? (
          <div
            className="flex flex-col items-center gap-3 rounded-[22px] py-20 text-center"
            style={{ border: `1px dashed ${COLORS.borderStrong}` }}
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
                className="aspect-square animate-pulse rounded-[22px]"
                style={{ backgroundColor: COLORS.border }}
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            {products.map((p) => (
              <article
                key={p.id}
                className="flex flex-col overflow-hidden rounded-[22px]"
                style={{
                  backgroundColor: "#ffffff",
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div className="relative aspect-[4/3]">
                  <Link
                    href={productHref(p)}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute inset-0"
                  >
                    <ProductMedia
                      product={p}
                      categorySlug={slug}
                      iconSize={84}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="h-full w-full"
                    />
                  </Link>
                  <WishlistHeart productId={p.id} variant="overlay" />
                </div>
                <div className="flex flex-1 flex-col gap-3.5 p-4">
                  <h3 className="m-0 min-h-[43px] text-base font-bold leading-snug">
                    <Link href={productHref(p)} className="hover:underline">
                      {p.title}
                    </Link>
                  </h3>
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-2xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        ${(p.salePrice ?? p.price ?? 0).toFixed(2)}
                      </span>
                      <StockNote
                        inStock={p.inStock}
                        className="text-xs font-medium"
                      />
                    </div>
                    <CartControl product={p} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-3 rounded-[22px] py-20 text-center"
            style={{ border: `1px dashed ${COLORS.borderStrong}` }}
          >
            <p className="text-sm" style={{ color: COLORS.muted }}>
              No products found in this category yet.
            </p>
          </div>
        )}
      </section>
    </ElectronicsStorefrontLayout>
  );
}

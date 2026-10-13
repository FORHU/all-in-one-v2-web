"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useProducts } from "@/features/storefront/hooks/queries/useProducts";
import { useCategories } from "@/features/storefront/hooks/queries/useCategories";
import { useWishlistStore } from "@/features/storefront/stores/wishlist.store";
import type { ProductListingParams } from "@/features/storefront/api";
import type { Product } from "@/features/storefront/contracts/products.contract";
import { BeautyStorefrontLayout } from "../layouts/StorefrontLayout";
import { beautyCategories } from "../data/categories";
import { beautyMockProducts } from "../data/products";
import { BEAUTY_MIRROR_COLORS as COLORS } from "../theme";

const glassBlur: React.CSSProperties = {
  backdropFilter: "blur(26px) saturate(170%)",
  WebkitBackdropFilter: "blur(26px) saturate(170%)",
};

// Frosted-glass card, matching the rest of the re-themed tenant
// (MirrorShelfCategoryCard, the header, etc.) instead of an opaque white
// surface — lets the layout's blurred-photo backdrop show through.
const cardStyle: React.CSSProperties = {
  backgroundColor: COLORS.glassBg,
  border: `1px solid ${COLORS.glassBorder}`,
  boxShadow: "0 1px 0 rgba(255,255,255,.7) inset",
  ...glassBlur,
};

const SORT_OPTIONS: { value: ProductListingParams["sort"]; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popularity", label: "Most Popular" },
];

function priceInfo(p: Product) {
  const finalPrice = p.salePrice ?? p.price ?? 0;
  const hasDiscount = p.compareAtPrice != null && p.compareAtPrice > finalPrice;
  const savingsPct = hasDiscount
    ? Math.round(((p.compareAtPrice! - finalPrice) / p.compareAtPrice!) * 100)
    : 0;
  return { finalPrice, hasDiscount, savingsPct };
}

function WishlistButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const isSaved = useWishlistStore((s) => s.ids.includes(productId));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggleWishlist(productId);
      }}
      aria-label={isSaved ? "Remove from saved" : "Save this product"}
      aria-pressed={isSaved}
      className={className}
      style={{
        backgroundColor: COLORS.glassDarkBg,
        border: `1px solid ${COLORS.glassDarkBorder}`,
        color: isSaved ? COLORS.accent : "#fff",
        ...glassBlur,
      }}
    >
      <Heart className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
    </button>
  );
}

/** A shelf-row card — fixed width so the row scrolls predictably, one snap-stop per card. */
function ShelfCard({ product }: { product: Product }) {
  const { finalPrice, hasDiscount, savingsPct } = priceInfo(product);

  return (
    <div
      className="relative flex w-[210px] flex-none snap-start flex-col overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1"
      style={cardStyle}
    >
      <Link href={`/products/${product.slug}`} className="group contents">
        <div className="relative overflow-hidden">
          <ImagePlaceholder
            label={product.title}
            imageUrl={product.thumbnailUrl}
            aspect="3/4"
            className="text-current transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
          {hasDiscount && (
            <span
              className="absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: COLORS.accent }}
            >
              -{savingsPct}%
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-0.5 p-3.5">
          {product.brand && (
            <div
              className="text-[9px] font-bold uppercase tracking-wide"
              style={{ color: COLORS.muted }}
            >
              {product.brand}
            </div>
          )}
          <div
            className="truncate text-[13px] font-semibold"
            style={{ color: COLORS.ink }}
          >
            {product.title}
          </div>
          <div className="mt-auto flex items-baseline gap-1.5 pt-1">
            <span className="text-sm font-bold" style={{ color: COLORS.ink }}>
              ${finalPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span
                className="text-[11px] line-through"
                style={{ color: COLORS.muted }}
              >
                ${product.compareAtPrice!.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <WishlistButton
        productId={product.id}
        className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full"
      />
    </div>
  );
}

/**
 * Beauty — one category's product listing ("Mirror Shelf" glass aesthetic).
 * Deliberately not another static grid: the category's current top result
 * (by whatever `sort` is active) gets a large "Mirror Mode"-style spotlight
 * panel — same glass-framed hero treatment as the home page's center
 * image — and everything else sits in a horizontally scrollable "shelf"
 * row (scroll-snap + real prev/next buttons) rather than one more wall of
 * equal-sized tiles, matching this tenant's own "Mirror Shelf" branding
 * (a shelf is something you browse along, not a grid you scan).
 *
 * Tries real data first (useProducts(tenantSlug, { categorySlug })) —
 * beauty's catalog is currently empty, so this falls back to
 * data/products.ts's mock products for that category, rendered as a
 * clearly non-interactive preview (no link to a product detail page, no
 * Add to Bag) since a mock product has no real backend record a checkout
 * could resolve. Once beauty has real products, useProducts returns real
 * rows and the mock preview stops being used automatically.
 *
 * Title prefers the real category's own `name` (useCategories(tenantSlug),
 * matched by slug) over data/categories.ts's static 4-entry list — that
 * list only covers the 4 top-level slugs (skincare/makeup/haircare/
 * fragrance), so a sub-category route like /categories/skincare-masks
 * previously fell all the way back to rendering the raw slug as the page
 * title instead of "Masks".
 *
 * Sort control is real: selecting an option re-fires useProducts with
 * that `sort` value (newest/price-asc/price-desc/popularity — see
 * ProductListingParams), which also reorders which item becomes the
 * spotlight. Every card has a real wishlist toggle (useWishlistStore,
 * same store the PDP's heart button and the home hero's "N Saved"
 * eyebrow both read/write).
 */
export function BeautyCategoryDetailPage({
  slug,
  tenantSlug,
}: {
  slug: string;
  tenantSlug: string;
}) {
  const [sort, setSort] =
    useState<NonNullable<ProductListingParams["sort"]>>("newest");
  const shelfRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useProducts(tenantSlug, {
    categorySlug: slug,
    sort,
    page: 1,
    limit: 24,
  });

  const { data: categories } = useCategories(tenantSlug);
  const realCategory = categories?.items.find((c) => c.slug === slug);
  const staticCategory = beautyCategories.find((c) => c.slug === slug);
  const label = realCategory?.name ?? staticCategory?.label ?? slug;
  const realProducts = data?.items ?? [];
  const mockProducts = beautyMockProducts.filter(
    (p) => p.categorySlug === slug,
  );
  const usingMock = !isLoading && realProducts.length === 0;

  const spotlight = realProducts[0];
  const shelfProducts = realProducts.slice(1);

  const scrollShelf = (direction: 1 | -1) => {
    shelfRef.current?.scrollBy({ left: direction * 460, behavior: "smooth" });
  };

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

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
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
              className="mt-1 block text-[11px] tracking-[0.14em]"
              style={{ color: COLORS.muted }}
            >
              {isLoading
                ? "LOADING…"
                : usingMock
                  ? `${mockProducts.length} ITEMS (PREVIEW)`
                  : `${data?.total ?? realProducts.length} ITEMS`}
            </span>
          </div>

          {realProducts.length > 0 && (
            <label
              className="flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold"
              style={{
                backgroundColor: COLORS.glassBg,
                border: `1px solid ${COLORS.glassBorder}`,
                color: COLORS.ink,
                ...glassBlur,
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
                style={{ color: COLORS.ink }}
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
            className="flex flex-col items-center gap-3 rounded-2xl py-20 text-center"
            style={cardStyle}
          >
            <p className="text-sm" style={{ color: COLORS.muted }}>
              Something went wrong loading these products.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col gap-10">
            <div
              className="aspect-[16/9] animate-pulse rounded-[28px]"
              style={{ backgroundColor: COLORS.panel }}
            />
            <div className="flex gap-5 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] w-[210px] flex-none animate-pulse rounded-2xl"
                  style={{ backgroundColor: COLORS.panel }}
                />
              ))}
            </div>
          </div>
        ) : spotlight ? (
          <div className="flex flex-col gap-10">
            {/* Spotlight — same glass-framed "Mirror Mode" hero treatment
                as the home page's center panel, applied to whichever
                product is currently first under the active sort. */}
            <div
              className="relative grid grid-cols-1 gap-0 overflow-hidden rounded-[28px] md:grid-cols-2"
              style={cardStyle}
            >
              <Link
                href={`/products/${spotlight.slug}`}
                className="relative block aspect-[4/3] md:aspect-auto"
              >
                <ImagePlaceholder
                  label={spotlight.title}
                  imageUrl={spotlight.thumbnailUrl}
                  aspect="4/3"
                  className="h-full w-full text-current"
                />
              </Link>
              <WishlistButton
                productId={spotlight.id}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full md:right-auto md:left-4"
              />
              <div className="flex flex-col justify-center gap-3 p-8 sm:p-10">
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: COLORS.accent }}
                >
                  {sort === "newest"
                    ? "Just In"
                    : sort === "popularity"
                      ? "Most Popular"
                      : "Featured"}
                </span>
                {spotlight.brand && (
                  <div
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: COLORS.muted }}
                  >
                    {spotlight.brand}
                  </div>
                )}
                <h2
                  className="text-2xl font-semibold leading-tight sm:text-3xl"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: COLORS.ink,
                  }}
                >
                  {spotlight.title}
                </h2>
                {spotlight.rating > 0 && (
                  <div
                    className="flex items-center gap-1.5 text-sm"
                    style={{ color: COLORS.muted }}
                  >
                    <Star
                      className="h-4 w-4"
                      fill={COLORS.accent}
                      style={{ color: COLORS.accent }}
                    />
                    {spotlight.rating.toFixed(1)}
                    {spotlight.reviewCount > 0 && (
                      <span>({spotlight.reviewCount})</span>
                    )}
                  </div>
                )}
                {(() => {
                  const { finalPrice, hasDiscount, savingsPct } =
                    priceInfo(spotlight);
                  return (
                    <div className="flex items-baseline gap-3">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: COLORS.ink }}
                      >
                        ${finalPrice.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <>
                          <span
                            className="text-sm line-through"
                            style={{ color: COLORS.muted }}
                          >
                            ${spotlight.compareAtPrice!.toFixed(2)}
                          </span>
                          <span
                            className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
                            style={{ backgroundColor: COLORS.accent }}
                          >
                            Save {savingsPct}%
                          </span>
                        </>
                      )}
                    </div>
                  );
                })()}
                <Link
                  href={`/products/${spotlight.slug}`}
                  className="mt-3 inline-flex h-12 w-fit items-center justify-center rounded-full px-8 text-xs font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: COLORS.ink,
                    color: COLORS.accentInk,
                  }}
                >
                  View Product
                </Link>
              </div>
            </div>

            {/* Shelf — everything else, browsed horizontally rather than
                scanned as a grid. scroll-snap-x keeps each card landing
                cleanly; the two arrow buttons are real (scrollBy), not
                decorative — hidden on touch-first small screens, where
                swiping the row directly is the natural gesture. */}
            {shelfProducts.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3
                    className="text-lg font-semibold"
                    style={{
                      fontFamily: "var(--font-heading)",
                      color: COLORS.ink,
                    }}
                  >
                    More on the Shelf
                  </h3>
                  <div className="hidden items-center gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={() => scrollShelf(-1)}
                      aria-label="Scroll left"
                      className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                      style={{
                        backgroundColor: COLORS.glassBg,
                        border: `1px solid ${COLORS.glassBorder}`,
                        color: COLORS.ink,
                        ...glassBlur,
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollShelf(1)}
                      aria-label="Scroll right"
                      className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                      style={{
                        backgroundColor: COLORS.glassBg,
                        border: `1px solid ${COLORS.glassBorder}`,
                        color: COLORS.ink,
                        ...glassBlur,
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div
                  ref={shelfRef}
                  className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3"
                  style={{ scrollbarWidth: "none" }}
                >
                  {shelfProducts.map((p) => (
                    <ShelfCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
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
            style={cardStyle}
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

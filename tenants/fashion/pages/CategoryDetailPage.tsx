"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { TrendingLookbook } from "../components/TrendingLookbook";
import {
  CategoryFilters,
  type CategoryFilterState,
} from "../components/CategoryFilters";
import {
  ProductCard,
  type ProductCardProduct,
} from "@/shared/components/ProductCard";
import {
  QuickViewModal,
  type QuickViewSelection,
} from "@/shared/components/QuickViewModal";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { toast } from "sonner";
import { useProducts } from "@/features/storefront/hooks/queries/useProducts";
import type { ProductListingParams } from "@/features/storefront/api/products.client";
import { quickAddToCart } from "../utils/quickAddToCart";
import { toProductCardProduct } from "../utils/toProductCardProduct";

function humanize(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Nav links (Women/Men/...) use a short department taxonomy that doesn't
 * match the seeded backend category slugs. Renaming the backend slugs would
 * ripple into 40+ references in the product seeder, so the mismatch is
 * resolved here instead. `shoes`/`accessories` already match directly.
 * `kids`/`sale` have no backing category — the API correctly returns zero
 * results for those, which the empty state below already handles.
 */
const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  women: "womens-fashion",
  men: "mens-fashion",
};

type SortOption = "newest" | "price-asc" | "popularity";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  popularity: "Popularity",
};

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function parseCsv(value: string | null): string[] {
  return value
    ? value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];
}

/**
 * Fashion — category / collection page. Filters, sort, and page are all
 * URL-driven (shareable, bookmarkable) and passed straight through to
 * GET /v2/products. `tenantSlug` is resolved server-side by the route entry
 * point (src/app/categories/[slug]/page.tsx) and threaded down here since no
 * shared client-side tenant-detection module exists yet.
 */
export function FashionCategoryDetailPage({
  slug,
  tenantSlug,
}: {
  slug: string;
  tenantSlug: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categorySlug = CATEGORY_SLUG_ALIASES[slug] ?? slug;
  const label = humanize(slug);

  const page = Number(searchParams.get("page")) || 1;
  const sort = (searchParams.get("sort") as SortOption) || "newest";
  const sizes = parseCsv(searchParams.get("sizes"));
  const colors = parseCsv(searchParams.get("colors"));
  const brands = parseCsv(searchParams.get("brands"));
  const urlPriceMin = searchParams.get("priceMin");
  const urlPriceMax = searchParams.get("priceMax");

  const [quickViewProduct, setQuickViewProduct] =
    useState<ProductCardProduct | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const addItem = useLocalCartStore((s) => s.addItem);

  const updateParams = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    // Any filter/sort change resets pagination back to page 1.
    if (!("page" in patch)) params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Not memoized: sizes/colors/brands come from parseCsv() on searchParams,
  // a new array reference every render regardless, so a useMemo here would
  // recompute every time anyway — no real memoization to be had. TanStack
  // Query dedupes by the query key's serialized content (see
  // productsKeys.list), not by this object's identity, so rebuilding it
  // plainly on every render is harmless.
  const queryParams: ProductListingParams = {
    categorySlug,
    sort:
      sort === "popularity"
        ? "popularity"
        : sort === "price-asc"
          ? "price-asc"
          : "newest",
    sizes: sizes.length ? sizes : undefined,
    colors: colors.length ? colors : undefined,
    brands: brands.length ? brands : undefined,
    priceMin: urlPriceMin ? Number(urlPriceMin) : undefined,
    priceMax: urlPriceMax ? Number(urlPriceMax) : undefined,
    page,
    limit: 12,
  };

  const { data, isLoading, isError } = useProducts(tenantSlug, queryParams);

  const products = data?.items ?? [];
  const facets = data?.facets;
  const priceBounds: [number, number] = [
    facets?.priceMin ?? 0,
    facets?.priceMax ?? 0,
  ];
  const priceRange: [number, number] = [
    urlPriceMin ? Number(urlPriceMin) : priceBounds[0],
    urlPriceMax ? Number(urlPriceMax) : priceBounds[1],
  ];

  const filters: CategoryFilterState = { sizes, colors, brands, priceRange };

  const handleAddToCart = (
    product: ProductCardProduct,
    selection: QuickViewSelection,
  ) => {
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      imageLabel: product.imageLabel,
      size: selection.size,
      color: selection.color,
      quantity: selection.quantity,
    });
    toast.success(`Added ${product.name} to cart`);
  };

  const isPriceFiltered = urlPriceMin !== null || urlPriceMax !== null;

  const colorLabel = (value: string) =>
    facets?.colors.find((c) => c.value === value)?.label ?? value;
  const sizeLabel = (value: string) => value.toUpperCase();

  const activePills: { key: string; label: string; onRemove: () => void }[] = [
    ...sizes.map((size) => ({
      key: `size-${size}`,
      label: `Size: ${sizeLabel(size)}`,
      onRemove: () =>
        updateParams({ sizes: toggleValue(sizes, size).join(",") || null }),
    })),
    ...colors.map((color) => ({
      key: `color-${color}`,
      label: `Color: ${colorLabel(color)}`,
      onRemove: () =>
        updateParams({ colors: toggleValue(colors, color).join(",") || null }),
    })),
    ...brands.map((brand) => ({
      key: `brand-${brand}`,
      label: brand,
      onRemove: () =>
        updateParams({ brands: toggleValue(brands, brand).join(",") || null }),
    })),
    ...(isPriceFiltered
      ? [
          {
            key: "price",
            label: `$${priceRange[0].toFixed(2)} - $${priceRange[1].toFixed(2)}`,
            onRemove: () => updateParams({ priceMin: null, priceMax: null }),
          },
        ]
      : []),
  ];

  const clearAll = () =>
    updateParams({
      sizes: null,
      colors: null,
      brands: null,
      priceMin: null,
      priceMax: null,
    });

  const filterSidebarProps = {
    availableSizes: facets?.sizes ?? [],
    availableColors: facets?.colors ?? [],
    availableBrands: facets?.brands ?? [],
    priceBounds,
    filters,
    onToggleSize: (size: string) =>
      updateParams({ sizes: toggleValue(sizes, size).join(",") || null }),
    onToggleColor: (color: string) =>
      updateParams({ colors: toggleValue(colors, color).join(",") || null }),
    onToggleBrand: (brand: string) =>
      updateParams({ brands: toggleValue(brands, brand).join(",") || null }),
    onPriceChange: (range: [number, number]) =>
      updateParams({ priceMin: String(range[0]), priceMax: String(range[1]) }),
  };

  return (
    <FashionStorefrontLayout>
      <TrendingLookbook tenantSlug={tenantSlug} categorySlug={categorySlug} />
      <div
        className="mx-auto max-w-7xl px-6 py-10"
        style={{ color: "var(--brand-primary)" }}
      >
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex items-center gap-1.5 text-xs opacity-60"
        >
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:underline">
            Categories
          </Link>
          <span>/</span>
          <span className="font-semibold opacity-100">{label}</span>
        </nav>

        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h1
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {label}
          </h1>
          <span className="text-sm opacity-60">
            {isLoading ? "Loading…" : `${data?.total ?? 0} items`}
          </span>
        </div>

        {isError ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-current/10 py-20 text-center">
            <p className="text-sm opacity-60">
              Something went wrong loading these products.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 lg:flex-row">
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex items-center gap-2 self-start rounded-xl border px-4 py-2.5 text-sm font-semibold lg:hidden"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
              }}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>

            <aside className="hidden w-64 flex-none lg:block">
              <CategoryFilters {...filterSidebarProps} />
            </aside>

            {isMobileFiltersOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto p-6"
                  style={{
                    backgroundColor: "var(--brand-secondary)",
                    color: "var(--brand-primary)",
                  }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-lg font-bold">Filters</span>
                    <button
                      type="button"
                      onClick={() => setIsMobileFiltersOpen(false)}
                      aria-label="Close filters"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <CategoryFilters {...filterSidebarProps} />
                </div>
              </div>
            )}

            <div className="flex-1">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {activePills.map((pill) => (
                    <button
                      key={pill.key}
                      type="button"
                      onClick={pill.onRemove}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--brand-primary) 8%, transparent)",
                      }}
                    >
                      {pill.label}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                  {activePills.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-xs font-semibold underline opacity-70"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <select
                  value={sort}
                  onChange={(event) =>
                    updateParams({ sort: event.target.value })
                  }
                  className="h-10 rounded-full border bg-transparent px-4 text-xs font-semibold outline-none"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
                    color: "var(--brand-primary)",
                  }}
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                    <option key={key} value={key}>
                      {SORT_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>

              {!isLoading && products.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-current/10 py-20 text-center">
                  <p className="text-sm opacity-60">
                    No products match these filters.
                  </p>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-sm font-semibold underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-4">
                  {isLoading && products.length === 0
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="aspect-[3/4] animate-pulse rounded-2xl bg-current/5"
                        />
                      ))
                    : products.map((product) => {
                        const cardProduct = toProductCardProduct(product);
                        return (
                          <ProductCard
                            key={cardProduct.id}
                            product={cardProduct}
                            onQuickView={setQuickViewProduct}
                            onQuickAdd={quickAddToCart}
                          />
                        );
                      })}
                </div>
              )}

              {data && data.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                    className="rounded-full border px-4 py-2 text-xs font-semibold disabled:opacity-30"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
                    }}
                  >
                    Previous
                  </button>
                  <span className="text-xs opacity-60">
                    Page {data.page} of {data.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= data.totalPages}
                    onClick={() => updateParams({ page: String(page + 1) })}
                    className="rounded-full border px-4 py-2 text-xs font-semibold disabled:opacity-30"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </FashionStorefrontLayout>
  );
}

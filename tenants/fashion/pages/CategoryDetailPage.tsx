"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { Skeleton } from "@/shared/components/Skeleton";
import {
  QuickViewModal,
  type QuickViewSelection,
} from "@/shared/components/QuickViewModal";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { toast } from "sonner";
import { useCategoryDetail } from "@/features/storefront/hooks/queries/useCategoryDetail";
import { toProductCardProductFromCategory } from "../utils/toProductCardProduct";
import { quickAddToCart } from "../utils/quickAddToCart";

function humanize(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type SortOption = "newest" | "price-asc" | "price-desc";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

/**
 * Fashion — category / collection page.
 * Fetches the real category + its products via GET /v2/categories/:slug
 * (see useCategoryDetail.ts — CategoryRepository.findBySlug in the API
 * already eager-loads up to 20 products with media + variants, no
 * separate product-browse endpoint needed). Size/Color facets and
 * filtering/sorting are all derived from real variant data — see
 * toProductCardProductFromCategory() for how color/size get parsed out of
 * each variant's "Color / Size" title convention.
 */
export function FashionCategoryDetailPage({ slug }: { slug: string }) {
  const { data: category, isLoading, isError } = useCategoryDetail(slug);
  const label = category?.name ?? humanize(slug);

  const products = useMemo(
    () => (category?.products ?? []).map(toProductCardProductFromCategory),
    [category],
  );

  const availableSizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes ?? []))).sort(),
    [products],
  );
  const availableColors = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.colors ?? []))).sort(),
    [products],
  );
  const priceBounds = useMemo((): [number, number] => {
    if (products.length === 0) return [0, 0];
    const prices = products.map((p) => p.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [products]);

  const [filters, setFilters] = useState<CategoryFilterState>({
    sizes: [],
    colors: [],
    priceRange: priceBounds,
  });
  const [sort, setSort] = useState<SortOption>("newest");
  const [quickViewProduct, setQuickViewProduct] =
    useState<ProductCardProduct | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const addItem = useLocalCartStore((s) => s.addItem);

  // priceBounds only becomes known once the category has loaded — widen the
  // active filter range to match rather than leaving it stuck at [0, 0].
  const effectivePriceRange: [number, number] =
    filters.priceRange[0] === 0 && filters.priceRange[1] === 0
      ? priceBounds
      : filters.priceRange;

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

  const filtered = products.filter((p) => {
    if (
      filters.sizes.length > 0 &&
      !p.sizes?.some((s) => filters.sizes.includes(s))
    )
      return false;
    if (
      filters.colors.length > 0 &&
      !p.colors?.some((c) => filters.colors.includes(c))
    )
      return false;
    if (p.price < effectivePriceRange[0] || p.price > effectivePriceRange[1])
      return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return 0; // "newest" — category.products is already backend-ordered
  });

  const isPriceFiltered =
    effectivePriceRange[0] !== priceBounds[0] ||
    effectivePriceRange[1] !== priceBounds[1];

  const activePills: { key: string; label: string; onRemove: () => void }[] = [
    ...filters.sizes.map((size) => ({
      key: `size-${size}`,
      label: `Size: ${size}`,
      onRemove: () =>
        setFilters((f) => ({ ...f, sizes: toggleValue(f.sizes, size) })),
    })),
    ...filters.colors.map((color) => ({
      key: `color-${color}`,
      label: `Color: ${color}`,
      onRemove: () =>
        setFilters((f) => ({ ...f, colors: toggleValue(f.colors, color) })),
    })),
    ...(isPriceFiltered
      ? [
          {
            key: "price",
            label: `$${effectivePriceRange[0]} - $${effectivePriceRange[1]}`,
            onRemove: () =>
              setFilters((f) => ({ ...f, priceRange: priceBounds })),
          },
        ]
      : []),
  ];

  const clearAll = () =>
    setFilters({ sizes: [], colors: [], priceRange: priceBounds });

  const filterSidebarProps = {
    availableSizes,
    availableColors,
    priceBounds,
    filters: { ...filters, priceRange: effectivePriceRange },
    onToggleSize: (size: string) =>
      setFilters((f) => ({ ...f, sizes: toggleValue(f.sizes, size) })),
    onToggleColor: (color: string) =>
      setFilters((f) => ({ ...f, colors: toggleValue(f.colors, color) })),
    onPriceChange: (range: [number, number]) =>
      setFilters((f) => ({ ...f, priceRange: range })),
  };

  return (
    <FashionStorefrontLayout>
      <TrendingLookbook />
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
          {!isLoading && !isError && (
            <span className="text-sm opacity-60">{sorted.length} items</span>
          )}
        </div>

        {isError && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-current/10 py-20 text-center">
            <p className="text-sm opacity-60">
              We couldn&rsquo;t find a category at &ldquo;{slug}&rdquo;.
            </p>
            <Link
              href="/categories"
              className="text-sm font-semibold underline"
            >
              Browse all categories
            </Link>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
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
                    setSort(event.target.value as SortOption)
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

              {sorted.length === 0 ? (
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
                  {sorted.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={setQuickViewProduct}
                      onQuickAdd={quickAddToCart}
                    />
                  ))}
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

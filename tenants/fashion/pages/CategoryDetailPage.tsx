"use client";

import { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import {
  CategoryFilters,
  COLOR_NAMES,
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
import { fashionCategories } from "../data/categories";
import { fashionProducts } from "../data/products";
import { quickAddToCart } from "../utils/quickAddToCart";

function humanize(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const AVAILABLE_SIZES = Array.from(
  new Set(fashionProducts.flatMap((p) => p.sizes ?? [])),
);
const AVAILABLE_COLORS = Array.from(
  new Set(fashionProducts.flatMap((p) => p.colors ?? [])),
);
const AVAILABLE_BRANDS = Array.from(
  new Set(fashionProducts.map((p) => p.brand)),
);
const PRICES = fashionProducts.map((p) => p.price);
const PRICE_BOUNDS: [number, number] = [
  Math.min(...PRICES),
  Math.max(...PRICES),
];

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

/**
 * Fashion — category / collection page.
 * `slug` may or may not match an entry in data/categories.ts — nav items
 * (women/men/kids/sale) route here too but belong to a separate,
 * unreconciled department taxonomy (see data/categories.ts's comment).
 * There is still no real category->product mapping, so every category
 * shows the full static catalog (data/products.ts) filtered/sorted
 * entirely client-side — a placeholder for real category-scoped,
 * server-side filtering once product-search is implemented.
 */
export function FashionCategoryDetailPage({ slug }: { slug: string }) {
  const category = fashionCategories.find((c) => c.slug === slug);
  const label = category?.label ?? humanize(slug);

  const [filters, setFilters] = useState<CategoryFilterState>({
    sizes: [],
    colors: [],
    brands: [],
    priceRange: PRICE_BOUNDS,
  });
  const [sort, setSort] = useState<SortOption>("newest");
  const [quickViewProduct, setQuickViewProduct] =
    useState<ProductCardProduct | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const addItem = useLocalCartStore((s) => s.addItem);

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

  const filtered = fashionProducts.filter((p) => {
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
    if (filters.brands.length > 0 && !filters.brands.includes(p.brand))
      return false;
    if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1])
      return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "popularity")
      return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
    return 0; // "newest" = catalog order — no real createdAt field yet
  });

  const isPriceFiltered =
    filters.priceRange[0] !== PRICE_BOUNDS[0] ||
    filters.priceRange[1] !== PRICE_BOUNDS[1];

  const activePills: { key: string; label: string; onRemove: () => void }[] = [
    ...filters.sizes.map((size) => ({
      key: `size-${size}`,
      label: `Size: ${size}`,
      onRemove: () =>
        setFilters((f) => ({ ...f, sizes: toggleValue(f.sizes, size) })),
    })),
    ...filters.colors.map((color) => ({
      key: `color-${color}`,
      label: `Color: ${COLOR_NAMES[color] ?? color}`,
      onRemove: () =>
        setFilters((f) => ({ ...f, colors: toggleValue(f.colors, color) })),
    })),
    ...filters.brands.map((brand) => ({
      key: `brand-${brand}`,
      label: brand,
      onRemove: () =>
        setFilters((f) => ({ ...f, brands: toggleValue(f.brands, brand) })),
    })),
    ...(isPriceFiltered
      ? [
          {
            key: "price",
            label: `$${filters.priceRange[0]} - $${filters.priceRange[1]}`,
            onRemove: () =>
              setFilters((f) => ({ ...f, priceRange: PRICE_BOUNDS })),
          },
        ]
      : []),
  ];

  const clearAll = () =>
    setFilters({ sizes: [], colors: [], brands: [], priceRange: PRICE_BOUNDS });

  const filterSidebarProps = {
    availableSizes: AVAILABLE_SIZES,
    availableColors: AVAILABLE_COLORS,
    availableBrands: AVAILABLE_BRANDS,
    priceBounds: PRICE_BOUNDS,
    filters,
    onToggleSize: (size: string) =>
      setFilters((f) => ({ ...f, sizes: toggleValue(f.sizes, size) })),
    onToggleColor: (color: string) =>
      setFilters((f) => ({ ...f, colors: toggleValue(f.colors, color) })),
    onToggleBrand: (brand: string) =>
      setFilters((f) => ({ ...f, brands: toggleValue(f.brands, brand) })),
    onPriceChange: (range: [number, number]) =>
      setFilters((f) => ({ ...f, priceRange: range })),
  };

  return (
    <FashionStorefrontLayout>
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
          <span className="text-sm opacity-60">{sorted.length} items</span>
        </div>

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
                onChange={(event) => setSort(event.target.value as SortOption)}
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
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </FashionStorefrontLayout>
  );
}

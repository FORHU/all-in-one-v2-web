"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { TrendingLookbook } from "../components/TrendingLookbook";
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
import { useBuyNow } from "../hooks/useBuyNow";

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

  const [quickViewProduct, setQuickViewProduct] =
    useState<ProductCardProduct | null>(null);
  const addItem = useLocalCartStore((s) => s.addItem);
  const buyNow = useBuyNow();

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

  const queryParams: ProductListingParams = {
    categorySlug,
    sort: "newest",
    page,
    limit: 12,
  };

  const { data, isLoading, isError } = useProducts(tenantSlug, queryParams);

  const products = data?.items ?? [];

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
      imageUrl: product.imageUrl,
      size: selection.size,
      color: selection.color,
      quantity: selection.quantity,
    });
    toast.success(`Added ${product.name} to cart`);
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
          <div>
            {!isLoading && products.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-current/10 py-20 text-center">
                <p className="text-sm opacity-60">
                  No products found in this category yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-4">
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
                          onBuyNow={buyNow}
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
        )}
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={buyNow}
      />
    </FashionStorefrontLayout>
  );
}

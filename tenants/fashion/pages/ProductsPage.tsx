"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { ProductCard } from "@/shared/components/ProductCard";
import { useProducts } from "@/features/storefront/hooks/queries/useProducts";
import type { ProductListingParams } from "@/features/storefront/api/products.client";
import { quickAddToCart } from "../utils/quickAddToCart";
import { toProductCardProduct } from "../utils/toProductCardProduct";

/**
 * Fashion — full product listing page ("All Products"). No category/attribute
 * filters here (that's CategoryDetailPage's job) — this page is deliberately
 * just "browse everything, paginated". Page number lives in the URL so it's
 * shareable/bookmarkable, same pattern as CategoryDetailPage. All pagination
 * math (skip/take/total/totalPages) happens on the backend — this component
 * only reads `data.page`/`data.totalPages` to render and disable the
 * Previous/Next controls, it never slices or counts anything itself.
 */
export function FashionProductsPage({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;

  const queryParams: ProductListingParams = {
    sort: "newest",
    page,
    limit: 12,
  };

  const { data, isLoading, isError } = useProducts(tenantSlug, queryParams);
  const products = data?.items ?? [];

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <FashionStorefrontLayout>
      <section
        className="mx-auto max-w-7xl px-6 py-16"
        style={{ color: "var(--brand-primary)" }}
      >
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h1
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            All Products
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
        ) : !isLoading && products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-current/10 py-20 text-center">
            <p className="text-sm opacity-60">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-4">
            {isLoading && products.length === 0
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] animate-pulse rounded-2xl bg-current/5"
                  />
                ))
              : products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={toProductCardProduct(product)}
                    onQuickAdd={quickAddToCart}
                  />
                ))}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
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
              onClick={() => goToPage(page + 1)}
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
      </section>
    </FashionStorefrontLayout>
  );
}

"use client";

import Link from "next/link";
import { ProductCard } from "@/shared/components/ProductCard";
import { useProducts } from "@/features/storefront/hooks/queries/useProducts";
import { quickAddToCart } from "../utils/quickAddToCart";
import { toProductCardProduct } from "../utils/toProductCardProduct";
import { useBuyNow } from "../hooks/useBuyNow";

/**
 * Fashion — homepage "New Arrivals" rail, shown below Trending. Real data
 * via GET /v2/products?sort=newest, no client-side shuffling — the
 * catalog's normal newest-first order, deliberately predictable/stable in
 * contrast to Trending's randomized sample.
 */
export function FeaturedProducts({ tenantSlug }: { tenantSlug: string }) {
  const buyNow = useBuyNow();
  const { data, isLoading } = useProducts(tenantSlug, {
    sort: "newest",
    page: 1,
    limit: 12,
  });
  const products = data?.items ?? [];

  if (isLoading || products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{
              color: "var(--brand-primary)",
              fontFamily: "var(--font-heading)",
            }}
          >
            New Arrivals
          </h2>
          <div
            className="mt-3 h-0.5 w-10"
            style={{ backgroundColor: "var(--brand-primary)" }}
          />
        </div>
        <Link
          href="/products"
          className="text-sm font-semibold underline"
          style={{ color: "var(--brand-primary)" }}
        >
          View all
        </Link>
      </div>
      <div
        className="grid grid-cols-3 gap-5 sm:grid-cols-4 lg:grid-cols-6"
        style={{ color: "var(--brand-primary)" }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={toProductCardProduct(product)}
            onQuickAdd={quickAddToCart}
            onBuyNow={buyNow}
          />
        ))}
      </div>
    </section>
  );
}

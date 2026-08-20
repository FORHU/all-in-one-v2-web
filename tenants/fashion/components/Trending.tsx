"use client";

import { useMemo } from "react";
import { ProductCard } from "@/shared/components/ProductCard";
import { useProducts } from "@/features/storefront/hooks/queries/useProducts";
import { quickAddToCart } from "../utils/quickAddToCart";
import { toProductCardProduct } from "../utils/toProductCardProduct";
import { useBuyNow } from "../hooks/useBuyNow";

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const DISPLAY_COUNT = 12;

/**
 * Fashion — homepage "Trending" rail, shown right under the "Get the Look"
 * hero. There's no "trending"/"random" sort on GET /v2/products, so this
 * pulls a wide pool of real catalog products (newest 60, no category
 * filter) and randomly samples a fresh subset of DISPLAY_COUNT from that
 * pool client-side — a real random selection across a broad slice of the
 * catalog, not just a reshuffle of the same fixed handful every visit.
 * Re-samples whenever the underlying product pool changes, not on every
 * render (the sampling is memoized on `data`).
 */
export function Trending({ tenantSlug }: { tenantSlug: string }) {
  const buyNow = useBuyNow();
  const { data, isLoading } = useProducts(tenantSlug, {
    sort: "newest",
    page: 1,
    limit: 60,
  });

  const products = useMemo(
    () => (data ? shuffle(data.items).slice(0, DISPLAY_COUNT) : []),
    [data],
  );

  if (isLoading || products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8">
        <h2
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{
            color: "var(--brand-primary)",
            fontFamily: "var(--font-heading)",
          }}
        >
          Trending
        </h2>
        <div
          className="mt-3 h-0.5 w-10"
          style={{
            backgroundColor: "var(--brand-accent, var(--brand-primary))",
          }}
        />
      </div>
      <div
        className="grid grid-cols-3 gap-5 sm:grid-cols-4 lg:grid-cols-6"
        style={{ color: "var(--brand-primary)" }}
      >
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={toProductCardProduct(product)}
            onQuickAdd={quickAddToCart}
            onBuyNow={buyNow}
            index={i + 1}
          />
        ))}
      </div>

      {/* Marks the end of the curated/random Trending rail before the page
          drops back into standard footer content below. */}
      <div className="mt-16 flex items-center justify-center gap-4">
        <span
          className="h-px flex-1"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
          }}
        />
        <span
          className="h-1.5 w-1.5 flex-none rounded-full"
          style={{ backgroundColor: "var(--brand-primary)" }}
        />
        <span
          className="h-px flex-1"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
          }}
        />
      </div>
    </section>
  );
}

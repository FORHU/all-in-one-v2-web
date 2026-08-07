"use client";

import { ProductCard } from "@/shared/components/ProductCard";
import { HorizontalScroller } from "@/shared/components/HorizontalScroller";
import { Skeleton } from "@/shared/components/Skeleton";
import { useStorefrontPage } from "@/features/storefront/hooks/queries/useStorefrontPage";
import { toProductCardProduct } from "../utils/toProductCardProduct";
import { repeatToFill } from "../utils/repeatToFill";

const MIN_RAIL_ITEMS = 6;

/**
 * Fashion — homepage best-sellers rail.
 * Reads the BEST_SELLERS-strategy section off the "home" storefront page —
 * same shared query as FeaturedProducts.tsx (see useStorefrontPage.ts), so
 * this doesn't issue a second network request.
 *
 * Note: the backend's BEST_SELLERS strategy currently only resolves a
 * single product per tenant (a real backend gap in the strategy engine,
 * not a frontend bug) — repeatToFill() cycles the real product(s) it does
 * return until the rail has MIN_RAIL_ITEMS, rather than showing a sparse
 * one-item row. Remove once the backend strategy resolves a full list.
 */
export function BestSellers() {
  const { data: page, isLoading, isError } = useStorefrontPage("home");
  const section = page?.sections.find((s) => s.strategy === "BEST_SELLERS");
  const displayProducts = section
    ? repeatToFill(section.products, MIN_RAIL_ITEMS)
    : [];

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2
        className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl"
        style={{
          color: "var(--brand-primary)",
          fontFamily: "var(--font-heading)",
        }}
      >
        Best Sellers
      </h2>

      {isLoading && (
        <div className="flex gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[340px] w-[240px] flex-none rounded-2xl"
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && displayProducts.length > 0 && (
        <div style={{ color: "var(--brand-primary)" }}>
          <HorizontalScroller>
            {displayProducts.map((product, i) => (
              <ProductCard
                key={`${product.id}-${i}`}
                product={toProductCardProduct(product)}
                compact
                className="w-[240px] flex-none"
              />
            ))}
          </HorizontalScroller>
        </div>
      )}
    </section>
  );
}

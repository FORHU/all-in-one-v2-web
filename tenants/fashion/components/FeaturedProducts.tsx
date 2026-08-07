"use client";

import Link from "next/link";
import { ProductCard } from "@/shared/components/ProductCard";
import { Skeleton } from "@/shared/components/Skeleton";
import { useStorefrontPage } from "@/features/storefront/hooks/queries/useStorefrontPage";
import { quickAddToCart } from "../utils/quickAddToCart";
import { toProductCardProduct } from "../utils/toProductCardProduct";
import { repeatToFill } from "../utils/repeatToFill";

const MIN_GRID_ITEMS = 8;

/**
 * Fashion — homepage featured-products section ("New Arrivals").
 * Fetches the "home" storefront page (GET /v2/storefront?slug=home) and
 * renders its NEW_ARRIVALS-strategy section — see
 * features/storefront/hooks/queries/useStorefrontPage.ts. BestSellers.tsx
 * reads a different section off the same page/query, so this request is
 * shared/cached between them rather than duplicated. repeatToFill() tops
 * the grid up to MIN_GRID_ITEMS by cycling real products if the strategy
 * resolves fewer than that.
 */
export function FeaturedProducts() {
  const { data: page, isLoading, isError } = useStorefrontPage("home");
  const section = page?.sections.find((s) => s.strategy === "NEW_ARRIVALS");
  const displayProducts = section
    ? repeatToFill(section.products, MIN_GRID_ITEMS)
    : [];

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

      {isLoading && (
        <div className="grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && !isError && displayProducts.length > 0 && (
        <div
          className="grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-4"
          style={{ color: "var(--brand-primary)" }}
        >
          {displayProducts.map((product, i) => (
            <ProductCard
              key={`${product.id}-${i}`}
              product={toProductCardProduct(product)}
              onQuickAdd={quickAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { ProductCard } from "@/shared/components/ProductCard";
import { fashionProducts } from "../data/products";
import { quickAddToCart } from "../utils/quickAddToCart";
import { useWishlistToggle } from "../utils/useWishlistToggle";

/**
 * Fashion — homepage featured-products section.
 * Static placeholder products (see tenants/fashion/data/products.ts) until
 * features/storefront's useProducts() is backed by a real API.
 */
export function FeaturedProducts() {
  const { isFavorite, toggleFavorite } = useWishlistToggle();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-baseline justify-between">
        <h2
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{
            color: "var(--brand-primary)",
            fontFamily: "var(--font-heading)",
          }}
        >
          New Arrivals
        </h2>
        <Link
          href="/products"
          className="text-sm font-semibold underline"
          style={{ color: "var(--brand-primary)" }}
        >
          View all
        </Link>
      </div>
      <div
        className="grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-4"
        style={{ color: "var(--brand-primary)" }}
      >
        {fashionProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickAdd={quickAddToCart}
            isFavorite={isFavorite(product.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}

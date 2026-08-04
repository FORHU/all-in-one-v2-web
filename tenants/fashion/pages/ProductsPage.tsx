"use client";

import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { ProductCard } from "@/shared/components/ProductCard";
import { fashionProducts } from "../data/products";
import { quickAddToCart } from "../utils/quickAddToCart";

/**
 * Fashion — full product listing page.
 * Same static data as components/FeaturedProducts.tsx (see
 * tenants/fashion/data/products.ts) until useProducts() is real. No
 * filtering/sorting yet — that needs product-search wired up.
 */
export function FashionProductsPage() {
  return (
    <FashionStorefrontLayout>
      <section
        className="mx-auto max-w-7xl px-6 py-16"
        style={{ color: "var(--brand-primary)" }}
      >
        <h1
          className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          All Products
        </h1>
        <div className="grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-4">
          {fashionProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickAdd={quickAddToCart}
            />
          ))}
        </div>
      </section>
    </FashionStorefrontLayout>
  );
}

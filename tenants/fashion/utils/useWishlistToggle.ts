"use client";

import { useWishlistStore } from "@/features/storefront/stores/wishlist.store";
import type { ProductCardProduct } from "@/shared/components/ProductCard";

/**
 * Adapts ProductCard's generic product shape to WishlistItem — shared by
 * every grid that renders ProductCard with wishlist support, so the field
 * mapping only exists once.
 */
export function useWishlistToggle() {
  const items = useWishlistStore((s) => s.items);
  const toggle = useWishlistStore((s) => s.toggle);

  const isFavorite = (productId: string) =>
    items.some((item) => item.productId === productId);

  const toggleFavorite = (product: ProductCardProduct) => {
    toggle({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      imageLabel: product.imageLabel,
      colors: product.colors,
      sizes: product.sizes,
    });
  };

  return { isFavorite, toggleFavorite };
}

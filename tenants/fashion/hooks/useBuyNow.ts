"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ProductCardProduct } from "@/shared/components/ProductCard";
import { useBuyNowStore } from "@/features/storefront/stores/buyNow.store";
import {
  makeLineId,
  type LocalCartItem,
} from "@/features/storefront/stores/localCart.store";

/**
 * Wires ProductCard's/QuickViewModal's "Buy Now" callback to the ephemeral
 * buy-now store and navigates straight to /checkout?mode=buy-now — sibling
 * to utils/quickAddToCart.ts, but for the single-item instant-checkout path
 * instead of adding to the shared cart. Never touches localCart.store.
 */
export function useBuyNow() {
  const router = useRouter();
  const setItem = useBuyNowStore((s) => s.setItem);

  return useCallback(
    (
      product: ProductCardProduct,
      selection?: {
        size?: string;
        color?: string;
        quantity?: number;
        stock?: number;
      },
    ) => {
      const item = {
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        imageLabel: product.imageLabel,
        imageUrl: product.imageUrl,
        size: selection?.size ?? product.sizes?.[0],
        color: selection?.color ?? product.colors?.[0],
        quantity: selection?.quantity ?? 1,
        stock: selection?.stock,
      };
      setItem({ ...item, id: makeLineId(item) });
      router.push("/checkout?mode=buy-now");
    },
    [router, setItem],
  );
}

/**
 * Per-line-item "Checkout" in CartContents.tsx — the item is already a
 * fully-formed LocalCartItem (real quantity/variant/price already chosen),
 * so this just hands it to the same buy-now store/route as useBuyNow()
 * above, skipping the ProductCardProduct→LocalCartItem mapping entirely.
 * Does not touch or remove the item from the shared cart.
 */
export function useBuyNowCartItem() {
  const router = useRouter();
  const setItem = useBuyNowStore((s) => s.setItem);

  return useCallback(
    (item: LocalCartItem) => {
      setItem(item);
      router.push("/checkout?mode=buy-now");
    },
    [router, setItem],
  );
}

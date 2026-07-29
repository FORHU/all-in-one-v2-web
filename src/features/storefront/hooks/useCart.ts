import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { getCart, addCartItem, removeCartItem } from "../api/cart.client";
import { cartKeys } from "../api/cart.keys";

/**
 * Reads and mutates the tenant-scoped active cart.
 * TODO: wire mutation `onSuccess` invalidation once useSafeMutation's
 * signature is finalized for this feature.
 */
export function useCart() {
  return useSafeQuery({
    queryKey: cartKeys.current(),
    queryFn: getCart,
  });
}

export function useAddCartItem() {
  return useSafeMutation({
    mutationFn: ({
      productVariantId,
      quantity,
    }: {
      productVariantId: string;
      quantity: number;
    }) => addCartItem(productVariantId, quantity),
  });
}

export function useRemoveCartItem() {
  return useSafeMutation({
    mutationFn: (productVariantId: string) => removeCartItem(productVariantId),
  });
}

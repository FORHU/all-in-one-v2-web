import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { getCart, addCartItem, removeCartItem } from "../api/cart.client";
import { cartKeys } from "../api/cart.keys";

/**
 * Reads and mutates the tenant-scoped active cart.
 * TODO: wire mutation `onSuccess` invalidation once useSafeMutation's
 * signature is finalized for this feature.
 *
 * suppressErrorToast: getCart() always throws until /v2/cart exists, and
 * this hook is called from the header on every page — without this the
 * global QueryCache handler (see shared/lib/providers/query-provider.tsx)
 * fires an "Unexpected error occurred" toast on every single page load.
 * Consumers (header badge, CartPage) already render their own
 * loading/empty/error states from isPending/isError.
 */
export function useCart() {
  return useSafeQuery({
    queryKey: cartKeys.current(),
    queryFn: getCart,
    meta: { suppressErrorToast: true },
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

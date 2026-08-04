import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { removeCartItem } from "@/features/storefront/api";

/**
 * Removes a product variant from the tenant-scoped active cart.
 * TODO: wire `onSuccess` invalidation of cartKeys.current() once
 * useSafeMutation's signature is finalized for this feature.
 */
export function useRemoveCartItem() {
  return useSafeMutation({
    mutationFn: (productVariantId: string) => removeCartItem(productVariantId),
  });
}

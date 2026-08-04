import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { addCartItem } from "@/features/storefront/api";

/**
 * Adds a product variant to the tenant-scoped active cart.
 * TODO: wire `onSuccess` invalidation of cartKeys.current() once
 * useSafeMutation's signature is finalized for this feature.
 */
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

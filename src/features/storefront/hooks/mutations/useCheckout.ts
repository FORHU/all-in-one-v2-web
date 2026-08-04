import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { createCheckoutSession } from "@/features/storefront/api";

/**
 * Initiates checkout for the given cart.
 */
export function useCheckout() {
  return useSafeMutation({
    mutationFn: (cartId: string) => createCheckoutSession(cartId),
  });
}

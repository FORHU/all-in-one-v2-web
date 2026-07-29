import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { createCheckoutSession } from "../api/checkout.client";

/**
 * Initiates checkout for the given cart.
 */
export function useCheckout() {
  return useSafeMutation({
    mutationFn: (cartId: string) => createCheckoutSession(cartId),
  });
}

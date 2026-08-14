import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  createPaymentIntent,
  type CreatePaymentIntentInput,
} from "@/features/storefront/api";

/**
 * Creates (or reuses — see the API's PaymentService.createPaymentIntent) a
 * Stripe PaymentIntent for an already-placed order.
 */
export function useCreatePaymentIntent(tenantSlug: string) {
  return useSafeMutation({
    mutationFn: (input: CreatePaymentIntentInput) =>
      createPaymentIntent(tenantSlug, input),
  });
}

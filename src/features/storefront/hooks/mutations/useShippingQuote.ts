import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { getShippingQuote } from "@/features/storefront/api";
import type { ShippingQuoteInput } from "@/features/storefront/contracts/shipping.contract";

/**
 * On-demand shipping quote — a mutation rather than a query because a real
 * quote depends on the destination the shopper just entered/saved, so it's
 * triggered explicitly (once an address exists) instead of cached by key.
 */
export function useShippingQuote(tenantSlug: string) {
  return useSafeMutation({
    mutationFn: (input: ShippingQuoteInput) =>
      getShippingQuote(tenantSlug, input),
  });
}

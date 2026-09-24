import { fetcher } from "@/shared/lib/http";
import {
  ShippingQuoteApiEnvelopeSchema,
  type ShippingQuoteInput,
  type ShippingQuoteResponse,
} from "../contracts/shipping.contract";

/**
 * Live shipping options + prices for a would-be cart, given a destination —
 * see the API's OrderService.getShippingQuote doc comment for how the quote
 * is produced (real CJ Dropshipping rates when every item is CJ-sourced, a
 * flat fallback otherwise). Public endpoint: no auth required, so shoppers
 * can see a real shipping fee before signing in to check out.
 *
 * The returned `quoteId` must be sent back with checkoutDirect (as
 * `shippingQuoteId` + `shippingLogisticName`) to actually charge the
 * selected price — the API never trusts a price from the client directly.
 */
export const getShippingQuote = async (
  tenantSlug: string,
  input: ShippingQuoteInput,
): Promise<ShippingQuoteResponse> => {
  const raw = await fetcher<unknown>("/api/v2/orders/shipping-quote", {
    method: "POST",
    headers: { "x-tenant-slug": tenantSlug },
    body: JSON.stringify(input),
  });
  return ShippingQuoteApiEnvelopeSchema.parse(raw).data;
};

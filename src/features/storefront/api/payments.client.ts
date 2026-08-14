import { fetcher } from "@/shared/lib/http";
import {
  CreatePaymentIntentApiEnvelopeSchema,
  type PaymentIntent,
} from "../contracts/payment.contract";

export interface CreatePaymentIntentInput {
  orderId: string;
  channel: "CARD" | "CASH_ON_DELIVERY";
}

/**
 * Storefront — Payments API client. Tenant-scoped via `x-tenant-slug`, same
 * convention as orders.client.ts. Signed-in or guest — order ownership is
 * verified server-side (auth token or x-session-id), not by this client.
 *
 * `gateway` is only sent for CARD — the API ignores/rejects defaulting a
 * gateway for CASH_ON_DELIVERY, since no online processor is involved (see
 * PaymentService.createPaymentIntent).
 */
export const createPaymentIntent = async (
  tenantSlug: string,
  input: CreatePaymentIntentInput,
): Promise<PaymentIntent> => {
  const raw = await fetcher<unknown>("/api/v2/payments/intents", {
    method: "POST",
    headers: { "x-tenant-slug": tenantSlug },
    body: JSON.stringify({
      orderId: input.orderId,
      channel: input.channel,
      ...(input.channel === "CARD" ? { gateway: "STRIPE" } : {}),
    }),
  });
  return CreatePaymentIntentApiEnvelopeSchema.parse(raw).data;
};

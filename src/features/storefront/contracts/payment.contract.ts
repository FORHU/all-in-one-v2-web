import { z } from "zod";

/**
 * FAOS — Storefront Payment Contracts.
 * Authoritative shape for POST /v2/payments/intents.
 */

export const PaymentStatusSchema = z.enum([
  "CREATED",
  "PENDING",
  "PROCESSING",
  "WAITING_CONFIRMATION",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "VOID",
  "EXPIRED",
]);

export const PaymentIntentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  status: PaymentStatusSchema,
  clientSecret: z.string().nullable(),
});

export const CreatePaymentIntentApiEnvelopeSchema = z.object({
  data: PaymentIntentSchema,
});

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;

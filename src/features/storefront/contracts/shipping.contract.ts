import { z } from "zod";

/**
 * FAOS v5 — Storefront Shipping Contracts.
 * Authoritative shape for POST /v2/orders/shipping-quote.
 */

export const ShippingOptionSchema = z.object({
  logisticName: z.string(),
  price: z.coerce.number(),
  aging: z.string().optional(),
});

export const ShippingQuoteResponseSchema = z.object({
  quoteId: z.string().nullable(),
  options: z.array(ShippingOptionSchema),
  source: z.enum(["cj-dropshipping", "fallback"]),
});

export const ShippingQuoteApiEnvelopeSchema = z.object({
  data: ShippingQuoteResponseSchema,
});

export const ShippingQuoteItemInputSchema = z.object({
  productId: z.string(),
  size: z.string().optional(),
  color: z.string().optional(),
  quantity: z.number().int().min(1),
});

export const ShippingQuoteInputSchema = z.object({
  items: z.array(ShippingQuoteItemInputSchema).min(1),
  countryCode: z.string().length(2),
  zip: z.string().optional(),
});

export type ShippingOption = z.infer<typeof ShippingOptionSchema>;
export type ShippingQuoteResponse = z.infer<typeof ShippingQuoteResponseSchema>;
export type ShippingQuoteItemInput = z.infer<
  typeof ShippingQuoteItemInputSchema
>;
export type ShippingQuoteInput = z.infer<typeof ShippingQuoteInputSchema>;

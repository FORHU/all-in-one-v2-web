import { z } from "zod";

/**
 * FAOS v5 — Storefront Checkout Contracts
 *
 * Authoritative shape for all checkout API responses.
 * Types are derived from schemas — never declared separately.
 */

export const CheckoutSessionSchema = z.object({
  id: z.string(),
  cartId: z.string(),
});

export type CheckoutSession = z.infer<typeof CheckoutSessionSchema>;

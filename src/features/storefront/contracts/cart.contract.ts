import { z } from "zod";

/**
 * FAOS v5 — Storefront Cart Contracts
 *
 * Authoritative shape for all cart API responses.
 * Types are derived from schemas — never declared separately.
 */

export const CartItemSchema = z.object({
  productVariantId: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
});

export const CartSchema = z.object({
  id: z.string(),
  items: z.array(CartItemSchema),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;

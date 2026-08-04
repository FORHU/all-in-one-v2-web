import { z } from "zod";

/**
 * FAOS v5 — Storefront Products Contracts
 *
 * Authoritative shape for all product API responses.
 * Types are derived from schemas — never declared separately.
 */

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
});

export const ProductsResponseSchema = z.array(ProductSchema);

export const ProductVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  title: z.string(),
  price: z.number(),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

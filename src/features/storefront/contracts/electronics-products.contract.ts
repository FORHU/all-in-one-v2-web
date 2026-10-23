import { z } from "zod";
import { ProductSchema } from "./products.contract";

/**
 * FAOS v5 — DigitFriend (electronics) product listing contract.
 *
 * GET /api/v2/electronics/products — one server-side page in the API's
 * standard envelope (`items, total, page, limit, totalPages`), plus the
 * sidebar's per-category counts. Items share the regular storefront
 * ProductSchema, so the same cards render them.
 */
export const ElectronicsCategoryCountSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  /** Products in this category and its subcategories, under the current price filter. */
  count: z.number(),
});

export const ElectronicsProductsPageSchema = z.object({
  items: z.array(ProductSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  categories: z.array(ElectronicsCategoryCountSchema),
  /** Every product under the current price filter, across all categories. */
  allCount: z.number(),
});

export const ElectronicsProductsApiEnvelopeSchema = z.object({
  data: ElectronicsProductsPageSchema,
});

export type ElectronicsCategoryCount = z.infer<
  typeof ElectronicsCategoryCountSchema
>;
export type ElectronicsProductsPage = z.infer<
  typeof ElectronicsProductsPageSchema
>;

import { z } from "zod";

/**
 * FAOS v5 — Storefront Page Contracts
 *
 * Authoritative shape for GET /v2/storefront?slug=... — a fully hydrated
 * page with its sections already resolved into product lists by the
 * backend's strategy engine (TRENDING, BEST_SELLERS, NEW_ARRIVALS,
 * COLLECTION, MANUAL, ...). See src/services/storefront/ in the API.
 */

const StorefrontSectionStrategySchema = z.enum([
  "MANUAL",
  "COLLECTION",
  "TRENDING",
  "BEST_SELLERS",
  "NEW_ARRIVALS",
  "FLASH_SALE",
  "FEATURED",
  "RECOMMENDED",
]);

export const StorefrontSectionVariantSchema = z.object({
  id: z.string(),
  price: z.coerce.number(),
  sku: z.string(),
});

export const StorefrontSectionProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  thumbnailUrl: z.string().nullable(),
  price: z.coerce.number(),
  compareAtPrice: z.coerce.number().nullable(),
  categoryId: z.string().nullable(),
  variants: z.array(StorefrontSectionVariantSchema),
});

export const StorefrontSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  strategy: StorefrontSectionStrategySchema,
  sortOrder: z.number(),
  maxItems: z.number(),
  products: z.array(StorefrontSectionProductSchema),
});

export const StorefrontPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  pageType: z.string(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  sections: z.array(StorefrontSectionSchema),
});

export const StorefrontPageEnvelopeSchema = z.object({
  data: StorefrontPageSchema,
});

export type StorefrontSectionStrategy = z.infer<
  typeof StorefrontSectionStrategySchema
>;
export type StorefrontSectionProduct = z.infer<
  typeof StorefrontSectionProductSchema
>;
export type StorefrontSection = z.infer<typeof StorefrontSectionSchema>;
export type StorefrontPage = z.infer<typeof StorefrontPageSchema>;

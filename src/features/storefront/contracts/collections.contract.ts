import { z } from "zod";

/**
 * FAOS v5 — Storefront Collections Contracts ("Shop the Look" outfits/lookbooks).
 *
 * Authoritative shape for all collection API responses.
 * Types are derived from schemas — never declared separately.
 *
 * Note: GET /v2/collections returns raw Prisma entities (no DTO/mapper layer
 * on the backend, unlike /v2/products), so Decimal fields like `price`
 * serialize as strings over the wire — z.coerce.number() handles that.
 */

export const CollectionProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  brand: z.string().nullable(),
  price: z.coerce.number().nullable(),
  thumbnailUrl: z.string().nullable(),
});

export const CollectionVariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  sku: z.string().nullable(),
});

export const CollectionItemSchema = z.object({
  id: z.string(),
  slot: z.string().nullable(),
  position: z.number(),
  isOptional: z.boolean(),
  product: CollectionProductSchema,
  productVariant: CollectionVariantSchema.nullable(),
});

export const CollectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  type: z.string(),
  imageUrl: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  items: z.array(CollectionItemSchema),
});

export const CollectionsResponseSchema = z.array(CollectionSchema);

export const CollectionsApiEnvelopeSchema = z.object({
  data: CollectionsResponseSchema,
});

export type CollectionProduct = z.infer<typeof CollectionProductSchema>;
export type CollectionItem = z.infer<typeof CollectionItemSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type CollectionsResponse = z.infer<typeof CollectionsResponseSchema>;

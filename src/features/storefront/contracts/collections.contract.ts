import { z } from "zod";

/**
 * FAOS v5 — Storefront Collections Contracts
 *
 * Authoritative shape for GET /v2/collections and /v2/collections/slug/:slug.
 * Prisma Decimal fields (price, compareAtPrice, ...) serialize as JSON
 * strings, hence z.coerce.number() rather than z.number() throughout.
 */

export const CollectionTypeSchema = z.enum([
  "OUTFIT",
  "LOOKBOOK",
  "BUNDLE",
  "ROUTINE",
  "SETUP",
  "ROOM_BUNDLE",
]);

export const CollectionItemProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  thumbnailUrl: z.string().nullable(),
});

export const CollectionItemVariantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  title: z.string(),
  price: z.coerce.number(),
  compareAtPrice: z.coerce.number().nullable(),
});

export const CollectionItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productVariantId: z.string().nullable(),
  slot: z.string().nullable(),
  position: z.number(),
  isOptional: z.boolean(),
  imageUrl: z.string().nullable(),
  product: CollectionItemProductSchema,
  productVariant: CollectionItemVariantSchema.nullable(),
});

export const CollectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  type: CollectionTypeSchema,
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  isPublic: z.boolean(),
  items: z.array(CollectionItemSchema),
});

/** Envelope shape returned by responseSuccess() — see src/helpers/response.helper.ts in the API. */
export const CollectionsEnvelopeSchema = z.object({
  data: z.array(CollectionSchema),
});

export const CollectionEnvelopeSchema = z.object({
  data: CollectionSchema,
});

export type CollectionType = z.infer<typeof CollectionTypeSchema>;
export type CollectionItem = z.infer<typeof CollectionItemSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type CollectionsResponse = Collection[];

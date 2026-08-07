import { z } from "zod";

/**
 * FAOS v5 — Category Detail Contract
 *
 * Authoritative shape for GET /v2/categories/:slug — the category record
 * plus up to 20 of its products (see CategoryRepository.findBySlug in the
 * API, which already eager-loads media + variants). Prisma Decimal fields
 * serialize as JSON strings, hence z.coerce.number().
 */

export const CategoryProductVariantSchema = z.object({
  id: z.string(),
  sku: z.string().nullable(),
  title: z.string(),
  price: z.coerce.number(),
});

export const CategoryProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  thumbnailUrl: z.string().nullable(),
  price: z.coerce.number().nullable(),
  compareAtPrice: z.coerce.number().nullable(),
  createdAt: z.string(),
  variants: z.array(CategoryProductVariantSchema),
});

export const CategoryDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  products: z.array(CategoryProductSchema),
});

export const CategoryDetailEnvelopeSchema = z.object({
  data: CategoryDetailSchema,
});

export type CategoryProductVariant = z.infer<
  typeof CategoryProductVariantSchema
>;
export type CategoryProduct = z.infer<typeof CategoryProductSchema>;
export type CategoryDetail = z.infer<typeof CategoryDetailSchema>;

import { z } from "zod";

/**
 * FAOS v5 — Storefront Categories Contracts
 *
 * Authoritative shape for all category API responses.
 * Types are derived from schemas — never declared separately.
 */

export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});

export const CategoriesEnvelopeSchema = z.object({
  data: z.array(CategorySchema),
});

export type Category = z.infer<typeof CategorySchema>;
export type CategoriesResponse = Category[];

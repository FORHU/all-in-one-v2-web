import { z } from "zod";

/**
 * FAOS v5 — Admin Catalog Contracts
 * Authoritative shape for admin-catalog API responses.
 * TODO: align with all-in-one-v2-api's Product/ProductVariant/PricingRule models.
 */

export const AdminProductSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  title: z.string(),
  status: z.enum(["DRAFT", "READY", "PUBLISHED", "ARCHIVED"]),
});

export const AdminProductsResponseSchema = z.array(AdminProductSchema);

export type AdminProduct = z.infer<typeof AdminProductSchema>;
export type AdminProductsResponse = z.infer<typeof AdminProductsResponseSchema>;

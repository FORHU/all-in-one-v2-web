import { z } from "zod";

/**
 * FAOS v5 — Storefront Products Contracts
 *
 * Authoritative shape for all product API responses.
 * Types are derived from schemas — never declared separately.
 */

export const ProductAttributeOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  swatchColor: z.string().nullable().optional(),
});

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  brand: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  price: z.number().nullable(),
  salePrice: z.number().nullable(),
  compareAtPrice: z.number().nullable(),
  rating: z.number(),
  reviewCount: z.number(),
  colors: z.array(ProductAttributeOptionSchema),
  sizes: z.array(ProductAttributeOptionSchema),
  inStock: z.boolean(),
  categoryId: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export const ProductFacetsSchema = z.object({
  priceMin: z.number().nullable(),
  priceMax: z.number().nullable(),
  brands: z.array(z.string()),
  colors: z.array(ProductAttributeOptionSchema),
  sizes: z.array(ProductAttributeOptionSchema),
});

export const ProductsListResponseSchema = z.object({
  items: z.array(ProductSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  facets: ProductFacetsSchema,
});

/** Backend envelope wrapper — see response.helper.ts's `{ status, statusCode, data }`. */
export const ProductsListApiEnvelopeSchema = z.object({
  data: ProductsListResponseSchema,
});

export const ProductVariantStockSchema = z.object({
  color: z.string().nullable(),
  size: z.string().nullable(),
  stock: z.number(),
});

export const ProductDetailSchema = ProductSchema.extend({
  description: z.string().nullable(),
  images: z.array(z.string()),
  categorySlug: z.string().nullable(),
  categoryName: z.string().nullable(),
  variants: z.array(ProductVariantStockSchema),
});

export const ProductDetailApiEnvelopeSchema = z.object({
  data: ProductDetailSchema,
});

export const ProductVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  title: z.string(),
  price: z.number(),
});

export type ProductAttributeOption = z.infer<
  typeof ProductAttributeOptionSchema
>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductDetail = z.infer<typeof ProductDetailSchema>;
export type ProductFacets = z.infer<typeof ProductFacetsSchema>;
export type ProductsListResponse = z.infer<typeof ProductsListResponseSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

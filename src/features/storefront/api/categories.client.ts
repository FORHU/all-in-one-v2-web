import { fetcher } from "@/shared/lib/http";
import {
  CategoriesApiEnvelopeSchema,
  type CategoriesResponse,
} from "../contracts/categories.contract";

/**
 * Storefront — Categories API client.
 * Tenant-scoped via the `x-tenant-slug` header, same convention as
 * products.client.ts. GET /v2/categories returns only root categories
 * (children nested but not modeled here — no current caller needs the
 * tree) and no per-category product count; callers needing a count use
 * products.client.ts's getProducts({ categorySlug, limit: 1 }) and read
 * `.total`, the same pattern pages/CategoryDetailPage.tsx already uses.
 */
export const getCategories = async (
  tenantSlug: string,
): Promise<CategoriesResponse> => {
  const raw = await fetcher<unknown>("/api/v2/categories", {
    headers: { "x-tenant-slug": tenantSlug },
  });
  return CategoriesApiEnvelopeSchema.parse(raw).data;
};

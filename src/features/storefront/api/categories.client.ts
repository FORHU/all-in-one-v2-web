import { fetcher } from "@/shared/lib/http";
import {
  CategoriesEnvelopeSchema,
  type CategoriesResponse,
} from "../contracts/categories.contract";
import {
  CategoryDetailEnvelopeSchema,
  type CategoryDetail,
} from "../contracts/category-detail.contract";

/**
 * Storefront — Categories API client.
 * Requests are scoped to the active tenant via the x-tenant-slug header,
 * attached automatically by shared/lib/http.ts's fetcher.
 */
export const getCategories = async (): Promise<CategoriesResponse> => {
  const raw = await fetcher<unknown>("/api/v2/categories");
  return CategoriesEnvelopeSchema.parse(raw).data;
};

/**
 * A single category with its products (CategoryRepository.findBySlug in
 * the API already eager-loads up to 20 products with media + variants —
 * no separate product-browse endpoint exists, or is needed here).
 */
export const getCategoryBySlug = async (
  slug: string,
): Promise<CategoryDetail> => {
  const raw = await fetcher<unknown>(`/api/v2/categories/${slug}`);
  return CategoryDetailEnvelopeSchema.parse(raw).data;
};

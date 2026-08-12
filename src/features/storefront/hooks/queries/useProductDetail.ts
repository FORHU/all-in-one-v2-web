import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getProductBySlug, productsKeys } from "@/features/storefront/api";

/**
 * Fetches a single product's full detail (description, real gallery
 * images, category name) by slug — distinct from useProducts' listing
 * shape (single thumbnailUrl, no description). Resolves to `null` (not an
 * error) when the product doesn't exist, so callers can render a proper
 * "not found" state.
 */
export function useProductDetail(tenantSlug: string, slug: string) {
  return useSafeQuery({
    queryKey: productsKeys.detail(tenantSlug, slug),
    queryFn: () => getProductBySlug(tenantSlug, slug),
  });
}

import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getProductBySlug, productsKeys } from "@/features/storefront/api";

/**
 * Fetches a single tenant-scoped product by slug.
 */
export function useProduct(slug: string) {
  return useSafeQuery({
    queryKey: productsKeys.detail(slug),
    queryFn: () => getProductBySlug(slug),
  });
}

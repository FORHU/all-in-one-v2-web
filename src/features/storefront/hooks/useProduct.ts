import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getProductBySlug } from "../api/products.client";
import { productsKeys } from "../api/products.keys";

/**
 * Fetches a single tenant-scoped product by slug.
 */
export function useProduct(slug: string) {
  return useSafeQuery({
    queryKey: productsKeys.detail(slug),
    queryFn: () => getProductBySlug(slug),
  });
}

import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getProducts, productsKeys } from "@/features/storefront/api";

/**
 * Fetches the tenant-scoped product listing.
 * TODO: accept filter/pagination params once product-search is wired up.
 */
export function useProducts() {
  return useSafeQuery({
    queryKey: productsKeys.list(),
    queryFn: getProducts,
  });
}

import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getProducts } from "../api/products.client";
import { productsKeys } from "../api/products.keys";

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

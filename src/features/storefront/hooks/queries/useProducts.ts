import { keepPreviousData } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import {
  getProducts,
  productsKeys,
  type ProductListingParams,
} from "@/features/storefront/api";

/**
 * Fetches the tenant-scoped, filtered/sorted/paginated product listing.
 * Different filter/sort/page combinations cache separately since they're
 * baked into the query key. Keeps the previous page's data visible while a
 * new filter/sort/page combination loads, instead of flashing back to a
 * loading state on every change.
 */
export function useProducts(
  tenantSlug: string,
  params: ProductListingParams,
  enabled = true,
) {
  return useSafeQuery({
    queryKey: productsKeys.list(tenantSlug, params),
    queryFn: () => getProducts(tenantSlug, params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

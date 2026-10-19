import { keepPreviousData } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import {
  getElectronicsProducts,
  electronicsProductsKeys,
  type ElectronicsProductsParams,
} from "@/features/storefront/api";

/**
 * One server-side page of DigitFriend products. Every page/filter/sort
 * combination caches separately (it's in the query key); the previous page
 * stays on screen while the next one loads instead of flashing a skeleton.
 */
export function useElectronicsProducts(
  tenantSlug: string,
  params: ElectronicsProductsParams,
) {
  return useSafeQuery({
    queryKey: electronicsProductsKeys.page(tenantSlug, params),
    queryFn: () => getElectronicsProducts(tenantSlug, params),
    placeholderData: keepPreviousData,
  });
}

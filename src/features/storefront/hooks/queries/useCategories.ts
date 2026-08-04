import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getCategories, categoriesKeys } from "@/features/storefront/api";

/**
 * Fetches the tenant-scoped category tree.
 */
export function useCategories() {
  return useSafeQuery({
    queryKey: categoriesKeys.list(),
    queryFn: getCategories,
  });
}

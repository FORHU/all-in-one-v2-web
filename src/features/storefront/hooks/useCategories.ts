import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getCategories } from "../api/categories.client";
import { categoriesKeys } from "../api/categories.keys";

/**
 * Fetches the tenant-scoped category tree.
 */
export function useCategories() {
  return useSafeQuery({
    queryKey: categoriesKeys.list(),
    queryFn: getCategories,
  });
}

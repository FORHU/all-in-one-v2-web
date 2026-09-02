import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getCategories, categoriesKeys } from "@/features/storefront/api";

/**
 * Fetches the tenant's root category list (GET /v2/categories).
 */
export function useCategories(tenantSlug: string, enabled = true) {
  return useSafeQuery({
    queryKey: categoriesKeys.list(tenantSlug),
    queryFn: () => getCategories(tenantSlug),
    enabled,
  });
}

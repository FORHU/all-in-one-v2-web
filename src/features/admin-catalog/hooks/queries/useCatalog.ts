import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getAdminProducts, catalogKeys } from "@/features/admin-catalog/api";

/**
 * Fetches the admin product catalog (cross-tenant, filterable by tenantId).
 */
export function useCatalog() {
  return useSafeQuery({
    queryKey: catalogKeys.list(),
    queryFn: getAdminProducts,
  });
}

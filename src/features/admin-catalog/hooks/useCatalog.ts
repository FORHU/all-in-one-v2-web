import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getAdminProducts } from "../api/catalog.client";
import { catalogKeys } from "../api/catalog.keys";

/**
 * Fetches the admin product catalog (cross-tenant, filterable by tenantId).
 */
export function useCatalog() {
  return useSafeQuery({
    queryKey: catalogKeys.list(),
    queryFn: getAdminProducts,
  });
}

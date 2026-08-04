import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getAdminOrders, ordersKeys } from "@/features/admin-orders/api";

/**
 * Fetches the admin order/fulfillment listing (cross-tenant, filterable by tenantId).
 */
export function useOrders() {
  return useSafeQuery({
    queryKey: ordersKeys.list(),
    queryFn: getAdminOrders,
  });
}

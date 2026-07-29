import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getAdminOrders } from "../api/orders.client";
import { ordersKeys } from "../api/orders.keys";

/**
 * Fetches the admin order/fulfillment listing (cross-tenant, filterable by tenantId).
 */
export function useOrders() {
  return useSafeQuery({
    queryKey: ordersKeys.list(),
    queryFn: getAdminOrders,
  });
}

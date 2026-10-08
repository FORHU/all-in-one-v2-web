import { useSafeQuery } from "@/shared/query/useSafeQuery";
import {
  getMyReturnRequests,
  orderRequestsKeys,
} from "@/features/storefront/api";

/**
 * The signed-in customer's own refund/replacement/return requests —
 * lightweight (status + type only). Backs AccountPage's per-order status
 * pill/action, same `enabled`-gated pattern as useMyOrders.ts (an expired
 * token firing this feeds the "Session expired" toast-spam loop otherwise).
 */
export function useMyReturnRequests(tenantSlug: string, enabled = true) {
  return useSafeQuery({
    queryKey: orderRequestsKeys.mine(tenantSlug),
    queryFn: () => getMyReturnRequests(tenantSlug),
    enabled,
  });
}

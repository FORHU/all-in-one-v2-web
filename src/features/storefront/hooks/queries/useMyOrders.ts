import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getMyOrders, ordersKeys } from "@/features/storefront/api";

/**
 * Fetches the signed-in customer's real order history. Backs
 * pages/AccountPage.tsx's Orders section and Dashboard "Recent Orders".
 *
 * `enabled` must be driven by the caller's own auth-token check, same
 * reasoning as useLatestAddress.ts — without it, an expired token still
 * fires this query and feeds the "Session expired" toast-spam loop via
 * AuthListener's queryClient.clear().
 */
export function useMyOrders(
  tenantSlug: string,
  params?: { page?: number; limit?: number },
  enabled = true,
) {
  return useSafeQuery({
    queryKey: ordersKeys.myOrders(tenantSlug, params),
    queryFn: () => getMyOrders(tenantSlug, params),
    enabled,
  });
}

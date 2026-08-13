import { useSafeQuery } from "@/shared/query/useSafeQuery";
import {
  getMyNotifications,
  notificationsKeys,
} from "@/features/storefront/api";

/**
 * Fetches the signed-in customer's real notifications. Backs
 * pages/AccountPage.tsx's Notifications tab.
 *
 * `enabled` must be driven by the caller's own auth-token check, same
 * reasoning as useLatestAddress.ts / useMyOrders.ts — without it, a
 * stale/expired token feeds the "Session expired" toast-spam loop.
 */
export function useNotifications(tenantSlug: string, enabled = true) {
  return useSafeQuery({
    queryKey: notificationsKeys.my(tenantSlug),
    queryFn: () => getMyNotifications(tenantSlug),
    enabled,
  });
}

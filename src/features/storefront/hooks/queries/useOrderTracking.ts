import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getOrderTracking, ordersKeys } from "@/features/storefront/api";

/**
 * Live CJ Dropshipping courier status for a single order. Backs
 * components/OrderTrackingModal.tsx — only fires while that modal has an
 * order selected (see `enabled`), same on-demand pattern as
 * useLatestAddress.ts rather than always-on polling.
 */
export function useOrderTracking(
  tenantSlug: string,
  orderId: string | undefined,
  enabled = true,
) {
  return useSafeQuery({
    queryKey: ordersKeys.tracking(tenantSlug, orderId ?? ""),
    queryFn: () => getOrderTracking(tenantSlug, orderId as string),
    enabled: enabled && !!orderId,
  });
}

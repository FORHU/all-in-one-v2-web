import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getLatestAddress, addressKeys } from "@/features/storefront/api";

/**
 * Fetches the signed-in customer's most recently saved shipping address —
 * resolves to `null` (not an error) on a first-time checkout, when they
 * haven't saved one yet. Backs pages/CheckoutPage.tsx's address card, so a
 * returning customer's checkout is pre-filled instead of asking again.
 *
 * `enabled` must be driven by the caller's own auth-token check (see
 * CheckoutPage.tsx). Without it, an expired token still fires this query,
 * gets a 401, and the global unauthorized handler's `queryClient.clear()`
 * immediately refetches the still-mounted, still-unguarded query — a loop
 * that re-401s and re-toasts "Session expired" repeatedly until the page
 * finally navigates away.
 */
export function useLatestAddress(tenantSlug: string, enabled = true) {
  return useSafeQuery({
    queryKey: addressKeys.latest(tenantSlug),
    queryFn: () => getLatestAddress(tenantSlug),
    enabled,
  });
}

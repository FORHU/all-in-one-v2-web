import { useSafeQuery } from "@/shared/query/useSafeQuery";
import {
  getMyReturnRequestDetail,
  orderRequestsKeys,
} from "@/features/storefront/api";

/**
 * Full, customer-safe detail for one of the signed-in customer's own
 * requests — backs the "View Request Status" button/modal on AccountPage.
 * Only fires once a request is actually selected (`enabled`), same
 * on-demand pattern as useOrderTracking.ts.
 */
export function useMyReturnRequestDetail(
  tenantSlug: string,
  returnId: string | undefined,
  enabled = true,
) {
  return useSafeQuery({
    queryKey: orderRequestsKeys.detail(tenantSlug, returnId ?? ""),
    queryFn: () => getMyReturnRequestDetail(tenantSlug, returnId as string),
    enabled: enabled && !!returnId,
  });
}

import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  createReturnRequest,
  orderRequestsKeys,
} from "@/features/storefront/api";
import type { CreateReturnRequestInput } from "@/features/storefront/contracts/order-request.contract";

/**
 * Submits a refund/replacement/return request for one of the signed-in
 * customer's delivered orders. Backs components/RequestRefundModal.tsx.
 * Invalidates order-requests so AccountPage's per-order status pill (once
 * wired) reflects the new PENDING request immediately.
 */
export function useCreateReturnRequest(tenantSlug: string) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: CreateReturnRequestInput) =>
      createReturnRequest(tenantSlug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderRequestsKeys.all });
    },
  });
}

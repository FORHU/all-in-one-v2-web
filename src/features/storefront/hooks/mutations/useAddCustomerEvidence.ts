import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  addCustomerEvidence,
  orderRequestsKeys,
} from "@/features/storefront/api";

/**
 * Resubmits evidence after an admin's "request more evidence" — the
 * customer-facing half of that admin action, backing
 * components/AddEvidenceModal.tsx. Invalidates the "my requests" list so
 * AccountPage's status pill reflects UNDER_REVIEW immediately.
 */
export function useAddCustomerEvidence(tenantSlug: string) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: ({
      returnId,
      evidence,
    }: {
      returnId: string;
      evidence: { url: string; mimeType?: string }[];
    }) => addCustomerEvidence(tenantSlug, returnId, evidence),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orderRequestsKeys.mine(tenantSlug),
      });
    },
  });
}

import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { uploadReturnEvidence } from "@/features/storefront/api";

/**
 * Uploads a single evidence photo/video for an in-progress refund request
 * draft. Backs components/RequestRefundModal.tsx, called once per file as
 * the customer picks them (not batched) so a per-file failure doesn't lose
 * the others already uploaded.
 */
export function useUploadReturnEvidence(tenantSlug: string) {
  return useSafeMutation({
    mutationFn: (file: File) => uploadReturnEvidence(tenantSlug, file),
  });
}

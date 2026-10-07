import { fetcher } from "@/shared/lib/http";
import {
  ReturnRequestApiEnvelopeSchema,
  EvidenceUploadApiEnvelopeSchema,
  MyReturnRequestsApiEnvelopeSchema,
  AddEvidenceApiEnvelopeSchema,
  MyReturnRequestDetailApiEnvelopeSchema,
  type CreateReturnRequestInput,
  type ReturnRequest,
  type EvidenceUploadResponse,
  type MyReturnRequest,
  type MyReturnRequestDetail,
} from "../contracts/order-request.contract";

/**
 * Storefront — refund/replacement/return request API. Tenant-scoped via
 * `x-tenant-slug`, same convention as orders.client.ts; both endpoints are
 * signed-in-only (POST /v2/returns/my, /v2/returns/evidence-upload).
 */
export const createReturnRequest = async (
  tenantSlug: string,
  input: CreateReturnRequestInput,
): Promise<ReturnRequest> => {
  const raw = await fetcher<unknown>("/api/v2/returns/my", {
    method: "POST",
    headers: { "x-tenant-slug": tenantSlug },
    body: JSON.stringify(input),
  });
  return ReturnRequestApiEnvelopeSchema.parse(raw).data;
};

/**
 * Uploads one evidence photo/video, returning its stored URL — the caller
 * collects these URLs and passes them as `evidence` to createReturnRequest.
 * Sends a `FormData` body; see http.ts's fetcher for why it must NOT set a
 * manual Content-Type on this call.
 */
export const uploadReturnEvidence = async (
  tenantSlug: string,
  file: File,
): Promise<EvidenceUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const raw = await fetcher<unknown>("/api/v2/returns/evidence-upload", {
    method: "POST",
    headers: { "x-tenant-slug": tenantSlug },
    body: formData,
  });
  return EvidenceUploadApiEnvelopeSchema.parse(raw).data;
};

/** GET /v2/returns/my — the signed-in customer's own requests, used to show a status pill per order. */
export const getMyReturnRequests = async (
  tenantSlug: string,
): Promise<MyReturnRequest[]> => {
  const raw = await fetcher<unknown>("/api/v2/returns/my", {
    headers: { "x-tenant-slug": tenantSlug },
  });
  return MyReturnRequestsApiEnvelopeSchema.parse(raw).data;
};

/**
 * POST /v2/returns/my/:id/evidence — resubmits evidence after an admin's
 * "request more evidence". Moves EVIDENCE_REQUIRED back to UNDER_REVIEW
 * server-side.
 */
export const addCustomerEvidence = async (
  tenantSlug: string,
  returnId: string,
  evidence: { url: string; mimeType?: string }[],
) => {
  const raw = await fetcher<unknown>(
    `/api/v2/returns/my/${returnId}/evidence`,
    {
      method: "POST",
      headers: { "x-tenant-slug": tenantSlug },
      body: JSON.stringify({ evidence }),
    },
  );
  return AddEvidenceApiEnvelopeSchema.parse(raw).data;
};

/** GET /v2/returns/my/:id — full, customer-safe detail behind "View Request Status". */
export const getMyReturnRequestDetail = async (
  tenantSlug: string,
  returnId: string,
): Promise<MyReturnRequestDetail> => {
  const raw = await fetcher<unknown>(`/api/v2/returns/my/${returnId}`, {
    headers: { "x-tenant-slug": tenantSlug },
  });
  return MyReturnRequestDetailApiEnvelopeSchema.parse(raw).data;
};

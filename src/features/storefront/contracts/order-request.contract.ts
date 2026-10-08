import { z } from "zod";

/**
 * FAOS — Storefront refund/replacement/return request contracts.
 * Authoritative shape for POST /v2/returns/my and POST /v2/returns/evidence-upload.
 * Mirrors the API's Return/ReturnItem/ReturnEvidence models — see the API's
 * return.service.ts::createReturnRequest doc comment for the full flow.
 */

export const ReturnRequestTypeSchema = z.enum([
  "REFUND",
  "REPLACEMENT",
  "RETURN",
]);

/** Only meaningful when requestType = RETURN. */
export const ReturnPreferredResolutionSchema = z.enum([
  "REFUND",
  "REPLACEMENT",
]);

/**
 * The full backend lifecycle — the customer app only ever displays these, it
 * never transitions them itself (every transition past PENDING is an admin
 * or CJ-driven action).
 */
export const ReturnRequestStatusSchema = z.enum([
  "PENDING",
  "UNDER_REVIEW",
  "EVIDENCE_REQUIRED",
  "APPROVED",
  "REJECTED",
  "CJ_DISPUTE_SUBMITTED",
  "CJ_DISPUTE_UNDER_REVIEW",
  "CJ_APPROVED",
  "CJ_REJECTED",
  "REFUND_PROCESSING",
  "REPLACEMENT_PROCESSING",
  "RETURN_PROCESSING",
  "COMPLETED",
  "CANCELLED",
]);

export const ReturnRequestItemSchema = z.object({
  id: z.string(),
  orderItemId: z.string(),
  quantity: z.number(),
  unitPriceSnapshot: z.coerce.number(),
});

export const ReturnRequestEvidenceSchema = z.object({
  id: z.string(),
  url: z.string(),
  mimeType: z.string().nullable(),
});

export const ReturnRequestSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  status: ReturnRequestStatusSchema,
  requestType: ReturnRequestTypeSchema,
  reason: z.string(),
  description: z.string().nullable(),
  preferredResolution: ReturnPreferredResolutionSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  items: z.array(ReturnRequestItemSchema),
  evidence: z.array(ReturnRequestEvidenceSchema),
});

export const ReturnRequestApiEnvelopeSchema = z.object({
  data: ReturnRequestSchema,
});

export const CreateReturnRequestItemInputSchema = z.object({
  orderItemId: z.string(),
  quantity: z.number().int().min(1),
});

export const CreateReturnRequestInputSchema = z.object({
  orderId: z.string(),
  items: z.array(CreateReturnRequestItemInputSchema).min(1),
  requestType: ReturnRequestTypeSchema,
  reason: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  preferredResolution: ReturnPreferredResolutionSchema.optional(),
  evidence: z
    .array(z.object({ url: z.string(), mimeType: z.string().optional() }))
    .optional(),
});

export const EvidenceUploadResponseSchema = z.object({
  url: z.string(),
  mimetype: z.string(),
  size: z.number(),
});

export const EvidenceUploadApiEnvelopeSchema = z.object({
  data: EvidenceUploadResponseSchema,
});

/**
 * GET /v2/returns/my — lightweight list, just enough to show a status pill
 * per order on AccountPage. Matches ReturnRepository.findByCustomerId's
 * select exactly (no items/evidence/etc. — use GET /v2/returns/:id/detail,
 * admin-only today, for the full shape).
 */
export const MyReturnRequestSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  status: ReturnRequestStatusSchema,
  requestType: ReturnRequestTypeSchema,
  createdAt: z.coerce.date(),
});

export const MyReturnRequestsApiEnvelopeSchema = z.object({
  data: z.array(MyReturnRequestSchema),
});

/** POST /v2/returns/my/:id/evidence response — same plain Return-row shape the create/transition endpoints return. */
export const AddEvidenceResponseSchema = z.object({
  id: z.string(),
  status: ReturnRequestStatusSchema,
  updatedAt: z.coerce.date(),
});

export const AddEvidenceApiEnvelopeSchema = z.object({
  data: AddEvidenceResponseSchema,
});

/**
 * GET /v2/returns/my/:id — full, customer-safe detail behind "View Request
 * Status". Matches ReturnRepository.findByIdForCustomer's include exactly
 * (items + evidence only — no disputes/financials/physical-shipment, that's
 * internal bookkeeping the customer doesn't see). `notes` is what actually
 * carries an admin's message, e.g. what to re-upload when EVIDENCE_REQUIRED.
 */
export const MyReturnRequestDetailItemSchema = z.object({
  id: z.string(),
  orderItemId: z.string(),
  quantity: z.number(),
  unitPriceSnapshot: z.coerce.number(),
  orderItem: z.object({
    productTitle: z.string(),
    variantTitle: z.string().nullable(),
    sku: z.string().nullable(),
    imageUrl: z.string().nullable(),
  }),
});

export const MyReturnRequestDetailEvidenceSchema = z.object({
  id: z.string(),
  url: z.string(),
  mimeType: z.string().nullable(),
  uploadedByRole: z.enum(["CUSTOMER", "ADMIN"]),
  createdAt: z.coerce.date(),
});

export const MyReturnRequestDetailSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  status: ReturnRequestStatusSchema,
  requestType: ReturnRequestTypeSchema,
  reason: z.string(),
  description: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  items: z.array(MyReturnRequestDetailItemSchema),
  evidence: z.array(MyReturnRequestDetailEvidenceSchema),
});

export const MyReturnRequestDetailApiEnvelopeSchema = z.object({
  data: MyReturnRequestDetailSchema,
});

export type ReturnRequestType = z.infer<typeof ReturnRequestTypeSchema>;
export type ReturnPreferredResolution = z.infer<
  typeof ReturnPreferredResolutionSchema
>;
export type ReturnRequestStatus = z.infer<typeof ReturnRequestStatusSchema>;
export type ReturnRequestItem = z.infer<typeof ReturnRequestItemSchema>;
export type ReturnRequestEvidence = z.infer<typeof ReturnRequestEvidenceSchema>;
export type ReturnRequest = z.infer<typeof ReturnRequestSchema>;
export type CreateReturnRequestInput = z.infer<
  typeof CreateReturnRequestInputSchema
>;
export type EvidenceUploadResponse = z.infer<
  typeof EvidenceUploadResponseSchema
>;
export type MyReturnRequest = z.infer<typeof MyReturnRequestSchema>;
export type MyReturnRequestDetail = z.infer<typeof MyReturnRequestDetailSchema>;

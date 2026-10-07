"use client";

import { useEffect, useState } from "react";
import { X, Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMyReturnRequestDetail } from "@/features/storefront/hooks/queries/useMyReturnRequestDetail";
import { useAddCustomerEvidence } from "@/features/storefront/hooks/mutations/useAddCustomerEvidence";
import { useUploadReturnEvidence } from "@/features/storefront/hooks/mutations/useUploadReturnEvidence";

// Plain labels for the customer-facing lifecycle — a shorter vocabulary
// than the full admin status set, same reasoning as AccountPage's own
// REQUEST_STATUS_LABELS it replaces (kept here instead, now that this modal
// is the only place a customer sees a request's status spelled out).
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending review",
  UNDER_REVIEW: "Under review",
  EVIDENCE_REQUIRED: "Evidence needed",
  APPROVED: "Approved",
  REJECTED: "Declined",
  CJ_DISPUTE_SUBMITTED: "With our supplier",
  CJ_DISPUTE_UNDER_REVIEW: "With our supplier",
  CJ_APPROVED: "Approved",
  CJ_REJECTED: "Under review",
  REFUND_PROCESSING: "Refund processing",
  REPLACEMENT_PROCESSING: "Replacement processing",
  RETURN_PROCESSING: "Return processing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const REQUEST_TYPE_LABELS: Record<string, string> = {
  REFUND: "Refund",
  REPLACEMENT: "Replacement",
  RETURN: "Return",
};

type EvidenceItem = {
  file: File;
  url?: string;
  mimeType?: string;
  uploading: boolean;
  error?: string;
};

/**
 * "View Request Status" — the single place a customer sees everything about
 * one refund/replacement/return request: its items, current status, the
 * reason/description they originally gave, any message an admin left (e.g.
 * what to re-upload), their evidence so far, and — only when the status is
 * EVIDENCE_REQUIRED — an inline upload section to respond right there,
 * instead of a separate modal for that one case.
 */
export function RequestStatusModal({
  requestId,
  tenantSlug,
  onClose,
}: {
  requestId: string | null;
  tenantSlug: string;
  onClose: () => void;
}) {
  const { data: detail, isLoading } = useMyReturnRequestDetail(
    tenantSlug,
    requestId ?? undefined,
    !!requestId,
  );

  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const { mutateAsync: uploadEvidence } = useUploadReturnEvidence(tenantSlug);
  const { mutate: submitEvidence, isPending: isSubmitting } =
    useAddCustomerEvidence(tenantSlug);

  useEffect(() => {
    setEvidenceItems([]);
  }, [requestId]);

  useEffect(() => {
    if (!requestId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [requestId, onClose]);

  if (!requestId) return null;

  const handleFilesPicked = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: EvidenceItem[] = Array.from(files).map((file) => ({
      file,
      uploading: true,
    }));
    setEvidenceItems((prev) => [...prev, ...newItems]);

    for (const item of newItems) {
      try {
        const result = await uploadEvidence(item.file);
        setEvidenceItems((prev) =>
          prev.map((e) =>
            e.file === item.file
              ? {
                  ...e,
                  url: result.url,
                  mimeType: result.mimetype,
                  uploading: false,
                }
              : e,
          ),
        );
      } catch {
        setEvidenceItems((prev) =>
          prev.map((e) =>
            e.file === item.file
              ? { ...e, uploading: false, error: "Upload failed — try again" }
              : e,
          ),
        );
      }
    }
  };

  const removeEvidence = (file: File) => {
    setEvidenceItems((prev) => prev.filter((e) => e.file !== file));
  };

  const uploaded = evidenceItems.filter((e) => e.url);
  const isUploading = evidenceItems.some((e) => e.uploading);
  const hasError = evidenceItems.some((e) => e.error);
  const canSubmit =
    uploaded.length > 0 && !isUploading && !hasError && !isSubmitting;

  const handleSubmit = () => {
    if (!canSubmit || !requestId) return;
    submitEvidence(
      {
        returnId: requestId,
        evidence: uploaded.map((e) => ({
          url: e.url as string,
          mimeType: e.mimeType,
        })),
      },
      {
        onSuccess: () => {
          toast.success(
            "Evidence submitted — your request is back under review.",
          );
          onClose();
        },
      },
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Request status"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-2xl p-6 sm:p-8"
        style={{
          backgroundColor: "var(--brand-secondary)",
          color: "var(--brand-primary)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-current/5"
        >
          <X className="h-4 w-4" />
        </button>

        {isLoading || !detail ? (
          <div className="py-10 text-center text-sm opacity-60">Loading...</div>
        ) : (
          <>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide opacity-60">
                {REQUEST_TYPE_LABELS[detail.requestType] ?? detail.requestType}{" "}
                Request
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                {STATUS_LABELS[detail.status] ?? detail.status}
              </h2>
            </div>

            <div
              className="flex flex-col gap-1 rounded-xl border p-3 text-sm"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
              }}
            >
              {detail.items.map((item) => (
                <div key={item.id}>
                  {item.orderItem.productTitle}
                  {item.orderItem.variantTitle
                    ? ` — ${item.orderItem.variantTitle}`
                    : ""}{" "}
                  · Qty {item.quantity}
                </div>
              ))}
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wide opacity-60">
                Your reason
              </div>
              <p className="mt-1 text-sm">{detail.reason}</p>
              {detail.description && (
                <p className="mt-1 text-sm opacity-70">{detail.description}</p>
              )}
            </div>

            {detail.notes && (
              <div
                className="rounded-xl border p-3 text-sm"
                style={{
                  borderColor:
                    detail.status === "EVIDENCE_REQUIRED"
                      ? "#f59e0b"
                      : "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
                }}
              >
                <div
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{
                    color:
                      detail.status === "EVIDENCE_REQUIRED"
                        ? "#f59e0b"
                        : undefined,
                    opacity: detail.status === "EVIDENCE_REQUIRED" ? 1 : 0.6,
                  }}
                >
                  Message from our team
                </div>
                <p className="mt-1">{detail.notes}</p>
              </div>
            )}

            {detail.evidence.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wide opacity-60">
                  Your evidence
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {detail.evidence.map((item) =>
                    item.mimeType?.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element -- evidence thumbnail, not a next/image-managed asset
                      <img
                        key={item.id}
                        src={item.url}
                        alt="Evidence"
                        className="h-14 w-14 rounded-lg border object-cover"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
                        }}
                      />
                    ) : (
                      <div
                        key={item.id}
                        className="flex h-14 w-14 items-center justify-center rounded-lg border text-[9px] opacity-60"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
                        }}
                      >
                        Video
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {detail.status === "EVIDENCE_REQUIRED" && (
              <div
                className="flex flex-col gap-2 border-t pt-4"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
                }}
              >
                <div className="text-xs font-bold uppercase tracking-wide opacity-60">
                  Upload more evidence
                </div>
                <label
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-xs font-semibold"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Add photos or a video
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFilesPicked(e.target.files)}
                  />
                </label>

                {evidenceItems.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {evidenceItems.map((item, i) => (
                      <div
                        key={`${item.file.name}-${i}`}
                        className="relative flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-lg border"
                        style={{
                          borderColor: item.error
                            ? "#dc2626"
                            : "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
                        }}
                      >
                        {item.uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin opacity-60" />
                        ) : item.url && item.mimeType?.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element -- evidence preview, not a next/image-managed asset
                          <img
                            src={item.url}
                            alt="Evidence"
                            className="h-full w-full object-cover"
                          />
                        ) : item.error ? (
                          <span className="px-1 text-center text-[9px] text-red-600">
                            Failed
                          </span>
                        ) : (
                          <span className="px-1 text-center text-[9px] opacity-60">
                            Video
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeEvidence(item.file)}
                          aria-label="Remove"
                          className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="mt-1 rounded-xl px-6 py-3 text-sm font-bold disabled:opacity-40"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                    color: "var(--brand-secondary)",
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit Evidence"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

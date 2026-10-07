"use client";

import { useEffect, useState } from "react";
import { X, Upload, Trash2, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useCreateReturnRequest } from "@/features/storefront/hooks/mutations/useCreateReturnRequest";
import { useUploadReturnEvidence } from "@/features/storefront/hooks/mutations/useUploadReturnEvidence";
import type {
  ReturnRequestType,
  ReturnPreferredResolution,
} from "@/features/storefront/contracts/order-request.contract";
import type { Order } from "@/features/storefront/contracts/order.contract";

const REQUEST_TYPE_OPTIONS: { value: ReturnRequestType; label: string }[] = [
  { value: "REFUND", label: "Refund" },
  { value: "REPLACEMENT", label: "Replacement" },
  { value: "RETURN", label: "Return the item" },
];

const REASON_OPTIONS = [
  "Damaged on arrival",
  "Defective / not working",
  "Wrong item received",
  "Missing parts",
  "Not as described",
  "Other",
];

type EvidenceItem = {
  file: File;
  url?: string;
  mimeType?: string;
  uploading: boolean;
  error?: string;
};

type SelectedItem = { orderItemId: string; quantity: number };

/**
 * "Request Refund/Return" — opened from pages/AccountPage.tsx's OrderCard,
 * only for FULFILLED orders. Plain useState form (this codebase has no
 * react-hook-form convention — see CheckoutPage.tsx's own address/message
 * fields), deliberately not backed by a persisted Zustand store: a File
 * can't survive localStorage serialization, and this is a same-page modal
 * flow, not a redirect-based one like checkout, so plain state is enough.
 * Uses OrderTrackingModal's older `var(--brand-primary)`/color-mix theme
 * tokens to match its immediate neighbor, not CheckoutPage's newer theme.
 */
export function RequestRefundModal({
  order,
  tenantSlug,
  onClose,
}: {
  order: Order | null;
  tenantSlug: string;
  onClose: () => void;
}) {
  const [selectedItems, setSelectedItems] = useState<
    Record<string, SelectedItem>
  >({});
  const [requestType, setRequestType] = useState<ReturnRequestType>("REFUND");
  const [reason, setReason] = useState(REASON_OPTIONS[0]);
  const [description, setDescription] = useState("");
  const [preferredResolution, setPreferredResolution] =
    useState<ReturnPreferredResolution>("REFUND");
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);

  const { mutateAsync: uploadEvidence } = useUploadReturnEvidence(tenantSlug);
  const { mutate: submitRequest, isPending: isSubmitting } =
    useCreateReturnRequest(tenantSlug);

  // Reset the draft whenever a different order is opened (or the modal closes).
  useEffect(() => {
    setSelectedItems({});
    setRequestType("REFUND");
    setReason(REASON_OPTIONS[0]);
    setDescription("");
    setPreferredResolution("REFUND");
    setEvidenceItems([]);
  }, [order?.id]);

  useEffect(() => {
    if (!order) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [order, onClose]);

  if (!order) return null;

  const toggleItem = (itemId: string, maxQuantity: number) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
      } else {
        next[itemId] = { orderItemId: itemId, quantity: maxQuantity };
      }
      return next;
    });
  };

  const setItemQuantity = (itemId: string, quantity: number) => {
    setSelectedItems((prev) =>
      prev[itemId]
        ? { ...prev, [itemId]: { orderItemId: itemId, quantity } }
        : prev,
    );
  };

  const handleFilesPicked = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: EvidenceItem[] = Array.from(files).map((file) => ({
      file,
      uploading: true,
    }));
    setEvidenceItems((prev) => [...prev, ...newItems]);

    // One at a time, not batched — a single failed upload shouldn't lose the
    // others already in flight or already uploaded.
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

  const items = Object.values(selectedItems);
  const isUploadingEvidence = evidenceItems.some((e) => e.uploading);
  const hasEvidenceError = evidenceItems.some((e) => e.error);
  const canSubmit =
    items.length > 0 &&
    !isUploadingEvidence &&
    !hasEvidenceError &&
    !isSubmitting;

  const handleSubmit = () => {
    if (!canSubmit) return;

    submitRequest(
      {
        orderId: order.id,
        items,
        requestType,
        reason,
        description: description.trim() || undefined,
        ...(requestType === "RETURN" ? { preferredResolution } : {}),
        evidence: evidenceItems
          .filter((e): e is EvidenceItem & { url: string } => !!e.url)
          .map((e) => ({ url: e.url, mimeType: e.mimeType })),
      },
      {
        onSuccess: () => {
          toast.success(
            "Your request has been submitted — we'll review it shortly.",
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
      aria-label={`Request refund or return for order ${order.orderNumber}`}
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

        <div>
          <div className="text-xs font-bold uppercase tracking-wide opacity-60">
            Order #{order.orderNumber}
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Request Refund, Replacement, or Return
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide opacity-60">
            Select item(s)
          </span>
          {order.items.map((item) => {
            const selected = selectedItems[item.id];
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border p-3"
                style={{
                  borderColor: selected
                    ? "var(--brand-primary)"
                    : "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!selected}
                  onChange={() => toggleItem(item.id, item.quantity)}
                  className="h-4 w-4 flex-none"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {item.productTitle}
                  </div>
                  <div className="text-xs opacity-60">
                    {item.variantTitle ? `${item.variantTitle} · ` : ""}
                    Qty {item.quantity} available
                  </div>
                </div>
                {selected && item.quantity > 1 && (
                  <select
                    value={selected.quantity}
                    onChange={(e) =>
                      setItemQuantity(item.id, Number(e.target.value))
                    }
                    className="h-8 flex-none rounded-lg border bg-transparent px-2 text-xs outline-none"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
                    }}
                  >
                    {Array.from({ length: item.quantity }, (_, i) => i + 1).map(
                      (n) => (
                        <option key={n} value={n}>
                          Qty {n}
                        </option>
                      ),
                    )}
                  </select>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide opacity-60">
            What would you like?
          </span>
          <div className="flex gap-2">
            {REQUEST_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRequestType(opt.value)}
                className="flex-1 rounded-xl border px-3 py-2.5 text-xs font-semibold"
                style={{
                  borderColor:
                    requestType === opt.value
                      ? "var(--brand-primary)"
                      : "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
                  backgroundColor:
                    requestType === opt.value
                      ? "color-mix(in srgb, var(--brand-primary) 8%, transparent)"
                      : "transparent",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {requestType === "RETURN" && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wide opacity-60">
              Once the item is back, I&rsquo;d prefer
            </span>
            <select
              value={preferredResolution}
              onChange={(e) =>
                setPreferredResolution(
                  e.target.value as ReturnPreferredResolution,
                )
              }
              className="h-10 rounded-lg border bg-transparent px-3 text-sm outline-none"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
              }}
            >
              <option value="REFUND">A refund</option>
              <option value="REPLACEMENT">A replacement</option>
            </select>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide opacity-60">
            Reason
          </span>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-10 rounded-lg border bg-transparent px-3 text-sm outline-none"
            style={{
              borderColor:
                "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
            }}
          >
            {REASON_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide opacity-60">
            Tell us more
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened..."
            rows={3}
            className="resize-none rounded-lg border bg-transparent p-3 text-sm outline-none"
            style={{
              borderColor:
                "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide opacity-60">
            Photo / video evidence
          </span>
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
                  ) : item.url ? (
                    <ImageIcon className="h-5 w-5 opacity-60" />
                  ) : (
                    <span className="px-1 text-center text-[9px] text-red-600">
                      Failed
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
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mt-2 rounded-xl px-6 py-3 text-sm font-bold disabled:opacity-40"
          style={{
            backgroundColor: "var(--brand-primary)",
            color: "var(--brand-secondary)",
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </div>
  );
}

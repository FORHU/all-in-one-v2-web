"use client";

import { useEffect } from "react";
import { X, Ban } from "lucide-react";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import type {
  Order,
  OrderStatus,
} from "@/features/storefront/contracts/order.contract";

const TRACKING_STAGES = ["Order Placed", "Processing", "Shipped", "Delivered"];

// How many of TRACKING_STAGES are complete for a given order status.
// CANCELLED/REFUNDED get their own banner instead of a partially-filled
// tracker, since "shipped" wouldn't be an honest thing to imply for either.
const STATUS_STEP: Record<OrderStatus, number> = {
  PENDING: 1,
  PROCESSING: 2,
  PARTIALLY_FULFILLED: 3,
  FULFILLED: 4,
  CANCELLED: 0,
  REFUNDED: 0,
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  PARTIALLY_FULFILLED: "Partially Fulfilled",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Order tracking dialog — pages/AccountPage.tsx's "Track Package" button.
 * There's no real carrier/logistics integration (see order.service.ts's
 * doc comments), so this reflects the order's real CommerceOrder.status
 * rather than live courier events — same honesty as
 * pages/OrderSuccessPage.tsx's tracker, just reusable for any past order
 * instead of only the one just placed.
 */
export function OrderTrackingModal({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!order) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [order, onClose]);

  if (!order) return null;

  const isTerminalNegative =
    order.status === "CANCELLED" || order.status === "REFUNDED";
  const completedSteps = STATUS_STEP[order.status];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Track order ${order.orderNumber}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col gap-6 overflow-y-auto rounded-2xl p-6 sm:p-8"
        style={{
          backgroundColor: "var(--brand-secondary)",
          color: "var(--brand-primary)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close tracking"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-current/5"
        >
          <X className="h-4 w-4" />
        </button>

        <div>
          <div className="text-xs font-bold uppercase tracking-wide opacity-60">
            Order
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            #{order.orderNumber}
          </h2>
          <p className="mt-1 text-xs opacity-60">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>

        {isTerminalNegative ? (
          <div
            className="flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold"
            style={{
              borderColor:
                order.status === "CANCELLED"
                  ? "#dc2626"
                  : "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
              color:
                order.status === "CANCELLED"
                  ? "#dc2626"
                  : "var(--brand-primary)",
            }}
          >
            <Ban className="h-5 w-5 flex-none" />
            This order was {STATUS_LABELS[order.status].toLowerCase()}.
          </div>
        ) : (
          <div>
            <div className="flex items-center">
              {TRACKING_STAGES.map((stage, i) => {
                const stepNum = i + 1;
                const complete = stepNum <= completedSteps;
                return (
                  <div
                    key={stage}
                    className="flex flex-1 items-center last:flex-none"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-[10px] font-bold"
                        style={{
                          backgroundColor: complete
                            ? "var(--brand-primary)"
                            : "transparent",
                          color: complete
                            ? "var(--brand-secondary)"
                            : "var(--brand-primary)",
                          border: complete ? "none" : "1px solid currentColor",
                          opacity: complete ? 1 : 0.35,
                        }}
                      >
                        {stepNum}
                      </div>
                      <span
                        className="w-16 text-center text-[10px] font-semibold"
                        style={{ opacity: complete ? 1 : 0.4 }}
                      >
                        {stage}
                      </span>
                    </div>
                    {i < TRACKING_STAGES.length - 1 && (
                      <div
                        className="mx-1 h-0.5 flex-1 rounded-full"
                        style={{
                          backgroundColor: "var(--brand-primary)",
                          opacity: stepNum < completedSteps ? 0.9 : 0.15,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-center text-[11px] opacity-50">
              Live courier tracking isn&rsquo;t connected yet — this reflects
              the order&rsquo;s current status.
            </p>
          </div>
        )}

        <div
          className="flex flex-col gap-3 border-t pt-5"
          style={{
            borderColor:
              "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
          }}
        >
          <h3 className="text-xs font-bold uppercase tracking-wide opacity-60">
            Items
          </h3>
          <ul className="flex flex-col gap-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <ImagePlaceholder
                  imageUrl={item.imageUrl}
                  label={item.productTitle}
                  aspect="1/1"
                  className="h-12 w-12 flex-none overflow-hidden rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {item.productTitle}
                  </div>
                  <div className="text-xs opacity-60">
                    {item.variantTitle ? `${item.variantTitle} · ` : ""}Qty{" "}
                    {item.quantity}
                  </div>
                </div>
                <span className="flex-none text-sm font-bold">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="flex items-center justify-between border-t pt-4 text-sm font-bold"
          style={{
            borderColor:
              "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
          }}
        >
          <span className="opacity-60">Order total</span>
          <span>${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

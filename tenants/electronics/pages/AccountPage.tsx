"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Package, ChevronDown } from "lucide-react";
import { ElectronicsStorefrontLayout } from "../layouts/StorefrontLayout";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useMyOrders } from "@/features/storefront/hooks/queries/useMyOrders";
import { useCancelOrder } from "@/features/storefront/hooks/mutations/useCancelOrder";
import { ApiError } from "@/shared/errors/api-error";
import type {
  Order,
  OrderStatus,
} from "@/features/storefront/contracts/order.contract";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";

const STATUS_STYLES: Record<OrderStatus, { bg: string; fg: string }> = {
  PENDING: { bg: "#f1f1ec", fg: "#5a5f69" },
  PROCESSING: { bg: "#e3e9ff", fg: "#2f4c7a" },
  PARTIALLY_FULFILLED: { bg: "#fcebd3", fg: "#8a5a1e" },
  FULFILLED: { bg: "#dff0e6", fg: "#2f6b46" },
  CANCELLED: { bg: "#fde2e1", fg: "#b3473d" },
  REFUNDED: { bg: "#f1f1ec", fg: "#8a8578" },
  REJECTED: { bg: "#fde2e1", fg: "#b3473d" },
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  PARTIALLY_FULFILLED: "Partially Fulfilled",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  REJECTED: "Rejected",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function OrderCard({
  order,
  tenantSlug,
}: {
  order: Order;
  tenantSlug: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const { mutate: cancelOrder, isPending: isCancelling } =
    useCancelOrder(tenantSlug);

  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const itemSummary =
    order.items.length > 1
      ? `${order.items[0]?.productTitle} + ${order.items.length - 1} more`
      : (order.items[0]?.productTitle ?? "");
  const status = STATUS_STYLES[order.status];

  const handleCancel = () => {
    cancelOrder(order.id, {
      onSuccess: () => {
        toast.success(`Order #${order.orderNumber} cancelled.`);
        setConfirmingCancel(false);
      },
      onError: (err) => {
        if (!(err instanceof ApiError)) setConfirmingCancel(false);
      },
    });
  };

  return (
    <div
      className="rounded-[20px] p-5"
      style={{
        backgroundColor: "#ffffff",
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full"
            style={{ backgroundColor: COLORS.ink }}
          >
            <Package className="h-5 w-5" style={{ color: COLORS.accent }} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold">#{order.orderNumber}</span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                style={{ backgroundColor: status.bg, color: status.fg }}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <div className="mt-1 text-xs" style={{ color: COLORS.muted }}>
              {formatDate(order.createdAt)} · {itemSummary} · {itemCount} item
              {itemCount === 1 ? "" : "s"}
            </div>
            <div
              className="mt-1 text-sm font-bold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ${order.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="flex flex-none items-start gap-2 sm:items-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 self-start rounded-xl border px-4 py-2.5 text-xs font-semibold sm:self-center"
            style={{ borderColor: COLORS.borderStrong }}
          >
            {expanded ? "Hide Details" : "View Details"}
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform"
              style={{ transform: expanded ? "rotate(180deg)" : undefined }}
            />
          </button>
          {order.status === "PENDING" &&
            (confirmingCancel ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(false)}
                  disabled={isCancelling}
                  className="rounded-xl border px-3 py-2 text-xs font-semibold disabled:opacity-40"
                  style={{ borderColor: COLORS.borderStrong }}
                >
                  Keep it
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                  style={{ backgroundColor: "#b3473d" }}
                >
                  {isCancelling ? "Cancelling…" : "Confirm"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingCancel(true)}
                className="self-start rounded-xl border px-4 py-2.5 text-xs font-semibold sm:self-center"
                style={{ borderColor: "#e2b6ae", color: "#b3473d" }}
              >
                Cancel Order
              </button>
            ))}
        </div>
      </div>

      {expanded && (
        <ul
          className="mt-4 flex flex-col gap-3 border-t pt-4"
          style={{ borderColor: COLORS.border }}
        >
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <div
                className="h-12 w-12 flex-none overflow-hidden rounded-lg"
                style={{ backgroundColor: COLORS.border }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {item.productTitle}
                </div>
                <div className="text-xs" style={{ color: COLORS.muted }}>
                  {item.variantTitle ? `${item.variantTitle} · ` : ""}Qty{" "}
                  {item.quantity}
                </div>
              </div>
              <span className="text-sm font-bold">
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * DigitFriend — account page. Real order history only (GET
 * /v2/orders/my-orders via useMyOrders, cancel via useCancelOrder), same
 * honest scope as beauty's AccountPage.tsx — no fabricated
 * addresses/payment/settings tabs. Gated on real auth state; signed-out
 * visitors are redirected to /login.
 */
export function ElectronicsAccountPage({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (hasMounted && !token) router.push("/login");
  }, [hasMounted, token, router]);

  const { data: ordersData, isLoading: isLoadingOrders } = useMyOrders(
    tenantSlug,
    { page: 1, limit: 20 },
    hasMounted && !!token,
  );

  if (!hasMounted || !token) {
    return (
      <ElectronicsStorefrontLayout>
        <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }} />
      </ElectronicsStorefrontLayout>
    );
  }

  return (
    <ElectronicsStorefrontLayout>
      <div
        className="mx-auto max-w-3xl px-6 py-12 sm:px-10"
        style={{ color: COLORS.ink }}
      >
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {user?.name || user?.username
            ? `Hi, ${user.name || user.username}`
            : "Your Account"}
        </h1>
        <p className="mt-1 text-sm" style={{ color: COLORS.muted }}>
          Your order history
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {isLoadingOrders ? (
            <p className="text-sm" style={{ color: COLORS.muted }}>
              Loading your orders...
            </p>
          ) : ordersData && ordersData.items.length > 0 ? (
            ordersData.items.map((order) => (
              <OrderCard key={order.id} order={order} tenantSlug={tenantSlug} />
            ))
          ) : (
            <div
              className="rounded-[20px] px-6 py-16 text-center"
              style={{
                backgroundColor: "#ffffff",
                border: `1px dashed ${COLORS.borderStrong}`,
              }}
            >
              <p
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                No orders yet
              </p>
              <p className="mt-1 text-sm" style={{ color: COLORS.muted }}>
                Orders you place will show up here.
              </p>
            </div>
          )}
        </div>
      </div>
    </ElectronicsStorefrontLayout>
  );
}

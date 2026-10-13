"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { BeautyStorefrontLayout } from "../layouts/StorefrontLayout";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useLastOrderStore } from "@/features/storefront/stores/lastOrder.store";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useBuyNowStore } from "@/features/storefront/stores/buyNow.store";
import { BEAUTY_MIRROR_COLORS as COLORS } from "../theme";

const TRACKING_STAGES = ["Order Placed", "Processing", "Shipped", "Delivered"];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Beauty — order confirmation page, mirrors
 * tenants/fashion/pages/OrderSuccessPage.tsx exactly: reads the
 * useLastOrderStore snapshot CheckoutPage.tsx wrote (not a real order
 * lookup — see hooks/queries/useMyOrders.ts / pages/AccountPage.tsx for
 * durable order history), clears the local cart/buy-now item once
 * mounted, estimates delivery from the chosen shipping method's `aging`
 * string (falls back to a generic 5-7 day window), and shows only the
 * first tracking stage as complete, since the order was just placed.
 *
 * Doesn't map item.color through a swatch-name lookup the way fashion's
 * COLOR_NAMES does — beauty's cart items store a human-readable variant
 * label directly (e.g. "30ml Bottle", "Rose Pink"), not a swatch code, so
 * there's nothing to translate.
 */
export function BeautyOrderSuccessPage() {
  const order = useLastOrderStore((s) => s.order);
  const clearCart = useLocalCartStore((s) => s.clear);
  const clearBuyNow = useBuyNowStore((s) => s.clear);

  useEffect(() => {
    clearCart();
    clearBuyNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!order) {
    return (
      <BeautyStorefrontLayout>
        <div
          className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center"
          style={{ color: COLORS.ink }}
        >
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            No recent order found
          </h1>
          <p className="text-sm" style={{ color: COLORS.muted }}>
            This page shows a confirmation right after checkout — there&rsquo;s
            nothing to display yet.
          </p>
          <Link
            href="/categories"
            className="rounded-2xl px-6 py-3 text-sm font-semibold"
            style={{ backgroundColor: COLORS.ink, color: COLORS.accentInk }}
          >
            Continue Shopping
          </Link>
        </div>
      </BeautyStorefrontLayout>
    );
  }

  const placedDate = new Date(order.placedAt);
  const agingMatch = order.shippingMethod.aging?.match(/(\d+)\D+(\d+)/);
  const [minDays, maxDays] = agingMatch
    ? [Number(agingMatch[1]), Number(agingMatch[2])]
    : [5, 7];
  const minDate = addDays(placedDate, minDays);
  const maxDate = addDays(placedDate, maxDays);

  return (
    <BeautyStorefrontLayout>
      <div
        className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16"
        style={{ color: COLORS.ink }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: COLORS.ink }}
          >
            <CheckCircle2
              className="h-9 w-9"
              style={{ color: COLORS.accentInk }}
            />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Thank you for your order!
          </h1>
          <p className="text-sm font-semibold" style={{ color: COLORS.muted }}>
            #{order.orderNumber}
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ border: `1px solid ${COLORS.panelBorder}` }}
        >
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2
              className="text-sm font-bold uppercase tracking-wide"
              style={{ color: COLORS.muted }}
            >
              Estimated Delivery
            </h2>
            <span className="text-sm font-bold">
              {formatDate(minDate)} – {formatDate(maxDate)}
            </span>
          </div>

          <div className="flex items-center">
            {TRACKING_STAGES.map((stage, i) => (
              <div
                key={stage}
                className="flex flex-1 items-center last:flex-none"
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor: i === 0 ? COLORS.ink : "transparent",
                      color: i === 0 ? COLORS.accentInk : COLORS.ink,
                      border: i === 0 ? "none" : "1px solid currentColor",
                      opacity: i === 0 ? 1 : 0.35,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    className="w-16 text-center text-[10px] font-semibold"
                    style={{ opacity: i === 0 ? 1 : 0.4 }}
                  >
                    {stage}
                  </span>
                </div>
                {i < TRACKING_STAGES.length - 1 && (
                  <div
                    className="mx-1 h-0.5 flex-1 rounded-full"
                    style={{ backgroundColor: COLORS.ink, opacity: 0.15 }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div
            className="flex flex-col gap-4 rounded-2xl p-6 sm:col-span-2"
            style={{ border: `1px solid ${COLORS.panelBorder}` }}
          >
            <h2
              className="text-sm font-bold uppercase tracking-wide"
              style={{ color: COLORS.muted }}
            >
              Items
            </h2>
            <ul className="flex flex-col gap-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <ImagePlaceholder
                    label={item.imageLabel}
                    imageUrl={item.imageUrl}
                    aspect="3/4"
                    className="h-20 w-16 flex-none text-current"
                  />
                  <div className="flex flex-1 flex-col justify-center">
                    <span
                      className="text-[11px] font-bold uppercase tracking-wide"
                      style={{ color: COLORS.muted }}
                    >
                      {item.brand}
                    </span>
                    <span className="text-sm font-semibold">{item.name}</span>
                    <span className="text-xs" style={{ color: COLORS.muted }}>
                      {[
                        item.size ? `Size: ${item.size}` : null,
                        item.color ? item.color : null,
                        `Qty: ${item.quantity}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                  <span className="self-center text-sm font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="flex flex-col gap-2 rounded-2xl p-6"
            style={{ border: `1px solid ${COLORS.panelBorder}` }}
          >
            <h2
              className="mb-1 text-sm font-bold uppercase tracking-wide"
              style={{ color: COLORS.muted }}
            >
              Shipping Address
            </h2>
            <div className="text-sm leading-relaxed">
              <div>
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
              </div>
              <div>{order.shippingAddress.address1}</div>
              {order.shippingAddress.address2 && (
                <div>{order.shippingAddress.address2}</div>
              )}
              <div>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zip}
              </div>
              <div>{order.shippingAddress.country}</div>
            </div>
            <div className="mt-2 text-xs" style={{ color: COLORS.muted }}>
              {order.shippingMethod.logisticName}
              {order.shippingMethod.aging
                ? ` — ${order.shippingMethod.aging}`
                : ""}
            </div>
          </div>

          <div
            className="flex flex-col gap-1.5 rounded-2xl p-6 text-sm"
            style={{ border: `1px solid ${COLORS.panelBorder}` }}
          >
            <h2
              className="mb-1 text-sm font-bold uppercase tracking-wide"
              style={{ color: COLORS.muted }}
            >
              Receipt
            </h2>
            <div
              className="flex justify-between"
              style={{ color: COLORS.muted }}
            >
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div
                className="flex justify-between"
                style={{ color: "#3A7D5C" }}
              >
                <span>Discount</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div
              className="flex justify-between"
              style={{ color: COLORS.muted }}
            >
              <span>Shipping</span>
              <span>
                {order.shipping === 0
                  ? "Free"
                  : `$${order.shipping.toFixed(2)}`}
              </span>
            </div>
            <div
              className="flex justify-between"
              style={{ color: COLORS.muted }}
            >
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div
              className="mt-1 flex justify-between border-t pt-2 text-base font-bold"
              style={{ borderColor: COLORS.hairline }}
            >
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Link
          href="/categories"
          className="self-center rounded-2xl border px-8 py-3.5 text-sm font-semibold"
          style={{ borderColor: COLORS.panelBorder }}
        >
          Continue Shopping
        </Link>
      </div>
    </BeautyStorefrontLayout>
  );
}

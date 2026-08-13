"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useLastOrderStore } from "@/features/storefront/stores/lastOrder.store";
import { SHIPPING_METHODS } from "../data/checkoutRules";
import { COLOR_NAMES } from "../components/CategoryFilters";

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
 * Fashion — order confirmation page.
 * Reads the order snapshot written by pages/CheckoutPage.tsx's "Place
 * Order" (useLastOrderStore) — there is no real orders backend, so this is
 * a hand-off between the two pages, not a durable order-history lookup.
 * Delivery date/tracking progress are computed client-side from the
 * selected shipping method, not sourced from a real carrier — only the
 * first tracking stage ("Order Placed") is ever marked complete, since the
 * order was, by definition, just placed on this same page load.
 */
export function FashionOrderSuccessPage() {
  const order = useLastOrderStore((s) => s.order);

  if (!order) {
    return (
      <FashionStorefrontLayout>
        <div
          className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center"
          style={{ color: "var(--brand-primary)" }}
        >
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            No recent order found
          </h1>
          <p className="text-sm opacity-60">
            This page shows a confirmation right after checkout — there&rsquo;s
            nothing to display yet.
          </p>
          <Link
            href="/products"
            className="rounded-2xl px-6 py-3 text-sm font-semibold"
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "var(--brand-secondary)",
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </FashionStorefrontLayout>
    );
  }

  const method = SHIPPING_METHODS[order.shippingMethodKey];
  const placedDate = new Date(order.placedAt);
  const minDate = addDays(placedDate, method.minDays);
  const maxDate = addDays(placedDate, method.maxDays);

  return (
    <FashionStorefrontLayout>
      <div
        className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16"
        style={{ color: "var(--brand-primary)" }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <CheckCircle2
              className="h-9 w-9"
              style={{ color: "var(--brand-secondary)" }}
            />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Thank you for your order!
          </h1>
          <p className="text-sm font-semibold opacity-60">
            #{order.orderNumber}
          </p>
        </div>

        <div className="rounded-2xl border border-current/10 p-6">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wide opacity-60">
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
                      backgroundColor:
                        i === 0 ? "var(--brand-primary)" : "transparent",
                      color:
                        i === 0
                          ? "var(--brand-secondary)"
                          : "var(--brand-primary)",
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
                    style={{
                      backgroundColor: "var(--brand-primary)",
                      opacity: 0.15,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl border border-current/10 p-6 sm:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-wide opacity-60">
              Items
            </h2>
            <ul className="flex flex-col gap-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <ImagePlaceholder
                    label={item.imageLabel}
                    imageUrl={item.imageUrl}
                    aspect="3/4"
                    className="h-20 w-16 flex-none"
                  />
                  <div className="flex flex-1 flex-col justify-center">
                    <span className="text-[11px] font-bold uppercase tracking-wide opacity-60">
                      {item.brand}
                    </span>
                    <span className="text-sm font-semibold">{item.name}</span>
                    <span className="text-xs opacity-60">
                      {[
                        item.size ? `Size: ${item.size}` : null,
                        item.color
                          ? `Color: ${COLOR_NAMES[item.color] ?? item.color}`
                          : null,
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

          <div className="flex flex-col gap-2 rounded-2xl border border-current/10 p-6">
            <h2 className="mb-1 text-sm font-bold uppercase tracking-wide opacity-60">
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
            <div className="mt-2 text-xs opacity-60">
              {method.label} — {method.eta}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 rounded-2xl border border-current/10 p-6 text-sm">
            <h2 className="mb-1 text-sm font-bold uppercase tracking-wide opacity-60">
              Receipt
            </h2>
            <div className="flex justify-between opacity-70">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between opacity-70">
              <span>Shipping</span>
              <span>
                {order.shipping === 0
                  ? "Free"
                  : `$${order.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between opacity-70">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-current/10 pt-2 text-base font-bold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Link
          href="/products"
          className="self-center rounded-2xl border px-8 py-3.5 text-sm font-semibold"
          style={{
            borderColor:
              "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
          }}
        >
          Continue Shopping
        </Link>
      </div>
    </FashionStorefrontLayout>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useLastOrderStore } from "@/features/storefront/stores/lastOrder.store";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useBuyNowStore } from "@/features/storefront/stores/buyNow.store";
import { ElectronicsStorefrontLayout } from "../layouts/StorefrontLayout";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";

const TRACKING_STAGES = ["Order placed", "Processing", "Shipped", "Delivered"];

const cardStyle: React.CSSProperties = {
  backgroundColor: COLORS.cardBg,
  border: `1px solid ${COLORS.border}`,
};

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

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
 * DigitFriend — order confirmation page, same behavior as
 * tenants/beauty/pages/OrderSuccessPage.tsx: reads the useLastOrderStore
 * snapshot CheckoutPage.tsx wrote (not a real order lookup — see
 * pages/AccountPage.tsx for durable order history), clears whatever was
 * just bought once mounted — the Buy Now item for ?mode=buy-now, otherwise
 * the local cart (unlike beauty, which clears both, wiping an untouched
 * cart after a Buy Now purchase) — estimates delivery from the chosen
 * shipping method's `aging` string (falls back to a generic 5-7 day
 * window), and shows only the first tracking stage as complete, since the
 * order was just placed.
 */
export function ElectronicsOrderSuccessPage() {
  const isBuyNow = useSearchParams().get("mode") === "buy-now";
  const order = useLastOrderStore((s) => s.order);
  const clearCart = useLocalCartStore((s) => s.clear);
  const clearBuyNow = useBuyNowStore((s) => s.clear);

  useEffect(() => {
    if (isBuyNow) clearBuyNow();
    else clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!order) {
    return (
      <ElectronicsStorefrontLayout>
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-24 text-center">
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
            href="/#shop"
            className="mt-2 rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: COLORS.ink }}
          >
            Browse the shop
          </Link>
        </div>
      </ElectronicsStorefrontLayout>
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
    <ElectronicsStorefrontLayout>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-14 sm:px-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: COLORS.accent }}
          >
            <Check
              className="h-8 w-8"
              strokeWidth={3}
              style={{ color: COLORS.accentInk }}
            />
          </div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Thanks — your order is in!
          </h1>
          <p
            className="text-sm"
            style={{ color: COLORS.muted, fontFamily: "var(--font-mono)" }}
          >
            ORDER #{order.orderNumber}
          </p>
        </div>

        <section className="rounded-[22px] p-6" style={cardStyle}>
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Estimated delivery
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
                    className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[11px] font-bold"
                    style={{
                      backgroundColor: i === 0 ? COLORS.accent : COLORS.cardBg,
                      color: i === 0 ? COLORS.accentInk : COLORS.muted,
                      border:
                        i === 0 ? "none" : `1px solid ${COLORS.borderStrong}`,
                    }}
                  >
                    {i === 0 ? (
                      <Check className="h-4 w-4" strokeWidth={3} />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className="w-16 text-center text-[11px] font-semibold"
                    style={{ color: i === 0 ? COLORS.ink : COLORS.muted }}
                  >
                    {stage}
                  </span>
                </div>
                {i < TRACKING_STAGES.length - 1 && (
                  <div
                    className="mx-1 mb-6 h-0.5 flex-1 rounded-full"
                    style={{ backgroundColor: COLORS.border }}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[22px] p-6" style={cardStyle}>
          <h2
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Items
          </h2>
          <ul className="mt-4 flex flex-col gap-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <ImagePlaceholder
                  label={item.imageLabel}
                  imageUrl={item.imageUrl}
                  aspect="1/1"
                  className="h-16 w-16 flex-none overflow-hidden rounded-xl text-[10px]"
                />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-semibold leading-snug">
                    {item.name}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.muted }}>
                    {[item.color, item.size, `Qty ${item.quantity}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
                <span className="flex-none text-sm font-bold">
                  {money(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <section className="rounded-[22px] p-6 text-sm" style={cardStyle}>
            <h2
              className="mb-3 text-lg font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Shipping to
            </h2>
            <div className="leading-relaxed" style={{ color: COLORS.muted }}>
              <div className="font-semibold" style={{ color: COLORS.ink }}>
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
              </div>
              <div>{order.shippingAddress.address1}</div>
              {order.shippingAddress.address2 && (
                <div>{order.shippingAddress.address2}</div>
              )}
              <div>
                {order.shippingAddress.city}
                {order.shippingAddress.state
                  ? `, ${order.shippingAddress.state}`
                  : ""}{" "}
                {order.shippingAddress.zip}
              </div>
              <div>{order.shippingAddress.country}</div>
            </div>
            <div className="mt-3 text-xs" style={{ color: COLORS.muted }}>
              {order.shippingMethod.logisticName}
              {order.shippingMethod.aging
                ? ` — ${order.shippingMethod.aging}`
                : ""}
            </div>
          </section>

          <section
            className="flex flex-col gap-2 rounded-[22px] p-6 text-sm"
            style={cardStyle}
          >
            <h2
              className="mb-1 text-lg font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Receipt
            </h2>
            <div
              className="flex justify-between"
              style={{ color: COLORS.muted }}
            >
              <span>Subtotal</span>
              <span>{money(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div
                className="flex justify-between"
                style={{ color: COLORS.success }}
              >
                <span>Discount</span>
                <span>-{money(order.discount)}</span>
              </div>
            )}
            <div
              className="flex justify-between"
              style={{ color: COLORS.muted }}
            >
              <span>Shipping</span>
              <span>
                {order.shipping === 0 ? "Free" : money(order.shipping)}
              </span>
            </div>
            <div
              className="flex justify-between"
              style={{ color: COLORS.muted }}
            >
              <span>Tax</span>
              <span>{money(order.tax)}</span>
            </div>
            <div
              className="mt-1 flex justify-between border-t pt-3 text-base font-bold"
              style={{ borderColor: COLORS.border }}
            >
              <span>Total</span>
              <span>{money(order.total)}</span>
            </div>
          </section>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/#shop"
            className="flex h-12 items-center rounded-xl px-8 text-sm font-bold text-white"
            style={{ backgroundColor: COLORS.ink }}
          >
            Continue shopping
          </Link>
          <Link
            href="/account"
            className="flex h-12 items-center rounded-xl px-8 text-sm font-bold"
            style={{
              backgroundColor: COLORS.cardBg,
              border: `1px solid ${COLORS.borderStrong}`,
            }}
          >
            View my orders
          </Link>
        </div>
      </div>
    </ElectronicsStorefrontLayout>
  );
}

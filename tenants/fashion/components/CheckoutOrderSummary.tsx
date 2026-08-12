"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import type { LocalCartItem } from "@/features/storefront/stores/localCart.store";
import { FASHION_DARK_COLORS, fashionFraunces, fashionInter } from "../theme";
import { PROMO_CODES } from "../data/checkoutRules";

/**
 * Fashion — checkout right column: item thumbnails, discount code input,
 * and the subtotal/discount/shipping/tax/total breakdown. Fixed dark
 * palette (Ink/Bone/Brass), matched exactly to a supplied mockup — same
 * precedent as CartContents.tsx, including the "ticket stub" notch circle
 * on the box's top border and the dashed rule after the ORDER SUMMARY
 * label.
 *
 * `items` is a prop rather than read from useLocalCartStore directly, so
 * this same component works for both the normal cart checkout and the
 * single-item Buy Now checkout (pages/CheckoutPage.tsx resolves which
 * item list applies and passes it down).
 *
 * Discount state is controlled by the parent (pages/CheckoutPage.tsx)
 * rather than owned here, because CheckoutPage needs the applied discount
 * amount to build the order snapshot handed off to OrderSuccessPage on
 * "Place Order" — this component would otherwise be the only place that
 * knew about it.
 */
export function CheckoutOrderSummary({
  items,
  shippingPrice,
  tax,
  total,
  discountInput,
  onDiscountInputChange,
  appliedDiscount,
  discount,
  discountError,
  onApplyDiscount,
}: {
  items: LocalCartItem[];
  shippingPrice: number;
  tax: number;
  total: number;
  discountInput: string;
  onDiscountInputChange: (value: string) => void;
  appliedDiscount: string | null;
  discount: number;
  discountError: string | null;
  onApplyDiscount: () => void;
}) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div
      className={`relative flex flex-col gap-5 rounded-2xl p-6 ${fashionInter.className}`}
      style={{
        backgroundColor: FASHION_DARK_COLORS.ink2,
        border: `1px solid ${FASHION_DARK_COLORS.hairline}`,
        color: FASHION_DARK_COLORS.bone,
      }}
    >
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          backgroundColor: FASHION_DARK_COLORS.ink,
          border: `1px solid ${FASHION_DARK_COLORS.hairline}`,
        }}
      />

      <div className="flex items-center gap-3">
        <h2
          className="flex-none text-[11px] font-bold uppercase"
          style={{ color: FASHION_DARK_COLORS.brass, letterSpacing: "1.2px" }}
        >
          Order Summary
        </h2>
        <span
          className="h-0 flex-1"
          style={{
            borderTop: `1px dashed ${FASHION_DARK_COLORS.hairline}`,
          }}
        />
      </div>

      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <div className="relative flex-none">
              <ImagePlaceholder
                label={item.imageLabel}
                imageUrl={item.imageUrl}
                aspect="3/4"
                className="h-16 w-14"
              />
              <span
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: FASHION_DARK_COLORS.brass,
                  color: FASHION_DARK_COLORS.ink,
                }}
              >
                {item.quantity}
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <span
                className={fashionFraunces.className}
                style={{ fontSize: 14, fontWeight: 500 }}
              >
                {item.name}
              </span>
              {(item.size || item.color) && (
                <span
                  className="text-[11px]"
                  style={{ color: FASHION_DARK_COLORS.boneDim }}
                >
                  {[item.size && `Size ${item.size}`, item.color]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
            </div>
            <span className="self-center text-xs font-bold">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2">
          <input
            value={discountInput}
            onChange={(event) => onDiscountInputChange(event.target.value)}
            placeholder="Discount code"
            className="h-10 flex-1 rounded-lg px-3 text-sm outline-none"
            style={{
              backgroundColor: FASHION_DARK_COLORS.ink,
              border: `1px solid ${FASHION_DARK_COLORS.hairline}`,
              color: FASHION_DARK_COLORS.bone,
            }}
          />
          <button
            type="button"
            onClick={onApplyDiscount}
            className="rounded-lg px-4 text-sm font-semibold uppercase transition-colors hover:bg-[#B9945C] hover:text-[#121110]"
            style={{
              border: `1px solid ${FASHION_DARK_COLORS.brass}`,
              color: FASHION_DARK_COLORS.brass,
              letterSpacing: "0.4px",
            }}
          >
            Apply
          </button>
        </div>
        {discountError && (
          <p className="text-xs" style={{ color: FASHION_DARK_COLORS.brick }}>
            {discountError}
          </p>
        )}
        {appliedDiscount && (
          <p className="text-xs" style={{ color: FASHION_DARK_COLORS.brass }}>
            {PROMO_CODES[appliedDiscount].label} applied
          </p>
        )}
      </div>

      <div
        className="flex flex-col gap-1.5 pt-4 text-sm"
        style={{ borderTop: `1px dashed ${FASHION_DARK_COLORS.hairline}` }}
      >
        <div
          className="flex justify-between"
          style={{ color: FASHION_DARK_COLORS.boneDim }}
        >
          <span>Subtotal</span>
          <span style={{ color: FASHION_DARK_COLORS.bone }}>
            ${subtotal.toFixed(2)}
          </span>
        </div>
        {discount > 0 && (
          <div
            className="flex justify-between"
            style={{ color: FASHION_DARK_COLORS.brass }}
          >
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
        <div
          className="flex justify-between"
          style={{ color: FASHION_DARK_COLORS.boneDim }}
        >
          <span>Shipping</span>
          <span style={{ color: FASHION_DARK_COLORS.bone }}>
            {shippingPrice === 0 ? "Free" : `$${shippingPrice.toFixed(2)}`}
          </span>
        </div>
        <div
          className="flex justify-between"
          style={{ color: FASHION_DARK_COLORS.boneDim }}
        >
          <span>Estimated Tax</span>
          <span style={{ color: FASHION_DARK_COLORS.bone }}>
            ${tax.toFixed(2)}
          </span>
        </div>
        <div
          className="mt-1 flex items-baseline justify-between pt-2 text-base font-bold"
          style={{
            borderTop: `1px solid ${FASHION_DARK_COLORS.hairlineSoft}`,
            color: FASHION_DARK_COLORS.bone,
          }}
        >
          <span>Total</span>
          <span
            className={fashionFraunces.className}
            style={{ fontSize: 20, color: FASHION_DARK_COLORS.brass }}
          >
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      <div
        className="flex items-center gap-4 pt-1 text-[11.5px]"
        style={{ letterSpacing: "0.2px" }}
      >
        <span
          className="flex items-center gap-1.5 font-semibold"
          style={{ color: FASHION_DARK_COLORS.brass }}
        >
          <Lock className="h-3 w-3" />
          Secure checkout
        </span>
        <span
          className="flex items-center gap-1.5"
          style={{ color: FASHION_DARK_COLORS.boneDim }}
        >
          <ShieldCheck className="h-3 w-3" />
          30-day returns
        </span>
      </div>
    </div>
  );
}

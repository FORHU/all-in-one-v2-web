"use client";

import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { PROMO_CODES } from "../data/checkoutRules";

/**
 * Fashion — checkout right column: item thumbnails, discount code input,
 * and the subtotal/discount/shipping/tax/total breakdown.
 *
 * Discount state is controlled by the parent (pages/CheckoutPage.tsx)
 * rather than owned here, because CheckoutPage needs the applied discount
 * amount to build the order snapshot handed off to OrderSuccessPage on
 * "Place Order" — this component would otherwise be the only place that
 * knew about it.
 */
export function CheckoutOrderSummary({
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
  const items = useLocalCartStore((s) => s.items);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div
      className="flex flex-col gap-5 rounded-2xl border border-current/10 p-6"
      style={{ color: "var(--brand-primary)" }}
    >
      <h2 className="text-base font-bold">Order Summary</h2>

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <div className="relative flex-none">
              <ImagePlaceholder
                label={item.imageLabel}
                aspect="3/4"
                className="h-16 w-14"
              />
              <span
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "var(--brand-secondary)",
                }}
              >
                {item.quantity}
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <span className="text-xs font-semibold">{item.name}</span>
              {(item.size || item.color) && (
                <span className="text-[11px] opacity-60">
                  {[item.size, item.color].filter(Boolean).join(" / ")}
                </span>
              )}
            </div>
            <span className="self-center text-xs font-bold">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1.5 border-t border-current/10 pt-4">
        <div className="flex gap-2">
          <input
            value={discountInput}
            onChange={(event) => onDiscountInputChange(event.target.value)}
            placeholder="Discount code"
            className="h-10 flex-1 rounded-lg border border-current/15 px-3 text-sm outline-none"
          />
          <button
            type="button"
            onClick={onApplyDiscount}
            className="rounded-lg px-4 text-sm font-semibold"
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "var(--brand-secondary)",
            }}
          >
            Apply
          </button>
        </div>
        {discountError && (
          <p className="text-xs text-red-600">{discountError}</p>
        )}
        {appliedDiscount && (
          <p className="text-xs text-green-700">
            {PROMO_CODES[appliedDiscount].label} applied
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 border-t border-current/10 pt-4 text-sm">
        <div className="flex justify-between opacity-70">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between opacity-70">
          <span>Shipping</span>
          <span>
            {shippingPrice === 0 ? "Free" : `$${shippingPrice.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between opacity-70">
          <span>Estimated Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-current/10 pt-2 text-base font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { Accordion } from "@/shared/components/Accordion";
import { COLOR_NAMES } from "./CategoryFilters";
import {
  FREE_SHIPPING_THRESHOLD,
  TAX_RATE,
  SHIPPING_METHODS,
  PROMO_CODES,
} from "../data/checkoutRules";

/**
 * Fashion — cart line items + free-shipping progress + promo code + order
 * summary. Shared by CartDrawer (slide-over) and pages/CartPage.tsx (full
 * page) so the pricing math and item list only exist in one place.
 *
 * Pricing rules (shipping/tax/promo) come from data/checkoutRules.ts — see
 * that file for why they're placeholders. Shipping here assumes standard
 * (the method itself is only chosen during checkout). Cart items live in
 * useLocalCartStore, a client-only stand-in for the real /v2/cart.
 */
export function CartContents({ onNavigate }: { onNavigate?: () => void }) {
  const items = useLocalCartStore((s) => s.items);
  const removeItem = useLocalCartStore((s) => s.removeItem);
  const setQuantity = useLocalCartStore((s) => s.setQuantity);

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-sm opacity-60">Your cart is empty.</p>
        <Link
          href="/products"
          onClick={onNavigate}
          className="rounded-2xl px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--brand-primary)" }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = appliedPromo
    ? (subtotal * PROMO_CODES[appliedPromo].discountPercent) / 100
    : 0;
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_METHODS.standard.price;
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + shipping + tax;
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );
  const shippingProgress = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
  );

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoError(null);
    } else {
      setAppliedPromo(null);
      setPromoError("Invalid promo code");
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-current/10 px-6 py-4">
        {remainingForFreeShipping > 0 ? (
          <p className="mb-2 text-xs font-semibold">
            Add ${remainingForFreeShipping.toFixed(2)} more for Free Shipping!
          </p>
        ) : (
          <p className="mb-2 text-xs font-semibold text-green-700">
            You&rsquo;ve unlocked Free Shipping!
          </p>
        )}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-current/10">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${shippingProgress}%`,
              backgroundColor: "var(--brand-primary)",
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <ul className="flex flex-col gap-5">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <ImagePlaceholder
                label={item.imageLabel}
                aspect="3/4"
                className="h-24 w-20 flex-none"
              />
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wide opacity-60">
                      {item.brand}
                    </div>
                    <div className="text-sm font-semibold">{item.name}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4 opacity-50" />
                  </button>
                </div>
                {(item.size || item.color) && (
                  <div className="text-xs opacity-60">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.size && item.color && <span> · </span>}
                    {item.color && (
                      <span>
                        Color: {COLOR_NAMES[item.color] ?? item.color}
                      </span>
                    )}
                  </div>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full border border-current/15 px-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="flex h-6 w-6 items-center justify-center"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center text-xs font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="flex h-6 w-6 items-center justify-center"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-current/10 px-6">
        <Accordion
          title="Promo Code"
          defaultOpen={false}
          className="border-b-0"
        >
          <div className="flex gap-2">
            <input
              value={promoInput}
              onChange={(event) => setPromoInput(event.target.value)}
              placeholder="Enter code"
              className="h-10 flex-1 rounded-lg border border-current/15 px-3 text-sm outline-none"
            />
            <button
              type="button"
              onClick={applyPromo}
              className="rounded-lg px-4 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              Apply
            </button>
          </div>
          {promoError && (
            <p className="mt-1.5 text-xs text-red-600">{promoError}</p>
          )}
          {appliedPromo && (
            <p className="mt-1.5 text-xs text-green-700">
              {PROMO_CODES[appliedPromo].label} applied
            </p>
          )}
        </Accordion>
      </div>

      <div className="border-t border-current/10 px-6 py-5">
        <div className="flex flex-col gap-1.5 text-sm">
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
            <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
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
        <Link
          href="/checkout"
          onClick={onNavigate}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--brand-primary)" }}
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}

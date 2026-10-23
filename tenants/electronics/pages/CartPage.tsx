"use client";

import Link from "next/link";
import { Lock, Minus, Plus, X } from "lucide-react";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";
import { ElectronicsStorefrontLayout } from "../layouts/StorefrontLayout";

/**
 * DigitFriend — full cart page. Backed by the same useLocalCartStore the
 * header badge and every product card's Add/qty stepper already write to
 * (tenantScopedStorage-namespaced, same as every other tenant's cart).
 *
 * "Checkout" links to /checkout (pages/CheckoutPage.tsx), which handles the
 * signed-out redirect, address, shipping quote and Stripe payment itself.
 */
export function ElectronicsCartPage() {
  const items = useLocalCartStore((s) => s.items);
  const removeItem = useLocalCartStore((s) => s.removeItem);
  const setQuantity = useLocalCartStore((s) => s.setQuantity);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <ElectronicsStorefrontLayout>
      <div className="mx-auto max-w-2xl px-6 py-12 sm:px-10">
        <div className="mb-8 flex items-baseline gap-2">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Your Cart
          </h1>
          <span className="text-sm" style={{ color: COLORS.muted }}>
            {itemCount}
          </span>
        </div>

        {items.length === 0 ? (
          <div
            className="flex flex-col items-center gap-3 rounded-[22px] px-6 py-20 text-center"
            style={{
              backgroundColor: "#ffffff",
              border: `1px dashed ${COLORS.borderStrong}`,
            }}
          >
            <p
              className="text-lg font-bold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Your cart is empty
            </p>
            <p className="text-sm" style={{ color: COLORS.muted }}>
              Items you add will sit here, ready when you are.
            </p>
            <Link
              href="/#shop"
              className="mt-2 rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: COLORS.ink }}
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <div
              className="overflow-hidden rounded-[22px]"
              style={{
                backgroundColor: "#ffffff",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ul>
                {items.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex gap-4 p-5"
                    style={{
                      borderBottom:
                        index < items.length - 1
                          ? `1px solid ${COLORS.border}`
                          : undefined,
                    }}
                  >
                    <div
                      className="h-20 w-20 flex-none overflow-hidden rounded-xl"
                      style={{ backgroundColor: COLORS.border }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {item.brand && (
                            <div
                              className="text-[10px] font-bold uppercase tracking-wide"
                              style={{ color: COLORS.muted }}
                            >
                              {item.brand}
                            </div>
                          )}
                          <div className="truncate text-sm font-semibold">
                            {item.name}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="flex-none"
                          style={{ color: COLORS.muted }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div
                          className="flex items-center rounded-full"
                          style={{ border: `1px solid ${COLORS.borderStrong}` }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              item.quantity > 1 &&
                              setQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                            className="flex h-8 w-8 items-center justify-center disabled:opacity-40"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setQuantity(item.id, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                            className="flex h-8 w-8 items-center justify-center"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div
                            className="text-[11px]"
                            style={{ color: COLORS.muted }}
                          >
                            ${item.price.toFixed(2)} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="mt-6 rounded-[22px] p-5"
              style={{
                backgroundColor: "#ffffff",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div
                className="flex items-baseline justify-between text-sm"
                style={{ color: COLORS.muted }}
              >
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div
                className="mt-3 flex items-baseline justify-between border-t pt-3"
                style={{ borderColor: COLORS.border }}
              >
                <span className="text-sm font-semibold">Total</span>
                <span
                  className="text-xl font-bold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <Link
                href="/checkout"
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wide"
                style={{ backgroundColor: COLORS.ink, color: "#ffffff" }}
              >
                <Lock
                  className="h-3.5 w-3.5"
                  style={{ color: COLORS.accent }}
                />
                Checkout
              </Link>
              <p
                className="mt-2 text-center text-xs"
                style={{ color: COLORS.muted }}
              >
                Shipping calculated at checkout.
              </p>
            </div>
          </>
        )}
      </div>
    </ElectronicsStorefrontLayout>
  );
}

"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { BEAUTY_MIRROR_COLORS as COLORS } from "../theme";
import { BeautyStorefrontLayout } from "../layouts/StorefrontLayout";

const glassBlur: React.CSSProperties = {
  backdropFilter: "blur(26px) saturate(170%)",
  WebkitBackdropFilter: "blur(26px) saturate(170%)",
};

/**
 * Beauty — full cart page. Backed by the same useLocalCartStore as
 * fashion's CartPage/CartContents (a client-only stand-in until a real
 * /v2/cart exists — see that store's doc comment), now namespaced per
 * tenant (tenantScopedStorage) so a beauty shopper's bag and a fashion
 * shopper's bag never share one localStorage key.
 *
 * Deliberately page-only, no header icon or slide-over drawer — unlike
 * AddictStyle, nothing else in this tenant has a drawer pattern yet
 * (Home/Categories/ProductDetail are all full pages), so a one-off drawer
 * here would be new UI surface rather than reusing an established one.
 *
 * "Checkout" below routes to the real pages/CheckoutPage.tsx (now wired at
 * /checkout for beauty) — Quantity/remove write straight to the shared
 * cart store, same as before.
 *
 * Re-matched to the rest of the tenant's warm terracotta *glass* theme —
 * the empty-state, item-list and totals cards were still opaque white
 * (`COLORS.surface`) from before that retheme, standing out against the
 * glass header above and the blurred-photo backdrop around them. Now
 * frosted glass (`COLORS.glassBg` + backdrop blur), same as a category
 * card or the login page's panels.
 */
export function BeautyCartPage() {
  const items = useLocalCartStore((s) => s.items);
  const removeItem = useLocalCartStore((s) => s.removeItem);
  const setQuantity = useLocalCartStore((s) => s.setQuantity);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <BeautyStorefrontLayout>
      <div className="mx-auto max-w-2xl px-6 py-12 sm:px-10">
        <div className="mb-8 flex items-baseline gap-2">
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ color: COLORS.ink, fontFamily: "var(--font-heading)" }}
          >
            Your Bag
          </h1>
          <span className="text-sm" style={{ color: COLORS.muted }}>
            {itemCount}
          </span>
        </div>

        {items.length === 0 ? (
          <div
            className="flex flex-col items-center gap-3 rounded-2xl px-6 py-20 text-center"
            style={{
              backgroundColor: COLORS.glassBg,
              border: `1px solid ${COLORS.glassBorder}`,
              boxShadow: "0 1px 0 rgba(255,255,255,.7) inset",
              ...glassBlur,
            }}
          >
            <p
              className="text-lg font-semibold"
              style={{ color: COLORS.ink, fontFamily: "var(--font-heading)" }}
            >
              Your bag is empty
            </p>
            <p className="text-sm" style={{ color: COLORS.muted }}>
              Items you add will sit here, ready when you are.
            </p>
            <Link
              href="/categories"
              className="mt-2 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wide"
              style={{ backgroundColor: COLORS.ink, color: COLORS.accentInk }}
            >
              Browse Categories
            </Link>
          </div>
        ) : (
          <>
            <div
              className="overflow-hidden rounded-2xl"
              style={{
                backgroundColor: COLORS.glassBg,
                border: `1px solid ${COLORS.glassBorder}`,
                boxShadow: "0 1px 0 rgba(255,255,255,.7) inset",
                ...glassBlur,
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
                          ? `1px solid ${COLORS.hairline}`
                          : undefined,
                    }}
                  >
                    <div className="h-20 w-20 flex-none overflow-hidden rounded-xl">
                      <ImagePlaceholder
                        imageUrl={item.imageUrl}
                        label={item.imageLabel}
                        aspect="1/1"
                        className="h-full w-full text-current"
                      />
                    </div>

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
                          <div
                            className="truncate text-sm font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            {item.name}
                          </div>
                          {(item.size || item.color) && (
                            <div
                              className="mt-0.5 text-xs"
                              style={{ color: COLORS.muted }}
                            >
                              {item.size && <span>Size {item.size}</span>}
                              {item.size && item.color && <span> · </span>}
                              {item.color && <span>{item.color}</span>}
                            </div>
                          )}
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
                          style={{ border: `1px solid ${COLORS.panelBorder}` }}
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
                            style={{ color: COLORS.ink }}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span
                            className="w-6 text-center text-xs font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setQuantity(item.id, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                            className="flex h-8 w-8 items-center justify-center"
                            style={{ color: COLORS.ink }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div
                            className="text-sm font-bold"
                            style={{ color: COLORS.ink }}
                          >
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
              className="mt-6 rounded-2xl p-5"
              style={{
                backgroundColor: COLORS.glassBg,
                border: `1px solid ${COLORS.glassBorder}`,
                boxShadow: "0 1px 0 rgba(255,255,255,.7) inset",
                ...glassBlur,
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
                style={{ borderColor: COLORS.hairline }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: COLORS.ink }}
                >
                  Total
                </span>
                <span
                  className="text-xl font-bold"
                  style={{
                    color: COLORS.ink,
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <Link
                href="/checkout"
                className="mt-5 flex h-12 w-full items-center justify-center rounded-full text-xs font-bold uppercase tracking-wide"
                style={{ backgroundColor: COLORS.ink, color: COLORS.accentInk }}
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </BeautyStorefrontLayout>
  );
}

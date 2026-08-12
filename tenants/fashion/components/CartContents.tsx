"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useBuyNowCartItem } from "../hooks/useBuyNow";
import { COLOR_NAMES } from "./CategoryFilters";
import { useFashionColorMode } from "../stores/colorMode.store";
import { getFashionColors, fashionFraunces, fashionInter } from "../theme";
import { FREE_SHIPPING_THRESHOLD } from "../data/checkoutRules";

/**
 * Fashion — cart header (title/count/close) + line items + summary/checkout.
 * Shared by CartDrawer
 * (slide-over, passes onClose) and pages/CartPage.tsx (full page, omits
 * onClose) so the header/pricing/item-list markup only exists in one
 * place and both hosts render identically. Matched exactly to a supplied
 * mockup — see ../theme.ts for the fonts/palette. Unlike the previous
 * design, there's no promo-code UI and no separate tax line — the total
 * is just subtotal (shipping cost, when it applies, is only resolved at
 * checkout, matching the mockup's "Calculated at checkout" copy); Promo
 * codes and tax still apply at actual checkout (see CheckoutPage), just
 * not previewed here. Cart items live in useLocalCartStore, a client-only
 * stand-in for the real /v2/cart.
 *
 * There is no single "Checkout" CTA for the whole bag — each line item
 * gets its own Checkout button, which routes that one item through the
 * Buy Now flow (hooks/useBuyNow.ts's useBuyNowCartItem) independently of
 * the rest of the cart. The subtotal/total block stays as a read-only
 * summary of everything currently in the bag.
 *
 * Follows the site's light/dark toggle (unlike TrendingLookbook.tsx, which
 * is deliberately always-dark) — see ../theme.ts's getFashionColors. Gated
 * behind a mount flag since useFashionColorMode persists to localStorage,
 * unavailable during SSR (same pattern as layouts/StorefrontLayout.tsx).
 */
export function CartContents({
  onNavigate,
  onClose,
}: {
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const items = useLocalCartStore((s) => s.items);
  const removeItem = useLocalCartStore((s) => s.removeItem);
  const setQuantity = useLocalCartStore((s) => s.setQuantity);
  const buyNowCartItem = useBuyNowCartItem();
  const colorMode = useFashionColorMode((s) => s.mode);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  const mode = hasMounted ? colorMode : "dark";
  const colors = getFashionColors(mode);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col ${fashionInter.className}`}
      style={{
        backgroundColor: colors.ink,
        color: colors.bone,
      }}
    >
      <div
        className="px-6 pb-[18px] pt-6"
        style={{ borderBottom: `1px solid ${colors.hairline}` }}
      >
        <div className="flex items-center justify-between">
          <div
            className={fashionFraunces.className}
            style={{ fontSize: 22, fontWeight: 500, letterSpacing: "0.2px" }}
          >
            Your bag
            <span
              style={{
                color: colors.boneDim,
                fontWeight: 400,
                fontSize: 16,
                marginLeft: 6,
              }}
            >
              {itemCount}
            </span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close cart"
              className="flex h-8 w-8 flex-none items-center justify-center rounded-full border transition-colors hover:border-[#B9945C]"
              style={{ borderColor: colors.hairline }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div
          className="px-6 py-[60px] text-center"
          style={{ color: colors.boneDim }}
        >
          <div
            className={fashionFraunces.className}
            style={{
              fontSize: 19,
              color: colors.bone,
              marginBottom: 8,
            }}
          >
            Your bag is empty
          </div>
          <p className="text-[13.5px] leading-[1.6]">
            Pieces you add will sit here,
            <br />
            ready when you are.
          </p>
        </div>
      ) : (
        <>
          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6">
            <ul>
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="relative flex gap-[14px] py-[18px]"
                  style={{
                    borderBottom:
                      index < items.length - 1
                        ? `1px solid ${colors.hairlineSoft}`
                        : undefined,
                  }}
                >
                  <div
                    className="relative h-16 w-16 flex-none overflow-hidden"
                    style={{
                      borderRadius: 2,
                      border: `1px solid ${colors.hairline}`,
                      backgroundColor: colors.ink2,
                    }}
                  >
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.imageLabel}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div
                          className="text-[10px] font-bold uppercase"
                          style={{
                            color: colors.brassDim,
                            letterSpacing: "1px",
                            marginBottom: 3,
                          }}
                        >
                          {item.brand}
                        </div>
                        <div
                          className={`truncate ${fashionFraunces.className}`}
                          style={{
                            fontSize: 15.5,
                            fontWeight: 500,
                            lineHeight: 1.3,
                          }}
                        >
                          {item.name}
                        </div>
                        {(item.size || item.color) && (
                          <div
                            className="mt-1 text-[12.5px]"
                            style={{ color: colors.boneDim }}
                          >
                            {item.size && <span>Size {item.size}</span>}
                            {item.size && item.color && <span> · </span>}
                            {item.color && (
                              <span>
                                {COLOR_NAMES[item.color] ?? item.color}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="flex-none transition-colors hover:text-[#8C3B2E]"
                        style={{ color: colors.boneDim }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div
                        className="flex items-center border"
                        style={{
                          borderColor: colors.hairline,
                          borderRadius: 2,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            item.quantity > 1 &&
                            setQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="flex h-[26px] w-[26px] items-center justify-center transition-colors hover:text-[#B9945C] disabled:cursor-not-allowed"
                          style={{
                            color:
                              item.quantity <= 1
                                ? colors.hairline
                                : colors.bone,
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-[22px] text-center text-[13px]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.id, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="flex h-[26px] w-[26px] items-center justify-center transition-colors hover:text-[#B9945C]"
                          style={{ color: colors.bone }}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div
                        className={fashionFraunces.className}
                        style={{
                          fontSize: 15,
                          fontWeight: 500,
                          textAlign: "right",
                        }}
                      >
                        ${(item.price * item.quantity).toFixed(2)}
                        <span
                          className={`block ${fashionInter.className}`}
                          style={{
                            fontSize: 11,
                            color: colors.boneDim,
                            fontWeight: 400,
                            marginTop: 2,
                          }}
                        >
                          ${item.price.toFixed(2)} each
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        buyNowCartItem(item);
                        onNavigate?.();
                      }}
                      className="mt-3 w-full py-2 text-[11.5px] font-semibold uppercase transition-colors hover:bg-[#B9945C] hover:text-[#121110]"
                      style={{
                        border: `1px solid ${colors.brass}`,
                        color: colors.brass,
                        letterSpacing: "0.6px",
                        borderRadius: 2,
                      }}
                    >
                      Checkout
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="px-6 pb-6 pt-5"
            style={{ borderTop: `1px solid ${colors.hairline}` }}
          >
            <div
              className="flex flex-col text-[13.5px]"
              style={{ color: colors.boneDim }}
            >
              <div className="mb-2 flex items-baseline justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="mb-2 flex items-baseline justify-between">
                <span>Shipping</span>
                <span>
                  {isFreeShipping ? "Free" : "Calculated at checkout"}
                </span>
              </div>
            </div>
            <div
              className="mt-[14px] flex items-baseline justify-between pt-[14px] text-base"
              style={{
                color: colors.bone,
                borderTop: `1px solid ${colors.hairlineSoft}`,
              }}
            >
              <span>Total</span>
              <span
                className={fashionFraunces.className}
                style={{ fontSize: 21, fontWeight: 500 }}
              >
                ${total.toFixed(2)}
              </span>
            </div>
            <p
              className="mt-[18px] text-center text-[11.5px]"
              style={{
                color: colors.boneDim,
                letterSpacing: "0.2px",
              }}
            >
              Taxes included. Returns accepted within 30 days.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

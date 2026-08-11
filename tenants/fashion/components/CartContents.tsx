"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { COLOR_NAMES } from "./CategoryFilters";
import { FASHION_DARK_COLORS, fashionFraunces, fashionInter } from "../theme";
import { FREE_SHIPPING_THRESHOLD } from "../data/checkoutRules";

const SHIPPING_TICK_COUNT = 21;

/**
 * Fashion — cart header (title/count/close) + free-shipping "tape measure"
 * progress + line items + summary/checkout. Shared by CartDrawer
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

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );
  const shippingProgress = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
  );

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col ${fashionInter.className}`}
      style={{
        backgroundColor: FASHION_DARK_COLORS.ink,
        color: FASHION_DARK_COLORS.bone,
      }}
    >
      <div
        className="px-6 pb-[18px] pt-6"
        style={{ borderBottom: `1px solid ${FASHION_DARK_COLORS.hairline}` }}
      >
        <div className="flex items-center justify-between">
          <div
            className={fashionFraunces.className}
            style={{ fontSize: 22, fontWeight: 500, letterSpacing: "0.2px" }}
          >
            Your bag
            <span
              style={{
                color: FASHION_DARK_COLORS.boneDim,
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
              style={{ borderColor: FASHION_DARK_COLORS.hairline }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-[18px]">
          <div className="mb-[9px] flex items-center justify-between">
            <span
              className="text-[11px] font-bold uppercase"
              style={{
                color: FASHION_DARK_COLORS.brass,
                letterSpacing: "1.2px",
              }}
            >
              Free shipping
            </span>
            <span
              className="text-xs"
              style={{
                color: FASHION_DARK_COLORS.boneDim,
                letterSpacing: "0.4px",
              }}
            >
              {isFreeShipping
                ? "Unlocked"
                : `Add $${remainingForFreeShipping.toFixed(2)} more`}
            </span>
          </div>
          <div className="relative h-[26px]">
            <div
              className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2"
              style={{ backgroundColor: FASHION_DARK_COLORS.hairline }}
            />
            <div
              className="absolute left-0 top-1/2 h-px -translate-y-1/2"
              style={{
                width: `${shippingProgress}%`,
                backgroundColor: FASHION_DARK_COLORS.brass,
                transition: "width .5s cubic-bezier(.4,0,.2,1)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-between">
              {Array.from({ length: SHIPPING_TICK_COUNT }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: 1,
                    height: i % 5 === 0 ? 14 : 8,
                    backgroundColor:
                      i % 5 === 0
                        ? FASHION_DARK_COLORS.boneDim
                        : FASHION_DARK_COLORS.hairlineSoft,
                  }}
                />
              ))}
            </div>
            <div
              className="absolute"
              style={{
                left: `${shippingProgress}%`,
                top: 2,
                width: 2,
                height: 22,
                backgroundColor: FASHION_DARK_COLORS.brick,
                transform: "translateX(-1px)",
                transition: "left .5s cubic-bezier(.4,0,.2,1)",
              }}
            >
              <span
                className="absolute rounded-full"
                style={{
                  top: -4,
                  left: "50%",
                  width: 6,
                  height: 6,
                  backgroundColor: FASHION_DARK_COLORS.brick,
                  transform: "translateX(-50%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div
          className="px-6 py-[60px] text-center"
          style={{ color: FASHION_DARK_COLORS.boneDim }}
        >
          <div
            className={fashionFraunces.className}
            style={{
              fontSize: 19,
              color: FASHION_DARK_COLORS.bone,
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
                        ? `1px solid ${FASHION_DARK_COLORS.hairlineSoft}`
                        : undefined,
                  }}
                >
                  <div
                    className="relative h-16 w-16 flex-none overflow-hidden"
                    style={{
                      borderRadius: 2,
                      border: `1px solid ${FASHION_DARK_COLORS.hairline}`,
                      backgroundColor: FASHION_DARK_COLORS.ink2,
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
                            color: FASHION_DARK_COLORS.brassDim,
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
                            style={{ color: FASHION_DARK_COLORS.boneDim }}
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
                        style={{ color: FASHION_DARK_COLORS.boneDim }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div
                        className="flex items-center border"
                        style={{
                          borderColor: FASHION_DARK_COLORS.hairline,
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
                                ? FASHION_DARK_COLORS.hairline
                                : FASHION_DARK_COLORS.bone,
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
                          style={{ color: FASHION_DARK_COLORS.bone }}
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
                            color: FASHION_DARK_COLORS.boneDim,
                            fontWeight: 400,
                            marginTop: 2,
                          }}
                        >
                          ${item.price.toFixed(2)} each
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="px-6 pb-6 pt-5"
            style={{ borderTop: `1px solid ${FASHION_DARK_COLORS.hairline}` }}
          >
            <div
              className="flex flex-col text-[13.5px]"
              style={{ color: FASHION_DARK_COLORS.boneDim }}
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
                color: FASHION_DARK_COLORS.bone,
                borderTop: `1px solid ${FASHION_DARK_COLORS.hairlineSoft}`,
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
            <Link
              href="/checkout"
              onClick={onNavigate}
              className="mt-[18px] flex w-full items-center justify-center py-[15px] text-[13.5px] font-semibold uppercase transition-colors hover:bg-[#CBA470]"
              style={{
                backgroundColor: FASHION_DARK_COLORS.brass,
                color: FASHION_DARK_COLORS.ink,
                letterSpacing: "0.6px",
                borderRadius: 2,
              }}
            >
              Checkout
            </Link>
            <p
              className="mt-3 text-center text-[11.5px]"
              style={{
                color: FASHION_DARK_COLORS.boneDim,
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

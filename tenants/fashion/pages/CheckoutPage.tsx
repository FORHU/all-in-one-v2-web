"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Minus, Plus } from "lucide-react";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import {
  useLocalCartStore,
  type LocalCartItem,
} from "@/features/storefront/stores/localCart.store";
import { useBuyNowStore } from "@/features/storefront/stores/buyNow.store";
import { useLastOrderStore } from "@/features/storefront/stores/lastOrder.store";
import { useLatestAddress } from "@/features/storefront/hooks/queries/useLatestAddress";
import { useSaveAddress } from "@/features/storefront/hooks/mutations/useSaveAddress";
import { useCheckoutDirect } from "@/features/storefront/hooks/mutations/useCheckoutDirect";
import type { SaveAddressInput } from "@/features/storefront/contracts/address.contract";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { FASHION_DARK_COLORS, fashionFraunces, fashionInter } from "../theme";
import {
  SHIPPING_METHODS,
  TAX_RATE,
  PROMO_CODES,
  type ShippingMethodKey,
} from "../data/checkoutRules";

const cardStyle: React.CSSProperties = {
  backgroundColor: FASHION_DARK_COLORS.ink2,
  border: `1px solid ${FASHION_DARK_COLORS.hairline}`,
};

const inputStyle: React.CSSProperties = {
  backgroundColor: FASHION_DARK_COLORS.ink,
  border: `1px solid ${FASHION_DARK_COLORS.hairline}`,
  color: FASHION_DARK_COLORS.bone,
};

const fieldLabelStyle: React.CSSProperties = {
  color: FASHION_DARK_COLORS.boneDim,
};

const linkButtonStyle: React.CSSProperties = {
  color: FASHION_DARK_COLORS.brass,
};

const initialAddressForm: SaveAddressInput = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
};

function formatEtaRange(minDays: number, maxDays: number): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const start = new Date();
  start.setDate(start.getDate() + minDays);
  const end = new Date();
  end.setDate(end.getDate() + maxDays);
  return `${fmt(start)} – ${fmt(end)}`;
}

/**
 * Fashion — checkout page ("Review Order"). Single-page review, matched
 * exactly to a supplied mockup — replaces the previous 4-step
 * Contact/Address/Shipping/Payment wizard entirely (per explicit direction:
 * "replace the whole flow"). There is no real payment backend yet
 * (/v2/payments is unimplemented), so there's no payment step at all.
 *
 * "Place Order" IS real, though: it calls POST /v2/orders/checkout-direct
 * (see hooks/mutations/useCheckoutDirect.ts), which resolves each local
 * cart line to a real CatalogProductVariant server-side and creates a real
 * CommerceOrder — there's no persisted backend cart to check out from (the
 * cart itself is still client-only/localStorage), hence "direct". The
 * resulting order shows up for real in pages/AccountPage.tsx's Orders tab.
 * A snapshot combining the real order number/totals with the richer local
 * item display data (name/brand/imageUrl/size/color — not stored on
 * CommerceOrderItem) is still written to useLastOrderStore purely as the
 * hand-off to /order-success. Known gap: the discount-code UI below is
 * cosmetic only — checkoutDirect doesn't accept a coupon code yet, so a
 * locally "applied" code won't reduce the real order's total, and
 * tax/shipping are hardcoded to 0 on the backend (see OrderService's doc
 * comment), so the real order total won't exactly match this page's
 * client-estimated total.
 *
 * The delivery address IS real, though: GET /v2/addresses/latest and
 * POST /v2/addresses (see hooks/queries/useLatestAddress.ts and
 * hooks/mutations/useSaveAddress.ts) — every "Save Address" persists a new
 * row for the signed-in customer, and a returning customer's checkout
 * pre-fills with whichever address they saved most recently, instead of
 * asking again every time.
 *
 * Also serves the "Buy Now" flow via ?mode=buy-now: instead of reading the
 * shared multi-item cart, it reads the single item stashed in
 * useBuyNowStore by hooks/useBuyNow.ts. The two flows are fully
 * independent — placing a Buy Now order never touches or clears the real
 * cart, and vice versa.
 *
 * Fixed dark palette (Ink/Bone/Brass) regardless of the site's light/dark
 * toggle — matched exactly to a supplied mockup, same precedent as
 * CartContents.tsx.
 *
 * Gated on real auth state (useAuthStore's token) — signed-out visitors
 * are redirected to /login before checkout content ever renders (browsing
 * products/the cart itself doesn't require sign-in, only checking out
 * does). Same hasMounted-gating pattern as pages/AccountPage.tsx to avoid
 * an SSR/client hydration mismatch (the token lives in localStorage,
 * unavailable on the server).
 */
export function FashionCheckoutPage({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("mode") === "buy-now";
  const token = useAuthStore((s) => s.token);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (hasMounted && !token) router.push("/login");
  }, [hasMounted, token, router]);

  const cartItems = useLocalCartStore((s) => s.items);
  const clearCart = useLocalCartStore((s) => s.clear);
  const setCartQuantity = useLocalCartStore((s) => s.setQuantity);
  const buyNowItem = useBuyNowStore((s) => s.item);
  const clearBuyNow = useBuyNowStore((s) => s.clear);
  const setBuyNowItem = useBuyNowStore((s) => s.setItem);
  const items = isBuyNow ? (buyNowItem ? [buyNowItem] : []) : cartItems;

  const { data: latestAddress, isLoading: isLoadingAddress } = useLatestAddress(
    tenantSlug,
    hasMounted && !!token,
  );
  const { mutateAsync: saveAddressMutation, isPending: isSavingAddress } =
    useSaveAddress(tenantSlug);
  const { mutateAsync: checkoutDirectMutation, isPending: isPlacingOrder } =
    useCheckoutDirect(tenantSlug);
  const setLastOrder = useLastOrderStore((s) => s.setOrder);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] =
    useState<SaveAddressInput>(initialAddressForm);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethodKey>("standard");
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [sellerMessage, setSellerMessage] = useState("");
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

  useEffect(() => {
    if (latestAddress) {
      setAddressForm({
        fullName: latestAddress.fullName,
        phone: latestAddress.phone ?? "",
        addressLine1: latestAddress.addressLine1,
        addressLine2: latestAddress.addressLine2 ?? "",
        city: latestAddress.city,
        state: latestAddress.state ?? "",
        postalCode: latestAddress.postalCode,
        country: latestAddress.country,
      });
    }
  }, [latestAddress]);

  const setQuantity = (item: LocalCartItem, quantity: number) => {
    if (quantity <= 0) return;
    if (isBuyNow) {
      setBuyNowItem({ ...item, quantity });
    } else {
      setCartQuantity(item.id, quantity);
    }
  };

  const shippingPrice = SHIPPING_METHODS[shippingMethod].price;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = appliedDiscount
    ? (subtotal * PROMO_CODES[appliedDiscount].discountPercent) / 100
    : 0;
  const tax = (subtotal - discount + shippingPrice) * TAX_RATE;
  const total = subtotal - discount + shippingPrice + tax;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const applyDiscount = () => {
    const code = discountInput.trim().toUpperCase();
    if (!code) return;
    if (PROMO_CODES[code]) {
      setAppliedDiscount(code);
      setDiscountError(null);
      setIsEditingDiscount(false);
    } else {
      setAppliedDiscount(null);
      setDiscountError("Invalid discount code");
    }
  };

  const isAddressFormValid =
    addressForm.fullName.trim() &&
    addressForm.phone?.trim() &&
    addressForm.addressLine1.trim() &&
    addressForm.city.trim() &&
    addressForm.postalCode.trim() &&
    addressForm.country.trim();

  const handleSaveAddress = async () => {
    if (!isAddressFormValid) return;
    await saveAddressMutation(addressForm);
    setIsEditingAddress(false);
  };

  const placeOrder = async () => {
    if (!latestAddress) return;

    let order;
    try {
      order = await checkoutDirectMutation({
        items: items.map((item) => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        shippingAddressId: latestAddress.id,
      });
    } catch {
      // useSafeMutation's global MutationCache.onError already surfaced a
      // toast — nothing left to do but bail without clearing the cart.
      return;
    }

    setLastOrder({
      orderNumber: order.orderNumber,
      placedAt: order.createdAt.toISOString(),
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        imageLabel: item.imageLabel,
        imageUrl: item.imageUrl,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      })),
      shippingAddress: {
        firstName: latestAddress.fullName,
        lastName: "",
        phone: latestAddress.phone ?? undefined,
        address1: latestAddress.addressLine1,
        address2: latestAddress.addressLine2 ?? undefined,
        city: latestAddress.city,
        state: latestAddress.state ?? "",
        zip: latestAddress.postalCode,
        country: latestAddress.country,
      },
      shippingMethodKey: shippingMethod,
      subtotal: order.subtotal,
      discount: order.discountAmount,
      shipping: order.shippingAmount,
      tax: order.taxAmount,
      total: order.totalAmount,
    });
    if (isBuyNow) {
      clearBuyNow();
    } else {
      clearCart();
    }
    router.push("/order-success");
  };

  if (!hasMounted || !token) {
    return (
      <FashionStorefrontLayout>
        <div
          className="min-h-screen"
          style={{ backgroundColor: FASHION_DARK_COLORS.ink }}
        />
      </FashionStorefrontLayout>
    );
  }

  if (items.length === 0) {
    return (
      <FashionStorefrontLayout>
        <div
          className={fashionInter.className}
          style={{ backgroundColor: FASHION_DARK_COLORS.ink }}
        >
          <div
            className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center"
            style={{ color: FASHION_DARK_COLORS.bone }}
          >
            <h1
              className={fashionFraunces.className}
              style={{ fontSize: 28, fontWeight: 600 }}
            >
              {isBuyNow ? "No item selected" : "Your cart is empty"}
            </h1>
            <p
              className="text-sm"
              style={{ color: FASHION_DARK_COLORS.boneDim }}
            >
              {isBuyNow
                ? "Choose Buy Now on a product to check out here."
                : "Add something to your cart before checking out."}
            </p>
            <Link
              href="/products"
              className="rounded-2xl px-6 py-3 text-sm font-semibold uppercase transition-colors hover:bg-[#CBA470]"
              style={{
                backgroundColor: FASHION_DARK_COLORS.brass,
                color: FASHION_DARK_COLORS.ink,
                letterSpacing: "0.6px",
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </FashionStorefrontLayout>
    );
  }

  // Grouped like a marketplace's per-seller sections — this storefront has
  // no seller concept, so brand stands in for it.
  const groupsByBrand = new Map<string, LocalCartItem[]>();
  for (const item of items) {
    const key = item.brand || "Other";
    if (!groupsByBrand.has(key)) groupsByBrand.set(key, []);
    groupsByBrand.get(key)!.push(item);
  }

  return (
    <FashionStorefrontLayout>
      <div
        className={fashionInter.className}
        style={{ backgroundColor: FASHION_DARK_COLORS.ink }}
      >
        <div
          className="mx-auto max-w-4xl px-6 py-10"
          style={{ color: FASHION_DARK_COLORS.bone }}
        >
          <h1
            className={fashionFraunces.className}
            style={{ fontSize: 32, fontWeight: 600 }}
          >
            Review Order
          </h1>

          <div className="mt-7 flex flex-col gap-5">
            {/* Delivery address */}
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div
                className="flex items-center gap-2 text-xs font-bold uppercase"
                style={{
                  color: FASHION_DARK_COLORS.brass,
                  letterSpacing: "1px",
                }}
              >
                <MapPin className="h-4 w-4" />
                Delivery Address
              </div>

              {isEditingAddress ? (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className="col-span-2 flex flex-col gap-1.5 text-xs font-semibold"
                      style={fieldLabelStyle}
                    >
                      Full name
                      <input
                        value={addressForm.fullName}
                        onChange={(e) =>
                          setAddressForm((a) => ({
                            ...a,
                            fullName: e.target.value,
                          }))
                        }
                        className="h-10 rounded-lg px-3 text-sm outline-none"
                        style={inputStyle}
                      />
                    </label>
                    <label
                      className="col-span-2 flex flex-col gap-1.5 text-xs font-semibold"
                      style={fieldLabelStyle}
                    >
                      Phone
                      <input
                        value={addressForm.phone}
                        onChange={(e) =>
                          setAddressForm((a) => ({
                            ...a,
                            phone: e.target.value,
                          }))
                        }
                        className="h-10 rounded-lg px-3 text-sm outline-none"
                        style={inputStyle}
                      />
                    </label>
                    <label
                      className="col-span-2 flex flex-col gap-1.5 text-xs font-semibold"
                      style={fieldLabelStyle}
                    >
                      Address line 1
                      <input
                        value={addressForm.addressLine1}
                        onChange={(e) =>
                          setAddressForm((a) => ({
                            ...a,
                            addressLine1: e.target.value,
                          }))
                        }
                        className="h-10 rounded-lg px-3 text-sm outline-none"
                        style={inputStyle}
                      />
                    </label>
                    <label
                      className="col-span-2 flex flex-col gap-1.5 text-xs font-semibold"
                      style={fieldLabelStyle}
                    >
                      Address line 2 (optional)
                      <input
                        value={addressForm.addressLine2}
                        onChange={(e) =>
                          setAddressForm((a) => ({
                            ...a,
                            addressLine2: e.target.value,
                          }))
                        }
                        className="h-10 rounded-lg px-3 text-sm outline-none"
                        style={inputStyle}
                      />
                    </label>
                    <label
                      className="flex flex-col gap-1.5 text-xs font-semibold"
                      style={fieldLabelStyle}
                    >
                      City
                      <input
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm((a) => ({
                            ...a,
                            city: e.target.value,
                          }))
                        }
                        className="h-10 rounded-lg px-3 text-sm outline-none"
                        style={inputStyle}
                      />
                    </label>
                    <label
                      className="flex flex-col gap-1.5 text-xs font-semibold"
                      style={fieldLabelStyle}
                    >
                      State / Province
                      <input
                        value={addressForm.state}
                        onChange={(e) =>
                          setAddressForm((a) => ({
                            ...a,
                            state: e.target.value,
                          }))
                        }
                        className="h-10 rounded-lg px-3 text-sm outline-none"
                        style={inputStyle}
                      />
                    </label>
                    <label
                      className="flex flex-col gap-1.5 text-xs font-semibold"
                      style={fieldLabelStyle}
                    >
                      ZIP / Postal code
                      <input
                        value={addressForm.postalCode}
                        onChange={(e) =>
                          setAddressForm((a) => ({
                            ...a,
                            postalCode: e.target.value,
                          }))
                        }
                        className="h-10 rounded-lg px-3 text-sm outline-none"
                        style={inputStyle}
                      />
                    </label>
                    <label
                      className="flex flex-col gap-1.5 text-xs font-semibold"
                      style={fieldLabelStyle}
                    >
                      Country
                      <input
                        value={addressForm.country}
                        onChange={(e) =>
                          setAddressForm((a) => ({
                            ...a,
                            country: e.target.value,
                          }))
                        }
                        className="h-10 rounded-lg px-3 text-sm outline-none"
                        style={inputStyle}
                      />
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      disabled={!isAddressFormValid || isSavingAddress}
                      className="rounded-xl px-5 py-2.5 text-sm font-semibold uppercase disabled:opacity-40"
                      style={{
                        backgroundColor: FASHION_DARK_COLORS.brass,
                        color: FASHION_DARK_COLORS.ink,
                      }}
                    >
                      {isSavingAddress ? "Saving..." : "Save Address"}
                    </button>
                    {latestAddress && (
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="text-sm font-semibold underline"
                        style={{ color: FASHION_DARK_COLORS.boneDim }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ) : isLoadingAddress ? (
                <div
                  className="mt-3 text-sm"
                  style={{ color: FASHION_DARK_COLORS.boneDim }}
                >
                  Loading your saved address...
                </div>
              ) : latestAddress ? (
                <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="font-bold">{latestAddress.fullName}</span>
                    <span
                      className="ml-2 text-sm"
                      style={{ color: FASHION_DARK_COLORS.boneDim }}
                    >
                      {latestAddress.phone}
                    </span>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: FASHION_DARK_COLORS.boneDim }}
                    >
                      {latestAddress.addressLine1}
                      {latestAddress.addressLine2
                        ? `, ${latestAddress.addressLine2}`
                        : ""}
                      , {latestAddress.city}
                      {latestAddress.state
                        ? `, ${latestAddress.state}`
                        : ""}{" "}
                      {latestAddress.postalCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(true)}
                    className="flex-none text-sm font-semibold underline"
                    style={linkButtonStyle}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="mt-3 text-sm font-semibold underline"
                  style={linkButtonStyle}
                >
                  + Add a delivery address
                </button>
              )}
            </div>

            {/* Products ordered */}
            <div className="rounded-2xl p-6" style={cardStyle}>
              <h2 className="text-base font-bold">Products Ordered</h2>
              {[...groupsByBrand.entries()].map(([brand, brandItems]) => (
                <div key={brand} className="mt-5 first:mt-4">
                  <div
                    className="mb-2 text-sm font-bold"
                    style={{ color: FASHION_DARK_COLORS.bone }}
                  >
                    {brand}
                  </div>
                  <div
                    className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 border-b pb-2 text-[11px] font-bold uppercase sm:grid"
                    style={{
                      borderColor: FASHION_DARK_COLORS.hairline,
                      color: FASHION_DARK_COLORS.boneDim,
                    }}
                  >
                    <span>Product</span>
                    <span>Unit price</span>
                    <span>Quantity</span>
                    <span>Item subtotal</span>
                  </div>
                  {brandItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 items-center gap-3 border-b py-3 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4"
                      style={{ borderColor: FASHION_DARK_COLORS.hairlineSoft }}
                    >
                      <div className="flex items-center gap-3">
                        <ImagePlaceholder
                          imageUrl={item.imageUrl}
                          label={item.imageLabel}
                          aspect="1/1"
                          className="h-14 w-14 flex-none overflow-hidden rounded-lg"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {item.name}
                          </div>
                          {(item.size || item.color) && (
                            <div
                              className="text-xs"
                              style={{ color: FASHION_DARK_COLORS.boneDim }}
                            >
                              Variation:{" "}
                              {[item.size && `Size ${item.size}`, item.color]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          )}
                          {item.stock != null && (
                            <div
                              className="mt-0.5 text-xs"
                              style={{
                                color:
                                  item.stock - item.quantity <= 0
                                    ? FASHION_DARK_COLORS.brick
                                    : FASHION_DARK_COLORS.boneDim,
                              }}
                            >
                              {Math.max(item.stock - item.quantity, 0)} in stock
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm">${item.price.toFixed(2)}</span>
                      <div
                        className="flex flex-none items-center self-start rounded-lg border sm:self-center"
                        style={{ borderColor: FASHION_DARK_COLORS.hairline }}
                      >
                        <button
                          type="button"
                          onClick={() => setQuantity(item, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="flex h-8 w-8 items-center justify-center disabled:opacity-40"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item, item.quantity + 1)}
                          disabled={
                            item.stock != null && item.quantity >= item.stock
                          }
                          aria-label="Increase quantity"
                          className="flex h-8 w-8 items-center justify-center disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Message for sellers + shipping option */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="rounded-2xl p-6" style={cardStyle}>
                <h2 className="text-sm font-bold">Message for Sellers</h2>
                <textarea
                  value={sellerMessage}
                  onChange={(e) => setSellerMessage(e.target.value)}
                  placeholder="Please leave a message..."
                  rows={2}
                  className="mt-3 w-full resize-none rounded-lg p-3 text-sm outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="rounded-2xl p-6" style={cardStyle}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div
                      className="text-xs"
                      style={{ color: FASHION_DARK_COLORS.boneDim }}
                    >
                      Shipping option:{" "}
                      <span
                        className="font-bold"
                        style={{ color: FASHION_DARK_COLORS.bone }}
                      >
                        {formatEtaRange(
                          SHIPPING_METHODS[shippingMethod].minDays,
                          SHIPPING_METHODS[shippingMethod].maxDays,
                        )}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-bold">
                      {SHIPPING_METHODS[shippingMethod].label}
                    </div>
                  </div>
                  <div className="flex-none text-right">
                    <button
                      type="button"
                      onClick={() => setIsEditingShipping((v) => !v)}
                      className="text-sm font-semibold underline"
                      style={linkButtonStyle}
                    >
                      Change
                    </button>
                    <div
                      className="mt-1 text-sm font-bold"
                      style={{ color: FASHION_DARK_COLORS.brass }}
                    >
                      ${shippingPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
                {isEditingShipping && (
                  <div className="mt-4 flex flex-col gap-2">
                    {(Object.keys(SHIPPING_METHODS) as ShippingMethodKey[]).map(
                      (key) => {
                        const method = SHIPPING_METHODS[key];
                        const active = shippingMethod === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setShippingMethod(key);
                              setIsEditingShipping(false);
                            }}
                            className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm"
                            style={{
                              borderColor: active
                                ? FASHION_DARK_COLORS.brass
                                : FASHION_DARK_COLORS.hairline,
                            }}
                          >
                            <span>
                              {method.label} (
                              {formatEtaRange(method.minDays, method.maxDays)})
                            </span>
                            <span className="font-bold">${method.price}</span>
                          </button>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Discount code */}
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Discount Code</span>
                {appliedDiscount ? (
                  <div className="flex items-center gap-3">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: FASHION_DARK_COLORS.brass }}
                    >
                      {PROMO_CODES[appliedDiscount].label}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedDiscount(null);
                        setDiscountInput("");
                      }}
                      className="text-sm font-semibold underline"
                      style={{ color: FASHION_DARK_COLORS.boneDim }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingDiscount((v) => !v)}
                    className="text-sm font-semibold underline"
                    style={linkButtonStyle}
                  >
                    Select voucher
                  </button>
                )}
              </div>
              {isEditingDiscount && !appliedDiscount && (
                <div className="mt-3 flex flex-col gap-1.5">
                  <div className="flex gap-2">
                    <input
                      value={discountInput}
                      onChange={(e) => setDiscountInput(e.target.value)}
                      placeholder="Enter code"
                      className="h-10 flex-1 rounded-lg px-3 text-sm outline-none"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={applyDiscount}
                      className="rounded-lg px-4 text-sm font-semibold uppercase"
                      style={{
                        border: `1px solid ${FASHION_DARK_COLORS.brass}`,
                        color: FASHION_DARK_COLORS.brass,
                      }}
                    >
                      Apply
                    </button>
                  </div>
                  {discountError && (
                    <p
                      className="text-xs"
                      style={{ color: FASHION_DARK_COLORS.brick }}
                    >
                      {discountError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Totals + place order */}
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div
                className="flex flex-col gap-1.5 text-sm"
                style={{ color: FASHION_DARK_COLORS.boneDim }}
              >
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span style={{ color: FASHION_DARK_COLORS.bone }}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span style={{ color: FASHION_DARK_COLORS.bone }}>
                    ${shippingPrice.toFixed(2)}
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
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span style={{ color: FASHION_DARK_COLORS.bone }}>
                    ${tax.toFixed(2)}
                  </span>
                </div>
              </div>

              <div
                className="mt-4 flex items-center justify-between border-t pt-4"
                style={{ borderColor: FASHION_DARK_COLORS.hairline }}
              >
                <span
                  className="text-sm"
                  style={{ color: FASHION_DARK_COLORS.boneDim }}
                >
                  Order total ({itemCount} item{itemCount !== 1 ? "s" : ""}):
                </span>
                <span
                  className={fashionFraunces.className}
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    color: FASHION_DARK_COLORS.brass,
                  }}
                >
                  ${total.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={placeOrder}
                disabled={!latestAddress || isPlacingOrder}
                className="mt-4 h-12 w-full rounded-xl text-sm font-bold uppercase transition-colors hover:bg-[#CBA470] disabled:opacity-40"
                style={{
                  backgroundColor: FASHION_DARK_COLORS.brass,
                  color: FASHION_DARK_COLORS.ink,
                  letterSpacing: "0.6px",
                }}
              >
                {isPlacingOrder ? "Placing Order..." : "Place Order"}
              </button>
              {!latestAddress && (
                <p
                  className="mt-2 text-center text-xs"
                  style={{ color: FASHION_DARK_COLORS.boneDim }}
                >
                  Add a delivery address to place your order.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </FashionStorefrontLayout>
  );
}

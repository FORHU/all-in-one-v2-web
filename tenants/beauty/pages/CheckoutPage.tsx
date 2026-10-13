"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Minus, Plus } from "lucide-react";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { BeautyStorefrontLayout } from "../layouts/StorefrontLayout";
import {
  useLocalCartStore,
  type LocalCartItem,
} from "@/features/storefront/stores/localCart.store";
import { useBuyNowStore } from "@/features/storefront/stores/buyNow.store";
import { useLastOrderStore } from "@/features/storefront/stores/lastOrder.store";
import { useLatestAddress } from "@/features/storefront/hooks/queries/useLatestAddress";
import { useSaveAddress } from "@/features/storefront/hooks/mutations/useSaveAddress";
import { useCheckoutDirect } from "@/features/storefront/hooks/mutations/useCheckoutDirect";
import { useCreatePaymentIntent } from "@/features/storefront/hooks/mutations/useCreatePaymentIntent";
import { useShippingQuote } from "@/features/storefront/hooks/mutations/useShippingQuote";
import type { SaveAddressInput } from "@/features/storefront/contracts/address.contract";
import type { Order } from "@/features/storefront/contracts/order.contract";
import type { ShippingOption } from "@/features/storefront/contracts/shipping.contract";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { COUNTRY_CODES } from "@/features/storefront/constants/countryCodes";
import { StripePaymentForm } from "../components/StripePaymentForm";
import { BEAUTY_MIRROR_COLORS as COLORS } from "../theme";

const initialAddressForm: SaveAddressInput = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: COLORS.surface,
  border: `1px solid ${COLORS.panelBorder}`,
};
const inputStyle: React.CSSProperties = {
  backgroundColor: COLORS.bg,
  border: `1px solid ${COLORS.panelBorder}`,
  color: COLORS.ink,
};
const fieldLabelStyle: React.CSSProperties = { color: COLORS.muted };
const linkButtonStyle: React.CSSProperties = { color: COLORS.accentDeep };

/**
 * Beauty — checkout page ("Review Order"). Mirrors
 * tenants/fashion/pages/CheckoutPage.tsx's real flow exactly — same shared
 * hooks (useLocalCartStore/useBuyNowStore/useLatestAddress/useSaveAddress/
 * useCheckoutDirect/useCreatePaymentIntent/useShippingQuote), same
 * two-step "place a real PENDING order, then collect payment against it"
 * sequencing, same useLastOrderStore hand-off to /order-success (written
 * before rendering the Stripe form, since a 3-D Secure card can redirect
 * the browser away — see /checkout/payment-return). Stripe's
 * payment_intent.succeeded webhook is still the real source of truth that
 * flips the order to PROCESSING; handlePaymentSuccess below is UX only.
 *
 * Deliberately drops two of fashion's sections rather than copying them
 * wholesale: "Message for Sellers" (never submitted anywhere) and
 * "Discount Code" (cosmetic — checkoutDirect doesn't accept a coupon code
 * server-side, so an "applied" code wouldn't affect the real charge).
 * Everything kept here (address, shipping, payment, totals) is real.
 *
 * Also serves ?mode=buy-now the same way fashion's does, via
 * useBuyNowStore — fully independent of the shared cart.
 *
 * Gated on real auth state (useAuthStore's token); signed-out visitors are
 * redirected to /login before any content renders. hasMounted-gated since
 * the token lives in localStorage, unavailable during SSR.
 */
export function BeautyCheckoutPage({ tenantSlug }: { tenantSlug: string }) {
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
  const setCartQuantity = useLocalCartStore((s) => s.setQuantity);
  const buyNowItem = useBuyNowStore((s) => s.item);
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
  const {
    mutateAsync: createPaymentIntentMutation,
    isPending: isCreatingIntent,
  } = useCreatePaymentIntent(tenantSlug);
  const { mutateAsync: requestShippingQuote, isPending: isLoadingShipping } =
    useShippingQuote(tenantSlug);
  const setLastOrder = useLastOrderStore((s) => s.setOrder);

  const [order, setOrder] = useState<Order | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] =
    useState<SaveAddressInput>(initialAddressForm);

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] =
    useState<ShippingOption | null>(null);
  const [shippingQuoteId, setShippingQuoteId] = useState<string | null>(null);
  const [isEditingShipping, setIsEditingShipping] = useState(false);

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

  const itemsSignature = items
    .map((i) => `${i.productId}:${i.size ?? ""}:${i.color ?? ""}:${i.quantity}`)
    .join("|");

  useEffect(() => {
    if (!latestAddress || items.length === 0) return;

    const previousLogisticName = selectedShipping?.logisticName ?? null;

    setShippingOptions([]);
    setSelectedShipping(null);
    setShippingQuoteId(null);

    let cancelled = false;
    requestShippingQuote({
      items: items.map((item) => ({
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      })),
      countryCode: latestAddress.country,
      zip: latestAddress.postalCode,
    })
      .then((quote) => {
        if (cancelled) return;
        setShippingOptions(quote.options);
        setShippingQuoteId(quote.quoteId);
        const stillAvailable = previousLogisticName
          ? quote.options.find((o) => o.logisticName === previousLogisticName)
          : undefined;
        setSelectedShipping(stillAvailable ?? quote.options[0] ?? null);
      })
      .catch(() => {
        // useSafeMutation's global MutationCache.onError already surfaced a
        // toast — leave shippingOptions empty so the total simply shows $0
        // shipping rather than a stale/mismatched price.
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- itemsSignature stands in for items' identity; selectedShipping is read once at effect-start on purpose, not a reactive dependency.
  }, [latestAddress?.id, itemsSignature, requestShippingQuote]);

  const setQuantity = (item: LocalCartItem, quantity: number) => {
    if (quantity <= 0) return;
    if (isBuyNow) {
      setBuyNowItem({ ...item, quantity });
    } else {
      setCartQuantity(item.id, quantity);
    }
  };

  const shippingPrice = selectedShipping?.price ?? 0;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + shippingPrice;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

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

    let placedOrder = order;
    if (!placedOrder) {
      try {
        placedOrder = await checkoutDirectMutation({
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
          shippingAddressId: latestAddress.id,
          shippingQuoteId: shippingQuoteId ?? undefined,
          shippingLogisticName: selectedShipping?.logisticName,
        });
      } catch {
        return;
      }
      setOrder(placedOrder);
    }

    let intent;
    try {
      intent = await createPaymentIntentMutation({
        orderId: placedOrder.id,
        channel: "CARD",
      });
    } catch {
      return;
    }

    setLastOrder({
      orderNumber: placedOrder.orderNumber,
      placedAt: placedOrder.createdAt.toISOString(),
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
      shippingMethod: selectedShipping ?? {
        logisticName: "Standard Shipping",
        price: 0,
      },
      subtotal: placedOrder.subtotal,
      discount: placedOrder.discountAmount,
      shipping: placedOrder.shippingAmount,
      tax: placedOrder.taxAmount,
      total: placedOrder.totalAmount,
    });

    setClientSecret(intent.clientSecret);
  };

  const selectCard = () => {
    if (clientSecret) return;
    void placeOrder();
  };

  const handlePaymentSuccess = () => {
    router.push("/order-success");
  };

  if (!hasMounted || !token) {
    return (
      <BeautyStorefrontLayout>
        <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }} />
      </BeautyStorefrontLayout>
    );
  }

  if (items.length === 0) {
    return (
      <BeautyStorefrontLayout>
        <div style={{ backgroundColor: COLORS.bg }}>
          <div
            className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center"
            style={{ color: COLORS.ink }}
          >
            <h1
              style={{
                fontSize: 28,
                fontWeight: 600,
                fontFamily: "var(--font-heading)",
              }}
            >
              {isBuyNow ? "No item selected" : "Your bag is empty"}
            </h1>
            <p className="text-sm" style={{ color: COLORS.muted }}>
              {isBuyNow
                ? "Choose Buy Now on a product to check out here."
                : "Add something to your bag before checking out."}
            </p>
            <Link
              href="/categories"
              className="rounded-2xl px-6 py-3 text-sm font-semibold uppercase tracking-wide"
              style={{ backgroundColor: COLORS.ink, color: COLORS.accentInk }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </BeautyStorefrontLayout>
    );
  }

  const groupsByBrand = new Map<string, LocalCartItem[]>();
  for (const item of items) {
    const key = item.brand || "Other";
    if (!groupsByBrand.has(key)) groupsByBrand.set(key, []);
    groupsByBrand.get(key)!.push(item);
  }

  return (
    <BeautyStorefrontLayout>
      <div style={{ backgroundColor: COLORS.bg }}>
        <div
          className="mx-auto max-w-4xl px-6 py-10"
          style={{ color: COLORS.ink }}
        >
          <h1
            style={{
              fontSize: 32,
              fontWeight: 600,
              fontFamily: "var(--font-heading)",
            }}
          >
            Review Order
          </h1>

          <div className="mt-7 flex flex-col gap-5">
            {/* Delivery address */}
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div
                className="flex items-center gap-2 text-xs font-bold uppercase"
                style={{ color: COLORS.accentDeep, letterSpacing: "1px" }}
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
                      <select
                        value={addressForm.country}
                        onChange={(e) =>
                          setAddressForm((a) => ({
                            ...a,
                            country: e.target.value,
                          }))
                        }
                        className="h-10 rounded-lg px-3 text-sm outline-none"
                        style={inputStyle}
                      >
                        {COUNTRY_CODES.map(({ code, name }) => (
                          <option key={code} value={code}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      disabled={!isAddressFormValid || isSavingAddress}
                      className="rounded-xl px-5 py-2.5 text-sm font-semibold uppercase disabled:opacity-40"
                      style={{
                        backgroundColor: COLORS.ink,
                        color: COLORS.accentInk,
                      }}
                    >
                      {isSavingAddress ? "Saving..." : "Save Address"}
                    </button>
                    {latestAddress && (
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="text-sm font-semibold underline"
                        style={{ color: COLORS.muted }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ) : isLoadingAddress ? (
                <div className="mt-3 text-sm" style={{ color: COLORS.muted }}>
                  Loading your saved address...
                </div>
              ) : latestAddress ? (
                <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="font-bold">{latestAddress.fullName}</span>
                    <span
                      className="ml-2 text-sm"
                      style={{ color: COLORS.muted }}
                    >
                      {latestAddress.phone}
                    </span>
                    <p className="mt-1 text-sm" style={{ color: COLORS.muted }}>
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
                  <div className="mb-2 text-sm font-bold">{brand}</div>
                  <div
                    className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 border-b pb-2 text-[11px] font-bold uppercase sm:grid"
                    style={{
                      borderColor: COLORS.hairline,
                      color: COLORS.muted,
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
                      style={{ borderColor: COLORS.hairline }}
                    >
                      <div className="flex items-center gap-3">
                        <ImagePlaceholder
                          imageUrl={item.imageUrl}
                          label={item.imageLabel}
                          aspect="1/1"
                          className="h-14 w-14 flex-none overflow-hidden rounded-lg text-current"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {item.name}
                          </div>
                          {(item.size || item.color) && (
                            <div
                              className="text-xs"
                              style={{ color: COLORS.muted }}
                            >
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
                                    ? "#B3473D"
                                    : COLORS.muted,
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
                        style={{ borderColor: COLORS.panelBorder }}
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

            {/* Shipping option */}
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs" style={{ color: COLORS.muted }}>
                    Shipping option
                    {selectedShipping?.aging ? (
                      <>
                        :{" "}
                        <span className="font-bold">
                          {selectedShipping.aging}
                        </span>
                      </>
                    ) : null}
                  </div>
                  <div className="mt-1 text-sm font-bold">
                    {isLoadingShipping
                      ? "Calculating shipping…"
                      : (selectedShipping?.logisticName ??
                        "Enter an address to see shipping options")}
                  </div>
                </div>
                {shippingOptions.length > 0 && (
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
                      style={{ color: COLORS.accentDeep }}
                    >
                      ${shippingPrice.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
              {isEditingShipping && shippingOptions.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  {shippingOptions.map((option) => {
                    const active =
                      selectedShipping?.logisticName === option.logisticName;
                    return (
                      <button
                        key={option.logisticName}
                        type="button"
                        onClick={() => {
                          setSelectedShipping(option);
                          setIsEditingShipping(false);
                        }}
                        className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm"
                        style={{
                          borderColor: active
                            ? COLORS.accentDeep
                            : COLORS.panelBorder,
                        }}
                      >
                        <span>
                          {option.logisticName}
                          {option.aging ? ` (${option.aging})` : ""}
                        </span>
                        <span className="font-bold">
                          ${option.price.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="rounded-2xl p-6" style={cardStyle}>
              <h2 className="text-sm font-bold">Payment Method</h2>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={selectCard}
                  disabled={isPlacingOrder || isCreatingIntent}
                  className="w-full rounded-lg border px-4 py-3 text-left text-sm disabled:opacity-60"
                  style={{ borderColor: COLORS.accentDeep }}
                >
                  <span className="font-semibold">Card</span>
                  <p className="mt-0.5 text-xs" style={{ color: COLORS.muted }}>
                    Pay now with credit or debit card
                  </p>
                </button>
              </div>

              {!clientSecret && isCreatingIntent && (
                <p className="mt-4 text-sm" style={{ color: COLORS.muted }}>
                  Preparing payment form...
                </p>
              )}

              {clientSecret && order && (
                <div className="mt-4">
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    returnUrl={`${window.location.origin}/checkout/payment-return?orderId=${order.id}`}
                    onSuccess={handlePaymentSuccess}
                  />
                </div>
              )}
            </div>

            {/* Totals + place order */}
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div
                className="flex flex-col gap-1.5 text-sm"
                style={{ color: COLORS.muted }}
              >
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span style={{ color: COLORS.ink }}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span style={{ color: COLORS.ink }}>
                    ${shippingPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div
                className="mt-4 flex items-center justify-between border-t pt-4"
                style={{ borderColor: COLORS.hairline }}
              >
                <span className="text-sm" style={{ color: COLORS.muted }}>
                  Order total ({itemCount} item{itemCount !== 1 ? "s" : ""}):
                </span>
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    fontFamily: "var(--font-heading)",
                    color: COLORS.accentDeep,
                  }}
                >
                  ${total.toFixed(2)}
                </span>
              </div>

              {!clientSecret && (
                <>
                  <button
                    type="button"
                    onClick={() => placeOrder()}
                    disabled={
                      !latestAddress ||
                      isPlacingOrder ||
                      isCreatingIntent ||
                      (!order && (isLoadingShipping || !shippingQuoteId))
                    }
                    className="mt-4 h-12 w-full rounded-xl text-sm font-bold uppercase tracking-wide disabled:opacity-40"
                    style={{
                      backgroundColor: COLORS.ink,
                      color: COLORS.accentInk,
                    }}
                  >
                    {isPlacingOrder
                      ? "Placing Order..."
                      : isCreatingIntent
                        ? "Please wait..."
                        : !order && isLoadingShipping
                          ? "Calculating shipping..."
                          : order
                            ? "Continue to Payment"
                            : "Place Order"}
                  </button>
                  {!latestAddress && (
                    <p
                      className="mt-2 text-center text-xs"
                      style={{ color: COLORS.muted }}
                    >
                      Add a delivery address to place your order.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </BeautyStorefrontLayout>
  );
}

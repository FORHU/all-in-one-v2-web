"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Lock, RotateCcw, ShieldCheck } from "lucide-react";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
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
import { ElectronicsStorefrontLayout } from "../layouts/StorefrontLayout";
import { StripePaymentForm } from "../components/StripePaymentForm";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";

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
  backgroundColor: COLORS.cardBg,
  border: `1px solid ${COLORS.border}`,
};
const inputStyle: React.CSSProperties = {
  backgroundColor: COLORS.cardBg,
  border: `1px solid ${COLORS.borderStrong}`,
  color: COLORS.ink,
};

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function StepHeading({
  step,
  title,
  done,
  action,
}: {
  step: number;
  title: string;
  done?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold"
          style={{ backgroundColor: COLORS.accent, color: COLORS.accentInk }}
        >
          {done ? <Check className="h-4 w-4" strokeWidth={3} /> : step}
        </span>
        <h2
          className="text-lg font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  className = "",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  autoComplete?: string;
}) {
  return (
    <label
      className={`flex flex-col gap-1.5 text-xs font-semibold ${className}`}
      style={{ color: COLORS.muted }}
    >
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="h-11 rounded-xl px-3.5 text-sm outline-none"
        style={inputStyle}
      />
    </label>
  );
}

/**
 * DigitFriend — checkout page. Same real flow as
 * tenants/beauty/pages/CheckoutPage.tsx (and fashion's before it): the
 * shared useLatestAddress/useSaveAddress/useShippingQuote/useCheckoutDirect/
 * useCreatePaymentIntent hooks, the two-step "place a real PENDING order,
 * then collect payment against it" sequencing, and the useLastOrderStore
 * hand-off to /order-success (written before rendering the Stripe form,
 * since a 3-D Secure card can redirect the browser away — see
 * /checkout/payment-return). Stripe's payment_intent.succeeded webhook is
 * still the real source of truth that flips the order to PROCESSING;
 * handlePaymentSuccess below is UX only.
 *
 * Laid out as numbered steps (address → shipping → payment) beside a sticky
 * order summary, matching the PDP's white-card-on-cream look. Cart lines
 * are read-only here (edit them on /cart) — and address/shipping lock once
 * the order is placed — so what Stripe charges can never drift from the
 * order checkoutDirect already created.
 *
 * Also serves ?mode=buy-now (the PDP's "Checkout" button) via
 * useBuyNowStore — a single item, fully independent of the shared cart. The
 * mode is carried through to /order-success (and the 3-D Secure return
 * URL) so only what was actually bought gets cleared.
 *
 * Gated on real auth state (useAuthStore's token); signed-out visitors are
 * redirected to /login before any content renders. hasMounted-gated since
 * the token lives in localStorage, unavailable during SSR.
 */
export function ElectronicsCheckoutPage({
  tenantSlug,
}: {
  tenantSlug: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("mode") === "buy-now";
  const modeQuery = isBuyNow ? "mode=buy-now" : "";
  const token = useAuthStore((s) => s.token);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (hasMounted && !token) router.push("/login");
  }, [hasMounted, token, router]);

  const cartItems = useLocalCartStore((s) => s.items);
  const buyNowItem = useBuyNowStore((s) => s.item);
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

  const shippingPrice = selectedShipping?.price ?? 0;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + shippingPrice;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const isLocked = order !== null;

  const isAddressFormValid =
    addressForm.fullName.trim() &&
    addressForm.phone?.trim() &&
    addressForm.addressLine1.trim() &&
    addressForm.city.trim() &&
    addressForm.postalCode.trim() &&
    addressForm.country.trim();

  const updateAddressField =
    (field: keyof SaveAddressInput) => (value: string) =>
      setAddressForm((a) => ({ ...a, [field]: value }));

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

  const handlePaymentSuccess = () => {
    router.push(`/order-success${modeQuery ? `?${modeQuery}` : ""}`);
  };

  if (!hasMounted || !token) {
    return (
      <ElectronicsStorefrontLayout>
        <div className="min-h-[60vh]" />
      </ElectronicsStorefrontLayout>
    );
  }

  if (items.length === 0 && !order) {
    return (
      <ElectronicsStorefrontLayout>
        <div className="mx-auto max-w-2xl px-6 py-16 sm:px-10">
          <div
            className="flex flex-col items-center gap-3 rounded-[22px] px-6 py-20 text-center"
            style={{
              backgroundColor: COLORS.cardBg,
              border: `1px dashed ${COLORS.borderStrong}`,
            }}
          >
            <p
              className="text-lg font-bold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {isBuyNow ? "No item selected" : "Nothing to check out"}
            </p>
            <p className="text-sm" style={{ color: COLORS.muted }}>
              {isBuyNow
                ? "Choose Checkout on a product to buy it here."
                : "Add something to your cart first."}
            </p>
            <Link
              href="/#shop"
              className="mt-2 rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: COLORS.ink }}
            >
              Browse the shop
            </Link>
          </div>
        </div>
      </ElectronicsStorefrontLayout>
    );
  }

  const placeOrderDisabled =
    !latestAddress ||
    isEditingAddress ||
    isPlacingOrder ||
    isCreatingIntent ||
    (!order && (isLoadingShipping || !shippingQuoteId));

  const placeOrderLabel = isPlacingOrder
    ? "Placing order..."
    : isCreatingIntent
      ? "Preparing payment..."
      : !order && isLoadingShipping
        ? "Calculating shipping..."
        : order
          ? "Continue to payment"
          : `Place order · ${money(total)}`;

  return (
    <ElectronicsStorefrontLayout>
      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
        <nav
          className="flex items-center gap-2 text-xs"
          style={{ color: COLORS.muted }}
        >
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          {!isBuyNow && (
            <>
              <Link href="/cart" className="hover:underline">
                Cart
              </Link>
              <span aria-hidden="true">/</span>
            </>
          )}
          <span style={{ color: COLORS.ink }}>Checkout</span>
        </nav>

        <h1
          className="mt-4 text-3xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Checkout
        </h1>

        <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* ── Steps ─────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* 1. Delivery address */}
            <section className="rounded-[22px] p-6" style={cardStyle}>
              <StepHeading
                step={1}
                title="Delivery address"
                done={!!latestAddress && !isEditingAddress}
                action={
                  latestAddress &&
                  !isEditingAddress &&
                  !isLocked && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(true)}
                      className="text-sm font-semibold underline"
                    >
                      Change
                    </button>
                  )
                }
              />

              {isEditingAddress ? (
                <div className="mt-5 flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <TextField
                      label="Full name"
                      value={addressForm.fullName}
                      onChange={updateAddressField("fullName")}
                      autoComplete="name"
                    />
                    <TextField
                      label="Phone"
                      value={addressForm.phone ?? ""}
                      onChange={updateAddressField("phone")}
                      autoComplete="tel"
                    />
                    <TextField
                      label="Address line 1"
                      value={addressForm.addressLine1}
                      onChange={updateAddressField("addressLine1")}
                      autoComplete="address-line1"
                      className="sm:col-span-2"
                    />
                    <TextField
                      label="Address line 2 (optional)"
                      value={addressForm.addressLine2 ?? ""}
                      onChange={updateAddressField("addressLine2")}
                      autoComplete="address-line2"
                      className="sm:col-span-2"
                    />
                    <TextField
                      label="City"
                      value={addressForm.city}
                      onChange={updateAddressField("city")}
                      autoComplete="address-level2"
                    />
                    <TextField
                      label="State / Province"
                      value={addressForm.state ?? ""}
                      onChange={updateAddressField("state")}
                      autoComplete="address-level1"
                    />
                    <TextField
                      label="ZIP / Postal code"
                      value={addressForm.postalCode}
                      onChange={updateAddressField("postalCode")}
                      autoComplete="postal-code"
                    />
                    <label
                      className="flex flex-col gap-1.5 text-xs font-semibold"
                      style={{ color: COLORS.muted }}
                    >
                      Country
                      <select
                        value={addressForm.country}
                        onChange={(e) =>
                          updateAddressField("country")(e.target.value)
                        }
                        autoComplete="country"
                        className="h-11 rounded-xl px-3 text-sm outline-none"
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
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      disabled={!isAddressFormValid || isSavingAddress}
                      className="h-11 rounded-xl px-6 text-sm font-bold text-white disabled:opacity-40"
                      style={{ backgroundColor: COLORS.ink }}
                    >
                      {isSavingAddress ? "Saving..." : "Save address"}
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
                <p className="mt-4 text-sm" style={{ color: COLORS.muted }}>
                  Loading your saved address...
                </p>
              ) : latestAddress ? (
                <div
                  className="mt-4 rounded-xl p-4 text-sm"
                  style={{ backgroundColor: COLORS.bg }}
                >
                  <div className="font-semibold">
                    {latestAddress.fullName}
                    {latestAddress.phone && (
                      <span
                        className="ml-2 font-normal"
                        style={{ color: COLORS.muted }}
                      >
                        {latestAddress.phone}
                      </span>
                    )}
                  </div>
                  <p className="mt-1" style={{ color: COLORS.muted }}>
                    {latestAddress.addressLine1}
                    {latestAddress.addressLine2
                      ? `, ${latestAddress.addressLine2}`
                      : ""}
                    , {latestAddress.city}
                    {latestAddress.state ? `, ${latestAddress.state}` : ""}{" "}
                    {latestAddress.postalCode}, {latestAddress.country}
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="mt-4 flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold"
                  style={{ border: `1px dashed ${COLORS.borderStrong}` }}
                >
                  + Add a delivery address
                </button>
              )}
            </section>

            {/* 2. Shipping method */}
            <section className="rounded-[22px] p-6" style={cardStyle}>
              <StepHeading
                step={2}
                title="Shipping method"
                done={!!selectedShipping}
              />
              <div className="mt-4">
                {!latestAddress ? (
                  <p className="text-sm" style={{ color: COLORS.muted }}>
                    Add a delivery address to see shipping options.
                  </p>
                ) : isLoadingShipping ? (
                  <p className="text-sm" style={{ color: COLORS.muted }}>
                    Calculating shipping...
                  </p>
                ) : shippingOptions.length === 0 ? (
                  <p className="text-sm" style={{ color: COLORS.muted }}>
                    No shipping options are available for this address.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2" role="radiogroup">
                    {shippingOptions.map((option) => {
                      const active =
                        selectedShipping?.logisticName === option.logisticName;
                      return (
                        <button
                          key={option.logisticName}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          disabled={isLocked}
                          onClick={() => setSelectedShipping(option)}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm disabled:cursor-not-allowed"
                          style={{
                            border: `1.5px solid ${active ? COLORS.ink : COLORS.border}`,
                            opacity: isLocked && !active ? 0.5 : 1,
                          }}
                        >
                          <span
                            className="flex h-4 w-4 flex-none items-center justify-center rounded-full"
                            style={{
                              border: `1.5px solid ${active ? COLORS.ink : COLORS.borderStrong}`,
                            }}
                          >
                            {active && (
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: COLORS.ink }}
                              />
                            )}
                          </span>
                          <span className="flex-1">
                            <span className="block font-semibold">
                              {option.logisticName}
                            </span>
                            {option.aging && (
                              <span
                                className="block text-xs"
                                style={{ color: COLORS.muted }}
                              >
                                {option.aging}
                              </span>
                            )}
                          </span>
                          <span className="font-bold">
                            {option.price === 0 ? "Free" : money(option.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* 3. Payment */}
            <section className="rounded-[22px] p-6" style={cardStyle}>
              <StepHeading step={3} title="Payment" />
              <div className="mt-4">
                {clientSecret && order ? (
                  <>
                    <p className="mb-4 text-sm" style={{ color: COLORS.muted }}>
                      Order{" "}
                      <span
                        className="font-semibold"
                        style={{ color: COLORS.ink }}
                      >
                        #{order.orderNumber}
                      </span>{" "}
                      is reserved — enter your card to complete it.
                    </p>
                    <StripePaymentForm
                      clientSecret={clientSecret}
                      returnUrl={`${window.location.origin}/checkout/payment-return?orderId=${order.id}${modeQuery ? `&${modeQuery}` : ""}`}
                      submitLabel={`Pay ${money(order.totalAmount)}`}
                      onSuccess={handlePaymentSuccess}
                    />
                  </>
                ) : (
                  <div
                    className="flex items-start gap-3 rounded-xl p-4 text-sm"
                    style={{ backgroundColor: COLORS.bg, color: COLORS.muted }}
                  >
                    <Lock
                      className="mt-0.5 h-4 w-4 flex-none"
                      style={{ color: COLORS.ink }}
                    />
                    <span>
                      Pay securely by credit or debit card. Card details are
                      entered after you place your order and are handled by
                      Stripe — never stored by DigitFriend.
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ── Order summary ─────────────────────────────────────────── */}
          <aside
            className="rounded-[22px] p-6 lg:sticky lg:top-6"
            style={cardStyle}
          >
            <div className="flex items-baseline justify-between">
              <h2
                className="text-lg font-bold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Order summary
              </h2>
              {!isLocked && !isBuyNow && (
                <Link
                  href="/cart"
                  className="text-xs font-semibold underline"
                  style={{ color: COLORS.muted }}
                >
                  Edit cart
                </Link>
              )}
            </div>

            <ul className="mt-4 flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative flex-none">
                    <ImagePlaceholder
                      imageUrl={item.imageUrl}
                      label={item.imageLabel}
                      aspect="1/1"
                      className="h-16 w-16 overflow-hidden rounded-xl text-[10px]"
                    />
                    <span
                      className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold"
                      style={{
                        backgroundColor: COLORS.accent,
                        color: COLORS.accentInk,
                      }}
                    >
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-sm font-semibold leading-snug">
                      {item.name}
                    </div>
                    {(item.color || item.size) && (
                      <div
                        className="mt-0.5 text-xs"
                        style={{ color: COLORS.muted }}
                      >
                        {[item.color, item.size].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                  <div className="flex-none text-sm font-bold">
                    {money(item.price * item.quantity)}
                  </div>
                </li>
              ))}
            </ul>

            <div
              className="mt-5 flex flex-col gap-2 border-t pt-4 text-sm"
              style={{ borderColor: COLORS.border, color: COLORS.muted }}
            >
              <div className="flex justify-between">
                <span>
                  Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                </span>
                <span style={{ color: COLORS.ink }}>{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span style={{ color: COLORS.ink }}>
                  {selectedShipping
                    ? shippingPrice === 0
                      ? "Free"
                      : money(shippingPrice)
                    : "—"}
                </span>
              </div>
            </div>

            <div
              className="mt-4 flex items-baseline justify-between border-t pt-4"
              style={{ borderColor: COLORS.border }}
            >
              <span className="text-sm font-semibold">Total</span>
              <span
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {money(order ? order.totalAmount : total)}
              </span>
            </div>

            {!clientSecret && (
              <>
                <button
                  type="button"
                  onClick={() => placeOrder()}
                  disabled={placeOrderDisabled}
                  className="mt-5 flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold text-white disabled:opacity-40"
                  style={{ backgroundColor: COLORS.ink }}
                >
                  {placeOrderLabel}
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

            <ul
              className="mt-5 flex flex-col gap-2.5 border-t pt-4 text-xs"
              style={{ borderColor: COLORS.border, color: COLORS.muted }}
            >
              {[
                { Icon: Lock, text: "Secure checkout with Stripe" },
                { Icon: ShieldCheck, text: "Extended warranty included" },
                { Icon: RotateCcw, text: "30-day no-hassle returns" },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5">
                  <span
                    className="flex h-6 w-6 flex-none items-center justify-center rounded-md"
                    style={{ backgroundColor: COLORS.accent }}
                  >
                    <Icon
                      className="h-3.5 w-3.5"
                      style={{ color: COLORS.accentInk }}
                    />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </ElectronicsStorefrontLayout>
  );
}

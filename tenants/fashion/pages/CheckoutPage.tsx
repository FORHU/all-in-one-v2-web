"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { CheckoutStep } from "../components/CheckoutStep";
import { CheckoutOrderSummary } from "../components/CheckoutOrderSummary";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useLastOrderStore } from "@/features/storefront/stores/lastOrder.store";
import {
  SHIPPING_METHODS,
  TAX_RATE,
  PROMO_CODES,
  type ShippingMethodKey,
} from "../data/checkoutRules";

type PaymentTab = "card" | "paypal" | "applepay";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialAddress = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
  phone: "",
};

const initialCard = { number: "", expiry: "", cvc: "", name: "" };

/**
 * Fashion — checkout page.
 * There is no real payment/order backend yet — /v2/orders and /v2/payments
 * are both unimplemented (features/storefront/api/checkout.client.ts always
 * throws), and no Stripe/PayPal/Apple Pay SDK is installed. "Place Order"
 * is therefore a UI-only demo: it validates the form, snapshots the order
 * into useLastOrderStore, clears the local cart, and navigates to
 * /order-success — which says explicitly that this is a demo rather than
 * pretending a real transaction happened.
 */
export function FashionCheckoutPage() {
  const router = useRouter();
  const items = useLocalCartStore((s) => s.items);
  const clearCart = useLocalCartStore((s) => s.clear);
  const setLastOrder = useLastOrderStore((s) => s.setOrder);

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [address, setAddress] = useState(initialAddress);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethodKey>("standard");
  const [paymentTab, setPaymentTab] = useState<PaymentTab>("card");
  const [card, setCard] = useState(initialCard);

  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const isEmailValid = EMAIL_PATTERN.test(email);
  const isAddressValid =
    address.firstName.trim() &&
    address.lastName.trim() &&
    address.address1.trim() &&
    address.city.trim() &&
    address.state.trim() &&
    address.zip.trim() &&
    address.country.trim();
  const isCardValid =
    paymentTab !== "card" ||
    (card.number.trim() &&
      card.expiry.trim() &&
      card.cvc.trim() &&
      card.name.trim());

  const shippingPrice = SHIPPING_METHODS[shippingMethod].price;

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = appliedDiscount
    ? (subtotal * PROMO_CODES[appliedDiscount].discountPercent) / 100
    : 0;
  const tax = (subtotal - discount + shippingPrice) * TAX_RATE;
  const total = subtotal - discount + shippingPrice + tax;

  const applyDiscount = () => {
    const code = discountInput.trim().toUpperCase();
    if (!code) return;
    if (PROMO_CODES[code]) {
      setAppliedDiscount(code);
      setDiscountError(null);
    } else {
      setAppliedDiscount(null);
      setDiscountError("Invalid discount code");
    }
  };

  const placeOrder = () => {
    const orderNumber = `ADD-${Math.floor(10000 + Math.random() * 90000)}`;
    setLastOrder({
      orderNumber,
      placedAt: new Date().toISOString(),
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        imageLabel: item.imageLabel,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      })),
      shippingAddress: {
        firstName: address.firstName,
        lastName: address.lastName,
        address1: address.address1,
        address2: address.address2 || undefined,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
      },
      shippingMethodKey: shippingMethod,
      subtotal,
      discount,
      shipping: shippingPrice,
      tax,
      total,
    });
    clearCart();
    router.push("/order-success");
  };

  if (items.length === 0) {
    return (
      <FashionStorefrontLayout>
        <div
          className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center"
          style={{ color: "var(--brand-primary)" }}
        >
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Your cart is empty
          </h1>
          <p className="text-sm opacity-60">
            Add something to your cart before checking out.
          </p>
          <Link
            href="/products"
            className="rounded-2xl px-6 py-3 text-sm font-semibold"
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "var(--brand-secondary)",
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </FashionStorefrontLayout>
    );
  }

  return (
    <FashionStorefrontLayout>
      <div
        className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[1fr_380px]"
        style={{ color: "var(--brand-primary)" }}
      >
        <div>
          <h1
            className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Checkout
          </h1>

          <div>
            <CheckoutStep
              stepNumber={1}
              title="Contact"
              isActive={step === 1}
              isCompleted={step > 1}
              summary={email}
              onEdit={() => setStep(1)}
            >
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                  Email
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                  />
                </label>
                <button
                  type="button"
                  disabled={!isEmailValid}
                  onClick={() => setStep(2)}
                  className="self-start rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-40"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                    color: "var(--brand-secondary)",
                  }}
                >
                  Continue to Shipping
                </button>
              </div>
            </CheckoutStep>

            <CheckoutStep
              stepNumber={2}
              title="Shipping Address"
              isActive={step === 2}
              isCompleted={step > 2}
              summary={
                isAddressValid
                  ? `${address.firstName} ${address.lastName}, ${address.address1}, ${address.city}, ${address.state} ${address.zip}`
                  : undefined
              }
              onEdit={() => setStep(2)}
            >
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                  First name
                  <input
                    autoComplete="given-name"
                    value={address.firstName}
                    onChange={(event) =>
                      setAddress((a) => ({
                        ...a,
                        firstName: event.target.value,
                      }))
                    }
                    className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                  Last name
                  <input
                    autoComplete="family-name"
                    value={address.lastName}
                    onChange={(event) =>
                      setAddress((a) => ({
                        ...a,
                        lastName: event.target.value,
                      }))
                    }
                    className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                  />
                </label>
                <label className="col-span-2 flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                  Address line 1
                  <input
                    autoComplete="address-line1"
                    value={address.address1}
                    onChange={(event) =>
                      setAddress((a) => ({
                        ...a,
                        address1: event.target.value,
                      }))
                    }
                    className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                  />
                </label>
                <label className="col-span-2 flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                  Address line 2 (optional)
                  <input
                    autoComplete="address-line2"
                    value={address.address2}
                    onChange={(event) =>
                      setAddress((a) => ({
                        ...a,
                        address2: event.target.value,
                      }))
                    }
                    className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                  City
                  <input
                    autoComplete="address-level2"
                    value={address.city}
                    onChange={(event) =>
                      setAddress((a) => ({ ...a, city: event.target.value }))
                    }
                    className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                  State / Province
                  <input
                    autoComplete="address-level1"
                    value={address.state}
                    onChange={(event) =>
                      setAddress((a) => ({ ...a, state: event.target.value }))
                    }
                    className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                  ZIP / Postal code
                  <input
                    autoComplete="postal-code"
                    value={address.zip}
                    onChange={(event) =>
                      setAddress((a) => ({ ...a, zip: event.target.value }))
                    }
                    className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                  Country
                  <input
                    autoComplete="country-name"
                    value={address.country}
                    onChange={(event) =>
                      setAddress((a) => ({ ...a, country: event.target.value }))
                    }
                    className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                  />
                </label>
                <label className="col-span-2 flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                  Phone (optional)
                  <input
                    autoComplete="tel"
                    value={address.phone}
                    onChange={(event) =>
                      setAddress((a) => ({ ...a, phone: event.target.value }))
                    }
                    className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                  />
                </label>
              </div>
              <button
                type="button"
                disabled={!isAddressValid}
                onClick={() => setStep(3)}
                className="mt-4 self-start rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-40"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "var(--brand-secondary)",
                }}
              >
                Continue to Shipping Method
              </button>
            </CheckoutStep>

            <CheckoutStep
              stepNumber={3}
              title="Shipping Method"
              isActive={step === 3}
              isCompleted={step > 3}
              summary={`${SHIPPING_METHODS[shippingMethod].label} — $${SHIPPING_METHODS[shippingMethod].price}`}
              onEdit={() => setStep(3)}
            >
              <div className="flex flex-col gap-3">
                {(Object.keys(SHIPPING_METHODS) as ShippingMethodKey[]).map(
                  (key) => {
                    const method = SHIPPING_METHODS[key];
                    const active = shippingMethod === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setShippingMethod(key)}
                        className="flex items-center justify-between rounded-xl border px-4 py-3.5 text-left"
                        style={{
                          borderColor: active
                            ? "var(--brand-primary)"
                            : "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
                        }}
                      >
                        <div>
                          <div className="text-sm font-semibold">
                            {method.label}
                          </div>
                          <div className="text-xs opacity-60">{method.eta}</div>
                        </div>
                        <div className="text-sm font-bold">${method.price}</div>
                      </button>
                    );
                  },
                )}
              </div>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="mt-4 self-start rounded-xl px-6 py-3 text-sm font-semibold"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "var(--brand-secondary)",
                }}
              >
                Continue to Payment
              </button>
            </CheckoutStep>

            <CheckoutStep
              stepNumber={4}
              title="Payment"
              isActive={step === 4}
              isCompleted={false}
            >
              <div className="flex flex-col gap-4">
                <div
                  className="flex gap-1 rounded-xl border p-1"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
                  }}
                >
                  {(
                    [
                      { key: "card", label: "Credit Card" },
                      { key: "paypal", label: "PayPal" },
                      { key: "applepay", label: "Apple Pay" },
                    ] as { key: PaymentTab; label: string }[]
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setPaymentTab(tab.key)}
                      className="flex-1 rounded-lg py-2 text-xs font-semibold"
                      style={{
                        backgroundColor:
                          paymentTab === tab.key
                            ? "var(--brand-primary)"
                            : "transparent",
                        color:
                          paymentTab === tab.key
                            ? "var(--brand-secondary)"
                            : "var(--brand-primary)",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {paymentTab === "card" && (
                  <div className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                      Name on Card
                      <input
                        autoComplete="cc-name"
                        value={card.name}
                        onChange={(event) =>
                          setCard((c) => ({ ...c, name: event.target.value }))
                        }
                        className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                      Card Number
                      <div className="relative">
                        <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                        <input
                          autoComplete="cc-number"
                          inputMode="numeric"
                          placeholder="1234 1234 1234 1234"
                          value={card.number}
                          onChange={(event) =>
                            setCard((c) => ({
                              ...c,
                              number: event.target.value,
                            }))
                          }
                          className="h-11 w-full rounded-lg border border-current/15 pl-9 pr-3 text-sm font-normal outline-none focus:border-current/40"
                        />
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                        Expiry
                        <input
                          autoComplete="cc-exp"
                          placeholder="MM/YY"
                          value={card.expiry}
                          onChange={(event) =>
                            setCard((c) => ({
                              ...c,
                              expiry: event.target.value,
                            }))
                          }
                          className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                        CVC
                        <input
                          autoComplete="cc-csc"
                          inputMode="numeric"
                          placeholder="123"
                          value={card.cvc}
                          onChange={(event) =>
                            setCard((c) => ({ ...c, cvc: event.target.value }))
                          }
                          className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {paymentTab === "paypal" && (
                  <div className="rounded-xl border border-current/10 p-4 text-sm opacity-70">
                    You&rsquo;ll be redirected to PayPal to complete your
                    purchase after placing your order.
                  </div>
                )}

                {paymentTab === "applepay" && (
                  <div className="rounded-xl border border-current/10 p-4 text-sm opacity-70">
                    You&rsquo;ll confirm this purchase with Apple Pay after
                    placing your order.
                  </div>
                )}

                <button
                  type="button"
                  disabled={!isEmailValid || !isAddressValid || !isCardValid}
                  onClick={placeOrder}
                  className="mt-2 h-12 rounded-xl text-sm font-semibold disabled:opacity-40"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                    color: "var(--brand-secondary)",
                  }}
                >
                  Place Order
                </button>
              </div>
            </CheckoutStep>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <CheckoutOrderSummary
            shippingPrice={shippingPrice}
            tax={tax}
            total={total}
            discountInput={discountInput}
            onDiscountInputChange={setDiscountInput}
            appliedDiscount={appliedDiscount}
            discount={discount}
            discountError={discountError}
            onApplyDiscount={applyDiscount}
          />
        </div>
      </div>
    </FashionStorefrontLayout>
  );
}

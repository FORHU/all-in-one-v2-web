/**
 * Fashion — placeholder checkout business rules.
 * None of this is backend-driven yet: there's no PricingRule/promo/shipping
 * endpoint on the API, and /v2/orders + /v2/payments are both unimplemented
 * (see features/storefront/api/checkout.client.ts). Shared by CartContents
 * and CheckoutPage so cart and checkout totals stay consistent.
 */
export const FREE_SHIPPING_THRESHOLD = 150;
export const TAX_RATE = 0.08;

export const SHIPPING_METHODS = {
  standard: {
    label: "Standard Shipping",
    price: 12,
    eta: "5-7 business days",
    minDays: 5,
    maxDays: 7,
  },
  express: {
    label: "Express Shipping",
    price: 28,
    eta: "1-2 business days",
    minDays: 1,
    maxDays: 2,
  },
} as const;

export type ShippingMethodKey = keyof typeof SHIPPING_METHODS;

export const PROMO_CODES: Record<
  string,
  { label: string; discountPercent: number }
> = {
  WELCOME10: { label: "WELCOME10 — 10% off", discountPercent: 10 },
};

/**
 * Fashion — placeholder checkout business rules.
 * Shipping is now live (see hooks/mutations/useShippingQuote.ts and
 * OrderService.getShippingQuote on the API) — the flat SHIPPING_METHODS
 * table that used to live here is gone. Tax and discount codes are still
 * frontend-only guesses, though: there's no PricingRule/promo/tax endpoint
 * on the API yet. Shared by CartContents and CheckoutPage so cart and
 * checkout totals stay consistent.
 */
export const FREE_SHIPPING_THRESHOLD = 150;
export const TAX_RATE = 0.08;

export const PROMO_CODES: Record<
  string,
  { label: string; discountPercent: number }
> = {
  WELCOME10: { label: "WELCOME10 — 10% off", discountPercent: 10 },
};

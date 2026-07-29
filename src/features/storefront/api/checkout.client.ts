import type { CheckoutSession } from "../types";

/**
 * Storefront — Checkout API client.
 * TODO: implement requests against /v2/orders and /v2/payments, scoped by
 * the active tenant (x-tenant-slug header, see shared/tenant).
 */

export const createCheckoutSession = async (
  cartId: string,
): Promise<CheckoutSession> => {
  throw new Error(`Not implemented: createCheckoutSession(${cartId})`);
};

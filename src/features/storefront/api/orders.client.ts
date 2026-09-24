import { fetcher } from "@/shared/lib/http";
import {
  MyOrdersApiEnvelopeSchema,
  CheckoutDirectApiEnvelopeSchema,
  OrderApiEnvelopeSchema,
  type MyOrdersResponse,
  type CheckoutDirectInput,
  type Order,
} from "../contracts/order.contract";

/**
 * Storefront — Orders API client. Tenant-scoped via `x-tenant-slug`, same
 * convention as address.client.ts; both endpoints are signed-in-only, so a
 * signed-out caller gets a 401 (see hooks/queries/useMyOrders.ts's
 * `enabled` gating, mirroring useLatestAddress.ts).
 */
export const getMyOrders = async (
  tenantSlug: string,
  params?: { page?: number; limit?: number },
): Promise<MyOrdersResponse> => {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();

  const raw = await fetcher<unknown>(
    `/api/v2/orders/my-orders${qs ? `?${qs}` : ""}`,
    { headers: { "x-tenant-slug": tenantSlug } },
  );
  return MyOrdersApiEnvelopeSchema.parse(raw).data;
};

/**
 * A single order by id — used by /checkout/payment-return to poll for the
 * webhook-driven flip to PROCESSING after a 3-D Secure redirect (see
 * PaymentReturnPage.tsx). Ownership is verified server-side.
 */
export const getOrderById = async (
  tenantSlug: string,
  orderId: string,
): Promise<Order> => {
  const raw = await fetcher<unknown>(`/api/v2/orders/${orderId}`, {
    headers: { "x-tenant-slug": tenantSlug },
  });
  return OrderApiEnvelopeSchema.parse(raw).data;
};

/**
 * Cancels an order — only allowed while it's still PENDING (see the API's
 * OrderService.cancelOrder): once a payment is captured, or the order has
 * already been placed with a supplier, the API 409s and this rejects. The
 * caller (useCancelOrder) doesn't need to special-case that — the global
 * mutation-error toast surfaces it automatically.
 */
export const cancelOrder = async (
  tenantSlug: string,
  orderId: string,
): Promise<Order> => {
  const raw = await fetcher<unknown>(`/api/v2/orders/${orderId}/cancel`, {
    method: "POST",
    headers: { "x-tenant-slug": tenantSlug },
  });
  return OrderApiEnvelopeSchema.parse(raw).data;
};

/**
 * Checkout without a persisted backend cart — see the API's
 * OrderService.checkoutDirect doc comment for why this exists (the
 * storefront cart is currently client-only/localStorage).
 */
export const checkoutDirect = async (
  tenantSlug: string,
  input: CheckoutDirectInput,
): Promise<Order> => {
  const raw = await fetcher<unknown>("/api/v2/orders/checkout-direct", {
    method: "POST",
    headers: { "x-tenant-slug": tenantSlug },
    body: JSON.stringify(input),
  });
  return CheckoutDirectApiEnvelopeSchema.parse(raw).data;
};

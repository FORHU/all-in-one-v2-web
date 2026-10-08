export const ordersKeys = {
  all: ["storefront", "orders"] as const,
  myOrders: (tenantSlug: string, params?: { page?: number; limit?: number }) =>
    [...ordersKeys.all, "my-orders", tenantSlug, params ?? {}] as const,
  tracking: (tenantSlug: string, orderId: string) =>
    [...ordersKeys.all, "tracking", tenantSlug, orderId] as const,
} as const;

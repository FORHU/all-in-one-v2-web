export const orderRequestsKeys = {
  all: ["storefront", "order-requests"] as const,
  mine: (tenantSlug: string) =>
    [...orderRequestsKeys.all, "mine", tenantSlug] as const,
  detail: (tenantSlug: string, id: string) =>
    [...orderRequestsKeys.all, "detail", tenantSlug, id] as const,
} as const;

/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.mjs.
 *
 * Admin surface for order/fulfillment monitoring across tenants
 * (all-in-one-v2-api's /v2/orders, /v2/payments). Shared operator
 * dashboard — not one of the 5 tenant storefronts.
 */
export const featureManifest = {
  name: "admin-orders",
  dependsOn: [] as const,
  exposes: ["OrdersTable", "useOrders"] as const,
} as const;

export type AdminOrdersManifest = typeof featureManifest;

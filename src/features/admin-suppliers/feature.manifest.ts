/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.mjs.
 *
 * Admin surface for supplier sync status and product import
 * (all-in-one-v2-api's /v2/products/import, /v2/product-search, supplier
 * adapters). Shared operator dashboard — not one of the 5 tenant storefronts.
 */
export const featureManifest = {
  name: "admin-suppliers",
  dependsOn: [] as const,
  exposes: ["SuppliersTable", "useSuppliers"] as const,
} as const;

export type AdminSuppliersManifest = typeof featureManifest;

/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.mjs.
 *
 * Admin surface for managing products/categories/pricing rules across
 * tenants (all-in-one-v2-api's /v2/products, /v2/categories). Not one of
 * the 5 tenant storefronts — this is the shared operator dashboard.
 */
export const featureManifest = {
  name: "admin-catalog",
  dependsOn: [] as const,
  exposes: ["CatalogTable", "useCatalog"] as const,
} as const;

export type AdminCatalogManifest = typeof featureManifest;

/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.mjs.
 *
 * `storefront` holds shared business logic only (api, hooks, services,
 * stores, types, utils). It exposes no UI — presentation for each of the
 * 5 tenants lives in `tenants/<slug>/` and consumes these exports.
 */
export const featureManifest = {
  name: "storefront",
  dependsOn: [] as const,
  exposes: [
    "useProducts",
    "useProductDetail",
    "useCategories",
    "useCart",
    "useCheckoutDirect",
    "useCreatePaymentIntent",
  ] as const,
} as const;

export type StorefrontManifest = typeof featureManifest;

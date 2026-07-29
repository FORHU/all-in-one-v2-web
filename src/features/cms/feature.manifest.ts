/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.mjs.
 *
 * Shared CMS content-fetching logic (all-in-one-v2-api's /v2/cms —
 * Page/PageSection/Banner/Announcement/FAQ), scoped per tenant. Tenant
 * presentation layers (tenants/<slug>/) render this data, they don't
 * fetch or shape it themselves.
 */
export const featureManifest = {
  name: "cms",
  dependsOn: [] as const,
  exposes: ["PageRenderer", "usePage"] as const,
} as const;

export type CmsManifest = typeof featureManifest;

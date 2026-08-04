/**
 * Shared type for every tenant's build-time branding config.
 * Data-only — no components or business logic belong in tenant.config.ts
 * files (enforced by tools/validate-architecture.mjs).
 */
export interface TenantConfig {
  slug: string;
  name: string;
  domain?: string;
  theme: {
    colorPrimary: string;
    colorSecondary: string;
    fontHeading: string;
    fontBody: string;
  };
  logoUrl: string;
  nav: { label: string; href: string }[];
  seo: {
    title: string;
    description: string;
  };
}

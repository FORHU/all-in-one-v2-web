import type { TenantConfig } from "../types";

/**
 * TODO: replace placeholder branding with real values (colors, fonts, logo,
 * nav, SEO) once the Electronics storefront's design is finalized.
 */
export const electronicsConfig: TenantConfig = {
  slug: "electronics",
  name: "Electronics",
  domain: "digitfriend.com",
  theme: {
    colorPrimary: "#2563EB",
    colorSecondary: "#F8FAFC",
    fontHeading: "sans-serif",
    fontBody: "sans-serif",
  },
  logoUrl: "/tenants/electronics/logo.svg",
  nav: [
    { label: "Phones", href: "/categories/phones" },
    { label: "Laptops", href: "/categories/laptops" },
    { label: "Audio", href: "/categories/audio" },
    { label: "Wearables", href: "/categories/wearables" },
  ],
  seo: {
    title: "Electronics",
    description:
      "The latest tech at honest prices — phones, laptops, audio, and everything in between.",
  },
};

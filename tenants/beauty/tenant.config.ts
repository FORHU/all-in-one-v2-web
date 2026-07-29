import type { TenantConfig } from "../types";

/**
 * TODO: replace placeholder branding with real values (colors, fonts, logo,
 * nav, SEO) once the Beauty storefront's design is finalized.
 */
export const beautyConfig: TenantConfig = {
  slug: "beauty",
  name: "Beauty",
  domain: "askmebeauty.com",
  theme: {
    colorPrimary: "#C2185B",
    colorSecondary: "#FFF5F7",
    fontHeading: "sans-serif",
    fontBody: "sans-serif",
  },
  logoUrl: "/tenants/beauty/logo.svg",
  nav: [
    { label: "Skincare", href: "/categories/skincare" },
    { label: "Makeup", href: "/categories/makeup" },
    { label: "Haircare", href: "/categories/haircare" },
    { label: "Fragrance", href: "/categories/fragrance" },
  ],
  seo: {
    title: "Beauty",
    description:
      "Clean skincare, standout makeup, and haircare that works — beauty without the guesswork.",
  },
};

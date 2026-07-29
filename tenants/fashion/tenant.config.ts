import type { TenantConfig } from "../types";

/**
 * TODO: replace placeholder branding with real values (colors, fonts, logo,
 * nav, SEO) once the Fashion storefront's design is finalized.
 */
export const fashionConfig: TenantConfig = {
  slug: "fashion",
  name: "Fashion",
  domain: "addictstyle.com",
  theme: {
    colorPrimary: "#111111",
    colorSecondary: "#F5F1EA",
    fontHeading: "sans-serif",
    fontBody: "sans-serif",
  },
  logoUrl: "/tenants/fashion/logo.svg",
  nav: [
    { label: "Women", href: "/categories/women" },
    { label: "Men", href: "/categories/men" },
    { label: "Kids", href: "/categories/kids" },
    { label: "Sale", href: "/categories/sale" },
  ],
  seo: {
    title: "Fashion",
    description:
      "Curated fashion for every era — new arrivals, timeless staples, and pieces that actually last.",
  },
};

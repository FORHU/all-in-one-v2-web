import type { TenantConfig } from "../types";

/**
 * TODO: replace placeholder branding with real values (colors, fonts, logo,
 * nav, SEO) once the Fashion storefront's design is finalized.
 */
export const fashionConfig: TenantConfig = {
  slug: "fashion",
  name: "addictstyle",
  domain: "addictstyle.com",
  theme: {
    colorPrimary: "#000000",
    colorSecondary: "#FFFFFF",
    fontHeading: "sans-serif",
    fontBody: "sans-serif",
  },
  logoUrl: "/tenants/fashion/logo.svg",
  nav: [
    { label: "Women", href: "/categories/women" },
    { label: "Men", href: "/categories/men" },
    { label: "Kids", href: "/categories/kids" },
    { label: "Accessories", href: "/categories/accessories" },
    { label: "Shoes", href: "/categories/shoes" },
    { label: "Sale", href: "/categories/sale" },
  ],
  seo: {
    title: "addictstyle",
    description:
      "Curated fashion for every era — new arrivals, timeless staples, and pieces that actually last.",
  },
};

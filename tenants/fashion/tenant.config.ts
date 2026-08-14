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
    colorPrimary: "#FFFFFF",
    colorSecondary: "#000000",
    fontHeading: "sans-serif",
    fontBody: "sans-serif",
  },
  logoUrl: "/tenants/fashion/logo.svg",
  nav: [
    { label: "Tops", href: "/categories/tops" },
    { label: "Dress", href: "/categories/dresses" },
    { label: "Bottoms", href: "/categories/bottoms" },
    { label: "Outer wear", href: "/categories/outerwear" },
    { label: "Shoes", href: "/categories/shoes" },
  ],
  seo: {
    title: "addictstyle",
    description:
      "Curated fashion for every era — new arrivals, timeless staples, and pieces that actually last.",
  },
};

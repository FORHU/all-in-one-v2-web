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
    { label: "Dress", href: "/categories/dress" },
    { label: "Bottoms", href: "/categories/bottoms" },
    // Outer Wear has 0 real products in the catalog right now — no point
    // linking to an empty category page. Add it back once it's stocked.
    { label: "Shoes", href: "/categories/shoes" },
  ],
  seo: {
    title: "addictstyle",
    description:
      "Curated fashion for every era — new arrivals, timeless staples, and pieces that actually last.",
  },
};

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
  // Every href below is a real, existing category slug (verified against
  // prisma/seeders/categories.seeder.ts) — "Kids" and "Sale" were dropped
  // rather than left pointing at slugs that don't exist and never will
  // (this catalog has no kids' line, and "sale" isn't a category, it's a
  // discount filter with no backing concept yet).
  nav: [
    { label: "Women", href: "/categories/womens-fashion" },
    { label: "Men", href: "/categories/mens-fashion" },
    { label: "Outerwear", href: "/categories/outerwear" },
    { label: "Accessories", href: "/categories/accessories" },
    { label: "Shoes", href: "/categories/shoes" },
    { label: "Bags & Backpacks", href: "/categories/bags" },
  ],
  seo: {
    title: "addictstyle",
    description:
      "Curated fashion for every era — new arrivals, timeless staples, and pieces that actually last.",
  },
};

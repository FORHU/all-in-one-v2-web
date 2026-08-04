import type { TenantConfig } from "../types";

/**
 * TODO: replace placeholder branding with real values (colors, fonts, logo,
 * nav, SEO) once the Living storefront's design is finalized.
 */
export const livingConfig: TenantConfig = {
  slug: "living",
  name: "Living",
  domain: "living.com",
  theme: {
    colorPrimary: "#B5651D",
    colorSecondary: "#FBF7F0",
    fontHeading: "sans-serif",
    fontBody: "sans-serif",
  },
  logoUrl: "/tenants/living/logo.svg",
  nav: [
    { label: "Furniture", href: "/categories/furniture" },
    { label: "Decor", href: "/categories/decor" },
    { label: "Kitchen", href: "/categories/kitchen" },
    { label: "Lighting", href: "/categories/lighting" },
  ],
  seo: {
    title: "Living",
    description:
      "Furniture and decor that make a house feel like home, without the markup.",
  },
};

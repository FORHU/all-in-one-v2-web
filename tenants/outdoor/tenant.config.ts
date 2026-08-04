import type { TenantConfig } from "../types";

/**
 * TODO: replace placeholder branding with real values (colors, fonts, logo,
 * nav, SEO) once the Outdoor storefront's design is finalized.
 */
export const outdoorConfig: TenantConfig = {
  slug: "outdoor",
  name: "Outdoor",
  domain: "outdoor.com",
  theme: {
    colorPrimary: "#2F5233",
    colorSecondary: "#F2F5EC",
    fontHeading: "sans-serif",
    fontBody: "sans-serif",
  },
  logoUrl: "/tenants/outdoor/logo.svg",
  nav: [
    { label: "Camping", href: "/categories/camping" },
    { label: "Hiking", href: "/categories/hiking" },
    { label: "Cycling", href: "/categories/cycling" },
    { label: "Gear", href: "/categories/gear" },
  ],
  seo: {
    title: "Outdoor",
    description:
      "Gear built for the trail, the campsite, and everywhere in between.",
  },
};

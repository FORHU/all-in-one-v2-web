import type { TenantConfig } from "../types";

/**
 * "Mirror Shelf" branding — see components/MirrorShelfHero.tsx and
 * theme.ts for the fuller palette/font values this config's simple
 * fields can't carry (glass-panel gradients, muted-text tone, etc.).
 */
export const beautyConfig: TenantConfig = {
  slug: "beauty",
  name: "Beauty",
  domain: "askmebeauty.com",
  theme: {
    colorPrimary: "#f0f3f6",
    colorSecondary: "#0e0f11",
    fontHeading: "Cormorant Garamond, Georgia, serif",
    fontBody: "Helvetica Neue, Helvetica, Arial, sans-serif",
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

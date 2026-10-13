import type { TenantConfig } from "../types";

/**
 * "Mirror Shelf" branding — see components/MirrorShelfHero.tsx and
 * theme.ts for the fuller palette/font values this config's simple
 * fields can't carry (the gold/accent tones, thumbnail swatches, etc.).
 */
export const beautyConfig: TenantConfig = {
  slug: "beauty",
  name: "Beauty",
  domain: "askmebeauty.com",
  theme: {
    colorPrimary: "#222222",
    colorSecondary: "#F9F7F4",
    fontHeading: "Fraunces, Georgia, serif",
    fontBody: "Manrope, Helvetica Neue, Helvetica, Arial, sans-serif",
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

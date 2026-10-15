import type { TenantConfig } from "../types";

/**
 * DigitFriend (electronics) brand config. Nav matches the "digitfriend
 * ui.html" design reference's header exactly: "Shop"/"New arrivals" both
 * anchor to #shop (the one product-browsing section — there's no separate
 * "new arrivals" route or filter wired), "Support" anchors to #help (the
 * value-props section). None of these are real routes in the reference
 * either — it's a single-page shop design.
 */
export const electronicsConfig: TenantConfig = {
  slug: "electronics",
  name: "DigitFriend",
  domain: "digitfriend.com",
  theme: {
    colorPrimary: "#0F1115",
    colorSecondary: "#F3F3EF",
    fontHeading: "var(--font-space-grotesk)",
    fontBody: "var(--font-dm-sans)",
  },
  logoUrl: "/tenants/electronics/logo.svg",
  nav: [
    { label: "Shop", href: "#shop" },
    { label: "New arrivals", href: "#shop" },
    { label: "Support", href: "#help" },
  ],
  seo: {
    title: "DigitFriend — Shop",
    description: "Tech that just works — curated gear, shipped fast.",
  },
};

import { Fraunces, Inter } from "next/font/google";
import type { FashionColorMode } from "./stores/colorMode.store";

/**
 * Fashion — canonical dark palette + display/body fonts.
 *
 * This is the single source of truth for the tenant's dark aesthetic:
 * - Site-wide dark mode reads these same values via
 *   utils/colorModeVars.ts's "dark" entry and styles/theme.css's default
 *   --brand-primary/--brand-secondary (so nav, product cards, category
 *   pages, etc. all match this palette when dark mode is active).
 * - components/TrendingLookbook.tsx (Shop the Look) imports
 *   FASHION_DARK_COLORS directly and renders with it unconditionally,
 *   regardless of the light/dark toggle — that UI island is deliberately
 *   always-dark, not just "dark mode's current colors".
 * - components/CartDrawer.tsx / CartContents.tsx instead follow the
 *   toggle — see FASHION_LIGHT_COLORS/getFashionColors below.
 *
 * Previously two near-duplicate palettes (STL_COLORS, CART_COLORS) existed
 * with slightly different hex values for the same roles — consolidated
 * here so Shop the Look, the cart, and the rest of the site's dark mode
 * are provably identical rather than "close enough".
 */
export const FASHION_DARK_COLORS = {
  ink: "#121110",
  ink2: "#1B1917",
  bone: "#F6F1E7",
  boneDim: "#B9B3A6",
  brass: "#B9945C",
  brassHover: "#CBA470",
  brassDim: "#8A754F",
  brick: "#8C3B2E",
  hairline: "#2E2B27",
  hairlineSoft: "#242220",
} as const;

/**
 * Light counterpart to FASHION_DARK_COLORS — same 10 roles, same relative
 * contrast relationships (ink/bone swap which one is background vs text,
 * exactly like utils/colorModeVars.ts already does for
 * --brand-primary/--brand-secondary), so a component that switches between
 * these two objects keeps its whole visual structure and just flips light
 * source. Brass/brick stay the tenant's fixed accent colors in both modes —
 * only brassHover darkens instead of brightens, since a light background
 * needs the hover state to move away from white, not toward it.
 */
export const FASHION_LIGHT_COLORS = {
  ink: "#F6F1E7",
  ink2: "#EDE6D6",
  bone: "#121110",
  boneDim: "#6B655A",
  brass: "#B9945C",
  brassHover: "#9C7A45",
  brassDim: "#8A754F",
  brick: "#8C3B2E",
  hairline: "#DDD5C4",
  hairlineSoft: "#E6E0D2",
} as const;

export function getFashionColors(mode: FashionColorMode) {
  return mode === "light" ? FASHION_LIGHT_COLORS : FASHION_DARK_COLORS;
}

/**
 * Loaded once here and applied globally via layout.tsx's --font-fraunces/
 * --font-inter CSS variables (see globals wiring) — styles/theme.css then
 * points --font-heading/--font-body at them for this tenant only. Fraunces
 * (serif, display) is for product names/headlines/prices; Inter (sans) is
 * for everything structural — labels, buttons, quantity numbers, meta
 * text. Applies in both light and dark mode; only the color palette above
 * is dark-mode-specific.
 */
export const fashionFraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const fashionInter = Inter({
  variable: "--font-inter-fashion",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

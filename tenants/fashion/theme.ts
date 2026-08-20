import { Playfair_Display, Inter } from "next/font/google";
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
  // Mapped from the tenant's editorial reference palette: ink/ink2 are its
  // "Primary Palette (Neutrals)" — Warm Cream & Off-White for the page
  // background, Camel & Warm Beige for secondary surfaces (cards, panels).
  // brass is that palette's Warm Gold accent; brick is Warm Brown & Cognac
  // (replacing the previous brick-red, which wasn't in that palette at
  // all). bone/boneDim stay near-black/warm-brown-grey — Classic Black is
  // the palette's own anchor shade for text.
  ink: "#F8F2E5",
  ink2: "#E6D9BE",
  bone: "#121110",
  boneDim: "#6E5A45",
  brass: "#C6A15B",
  brassHover: "#A67F3F",
  brassDim: "#9C7A45",
  brick: "#8B5A2E",
  hairline: "#DFD1B2",
  hairlineSoft: "#EBE0C8",
} as const;

export function getFashionColors(mode: FashionColorMode) {
  return mode === "light" ? FASHION_LIGHT_COLORS : FASHION_DARK_COLORS;
}

/**
 * Subtle paper/film grain for the page background (see
 * layouts/StorefrontLayout.tsx's root div), so the flat cream/ink fill
 * behind the homepage rails reads as a styled surface rather than plain
 * solid color — closer to the editorial moodboard references this tenant's
 * been built against. Pure CSS/SVG, no image asset: an SVG fractalNoise
 * filter rendered at full strength, then faded via the <rect>'s own
 * `opacity` attribute (not per-pixel alpha via feColorMatrix — an earlier
 * version keyed opacity off the noise's own alpha channel too, which
 * compounded into ~2-3% real visibility and was invisible in practice).
 * Grayscale noise + flat opacity works on both light and dark backgrounds
 * without a separate asset per mode: some pixels read lighter than the
 * base color, some darker, which is what actually reads as "grain" rather
 * than a uniform tint. Tiled at 180px — big enough that the grain doesn't
 * look like a repeating pattern, small enough to stay cheap to paint.
 */
const FASHION_GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
  <filter id='grain'>
    <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch' />
  </filter>
  <rect width='100%' height='100%' filter='url(#grain)' opacity='0.07' />
</svg>`;

export const fashionGrainBackgroundImage = `url("data:image/svg+xml,${encodeURIComponent(FASHION_GRAIN_SVG)}")`;

/**
 * Soft light/dark vignette to pair with fashionGrainBackgroundImage — a
 * warm highlight upper-left fading into a deeper warm shadow toward the
 * opposite edge, matching the uneven directional lighting in the linen
 * moodboard reference (a photographed backdrop is never lit perfectly
 * evenly). Two radial-gradient layers rather than one: a light bloom and a
 * separate dark falloff, so each can be positioned/sized independently.
 * Warm-tinted (not flat black/white) so it reads as light falling across
 * the surface rather than a grey smudge.
 *
 * Three explicit color stops (peak -> half-strength -> transparent, each
 * fading all the way to 100%) rather than two (peak -> "transparent" at
 * 75-80%) — the two-stop version left the outer 20-25% of the sized box
 * already fully transparent before the box's own edge, which read as a
 * visible seam where the layout's backgroundSize (see
 * layouts/StorefrontLayout.tsx) box ended and the plain fill began. Fading
 * continuously across the *entire* box means the last computed pixel at
 * the box edge is already 0 alpha, so it blends into the flat color below
 * with nothing to seam against.
 */
export const fashionVignetteBackgroundImage = [
  "radial-gradient(ellipse 100% 80% at 25% 8%, rgba(255,250,235,0.45) 0%, rgba(255,250,235,0.16) 45%, transparent 100%)",
  "radial-gradient(ellipse 110% 90% at 82% 100%, rgba(35,25,15,0.14) 0%, rgba(35,25,15,0.05) 40%, transparent 100%)",
].join(", ");

/**
 * Loaded once here and applied globally via layout.tsx's --font-didone/
 * --font-inter CSS variables (see globals wiring) — styles/theme.css then
 * points --font-heading/--font-body at them for this tenant only. Playfair
 * Display — a Didone-classification serif (high thick/thin stroke
 * contrast, hairline serifs, vertical stress, in the Didot/Bodoni family) —
 * is for product names/headlines/prices; Inter (sans) is for everything
 * structural — labels, buttons, quantity numbers, meta text, body copy.
 * Deliberately kept off body text: Didone serifs are a display-only choice
 * classically — the hairline serifs and heavy contrast that read as
 * elegant at headline sizes get hard to read in small/dense text. Applies
 * in both light and dark mode; only the color palette above is
 * dark-mode-specific. Previously Fraunces — swapped for a true Didone per
 * an explicit request to match that classification, not just "a serif".
 */
export const fashionDidone = Playfair_Display({
  variable: "--font-didone",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const fashionInter = Inter({
  variable: "--font-inter-fashion",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";

/**
 * DigitFriend (electronics) palette — matches the "digitfriend ui.html"
 * design reference exactly: warm off-white/cream storefront, a near-black
 * header/footer/CTA ink, and a configurable lime accent (the reference
 * exposes `accent` as an editor-pickable prop; this app has no such
 * per-request override infra, so it's fixed to the reference's own
 * default, #D4F542). Replaces the earlier dark "Circuit" palette.
 */
export const DIGITFRIEND_COLORS = {
  /** Page background (warm cream, not pure white). */
  bg: "#f3f3ef",
  /** Header/footer/CTA ink — near-black, not pure black. */
  ink: "#0f1115",
  /** Header-specific darks (the header stays ink-on-ink regardless of page bg). */
  headerBorder: "#22262e",
  headerMuted: "#c9ccd3",
  headerMutedSoft: "#5b616c",
  headerPanelBg: "#1a1d23",
  headerPanelBorder: "#2a2e37",
  /** Body text on the light background. */
  muted: "#5a5f69",
  /** Card/divider borders on the light background. */
  border: "#e2e2dc",
  borderStrong: "#d6d6cf",
  cardBg: "#ffffff",
  /** "In stock" green. */
  success: "#2e7d4f",
  /** Wishlist-filled red. */
  wishlist: "#e5484d",
  /** The lime accent — cart count pill, active filter chips, CTA highlights. */
  accent: "#d4f542",
  /** Text color on a solid-accent-filled surface (near-black, not white —
   * lime is light, so dark text is what's legible on it). */
  accentInk: "#0f1115",
} as const;

/**
 * Flat per-category tint + line-icon treatment — the design's own
 * illustration system in place of product photography (see the "[Product
 * photo]" placeholder label in the reference; the flat-color-field look is
 * the shipped aesthetic, not a stand-in). Keyed by the real seeded category
 * slugs (categories.seeder.ts), which map 1:1 onto the reference's 6
 * categories.
 */
export const DIGITFRIEND_CATEGORY_META: Record<
  string,
  { short: string; tint: string }
> = {
  audio: { short: "Audio", tint: "#e3e9ff" },
  "cameras-optics": { short: "Cameras", tint: "#f3eadc" },
  "computer-peripherals": { short: "Peripherals", tint: "#dff0e6" },
  "gaming-accessories": { short: "Gaming", tint: "#ece3f7" },
  "smart-home": { short: "Smart Home", tint: "#fcebd3" },
  "wearable-tech": { short: "Wearables", tint: "#e2ecf0" },
};

/**
 * Loaded here (not root layout.tsx), applied via `.variable` classNames on
 * ElectronicsStorefrontLayout's root div — same pattern as every other
 * tenant's theme.ts. Space Grotesk still backs display headings/prices;
 * DM Sans replaces the earlier generic Inter as the body/UI font; JetBrains
 * Mono is new — the reference uses it for small "data" labels (item counts,
 * category eyebrows, breadcrumb-adjacent metadata) to read as spec-sheet
 * detail rather than prose.
 */
export const digitfriendSpaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const digitfriendDmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const digitfriendJetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

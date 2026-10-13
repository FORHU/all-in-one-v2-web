import { Instrument_Serif, Manrope } from "next/font/google";

/**
 * Beauty — "Mirror Shelf" palette, re-matched to the Main.dc.html design
 * reference's warm terracotta *glass* revision (blurred full-bleed photo
 * backdrop, frosted translucent cards) — supersedes the earlier flat
 * cream/white-card pass. Light-only by design, same reasoning as before:
 * this tenant has no light/dark toggle, so this stays a single constants
 * object, not a mode-selector function.
 */
export const BEAUTY_MIRROR_COLORS = {
  /** Page background base, visible at the very edges beyond the blurred photo. */
  bg: "#e9d9cc",
  /** Solid-fill surface for pages that don't render the blurred-photo backdrop behind their own content (checkout/account/etc. section wrappers). */
  surface: "#FFFFFF",
  /** Subtle fill for loading skeletons etc. */
  panel: "rgba(255,255,255,0.32)",
  panelBorder: "rgba(255,255,255,0.6)",
  panelBorderHover: "rgba(255,255,255,0.8)",
  /** Primary text (warm near-black). */
  ink: "#2a1f1a",
  inkSoft: "#2a1f1a",
  /** Secondary/label text (warm brown). */
  muted: "#4e3d34",
  mutedSoft: "#6d5b52",
  /** Hairline borders over the glass backdrop. */
  hairline: "rgba(255,255,255,0.5)",
  border: "rgba(255,255,255,0.6)",
  /** The one warm terracotta accent — italic "Mode", icon strokes, link hover. */
  accent: "#8a4b2f",
  accentDeep: "#6e3b22",
  /** Text color on a solid-ink-filled surface (BAG button, active chip). */
  accentInk: "#fff6ef",
  /** Alias kept for any lingering "gold" references — now the same warm terracotta accent, not a literal gold, matching the reference's single-accent palette. */
  gold: "#8a4b2f",
  /** Category-card thumbnail tones, cycled per card (decorative-swatch fallback only). */
  thumb: "#efe3d6",
  thumb2: "#e8d8c8",
  thumb3: "#f2e7da",
  /** Ambient-portrait panel fill. */
  portraitBg: "#f4eee5",
  /** Frosted "glass" tokens — translucent white + backdrop blur, the reference's `.glass`/`.glass-strong`/`.glass-dark` classes. Consumers pair `glassBg`/`glassBorder` with a `backdropFilter`/`WebkitBackdropFilter: "blur(26px) saturate(170%)"` style. */
  glassBg: "rgba(255,255,255,0.32)",
  glassBorder: "rgba(255,255,255,0.6)",
  glassStrongBg: "rgba(255,255,255,0.5)",
  glassStrongBorder: "rgba(255,255,255,0.75)",
  glassDarkBg: "rgba(28,18,14,0.28)",
  glassDarkBorder: "rgba(255,255,255,0.28)",
} as const;

/**
 * Loaded here (not root layout.tsx) and applied via `.variable` classNames
 * on BeautyStorefrontLayout's root div — same pattern as
 * tenants/fashion/theme.ts. Instrument Serif backs headings (logo, "Mirror
 * Mode" title — the reference's own `font-family:'Instrument Serif'`,
 * replacing the earlier Fraunces pass); Manrope is the general body/UI
 * font for everything else, same as before.
 */
export const beautyInstrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const beautyManrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

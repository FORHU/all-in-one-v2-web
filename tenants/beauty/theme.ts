import { Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";

/**
 * Beauty — "Mirror Shelf" palette, taken from the Mirror Shelf.dc.html
 * design reference. Dark-only by design (see styles/theme.css's own doc
 * comment — this tenant has no light/dark toggle, unlike fashion's
 * getFashionColors), so this is a single constants object, not a
 * mode-selector function.
 */
export const BEAUTY_MIRROR_COLORS = {
  /** Page background (near-black, slightly warm). */
  bg: "#0e0f11",
  /** Card/panel background (glass effect layered on top via border+gradient, not a flat fill). */
  panel: "rgba(255,255,255,.05)",
  panelBorder: "rgba(255,255,255,.09)",
  panelBorderHover: "rgba(255,255,255,.22)",
  /** Primary text (off-white). */
  ink: "#f0f3f6",
  inkSoft: "#eef2f5",
  /** Secondary/label text (muted gray) — used for all-caps mono labels. */
  muted: "#8e979f",
  mutedSoft: "#98a2ab",
  /** Hairline borders. */
  hairline: "rgba(255,255,255,.09)",
  /** The one light/solid accent (the mockup's selected-tab pill). */
  accent: "#f7f9fb",
  accentInk: "#24282c",
} as const;

/**
 * Loaded here (not root layout.tsx) and applied via `.variable` classNames
 * on BeautyStorefrontLayout's root div — same pattern as
 * tenants/fashion/theme.ts. Cormorant Garamond backs headings ("MIRROR
 * MODE"-style serif titles); IBM Plex Mono backs the all-caps
 * letter-spaced labels (nav, weather, clock date, category eyebrows) that
 * carry most of this design's dashboard/instrument-panel character.
 */
export const beautyCormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const beautyPlexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

import type { CSSProperties } from "react";
import type { FashionColorMode } from "../stores/colorMode.store";

/**
 * CSS custom property overrides per mode, keyed to match
 * styles/theme.css's --brand-primary/--brand-secondary. Spread onto a root
 * element's style so everything nested inside inherits the flipped values —
 * "dark" is the tenant's current default (soft off-white on charcoal, kept
 * in sync with styles/theme.css's base values). "light" mirrors the exact
 * same two soft tones rather than pure black/white, so both modes share the
 * same contrast level — only which tone is foreground vs background swaps.
 * Shared by layouts/StorefrontLayout.tsx and pages/LoginPage.tsx, the two
 * page roots that read useFashionColorMode.
 */
export const FASHION_COLOR_VARS: Record<FashionColorMode, CSSProperties> = {
  dark: {
    "--brand-primary": "#f2f2f2",
    "--brand-secondary": "#1a1a1a",
  } as CSSProperties,
  light: {
    "--brand-primary": "#1a1a1a",
    "--brand-secondary": "#f2f2f2",
  } as CSSProperties,
};

import type { CSSProperties } from "react";
import type { FashionColorMode } from "../stores/colorMode.store";
import { FASHION_DARK_COLORS } from "../theme";

/**
 * CSS custom property overrides per mode, keyed to match
 * styles/theme.css's --brand-primary/--brand-secondary. Spread onto a root
 * element's style so everything nested inside inherits the flipped values.
 * "dark" uses the tenant's canonical palette (see theme.ts's
 * FASHION_DARK_COLORS — Bone text on Ink background), kept in sync with
 * styles/theme.css's base values since this is also the default mode
 * before the toggle hydrates. "light" mirrors the exact same two tones
 * rather than an unrelated light palette, so both modes share the same
 * contrast level — only which tone is foreground vs background swaps.
 * Shared by layouts/StorefrontLayout.tsx and pages/LoginPage.tsx, the two
 * page roots that read useFashionColorMode.
 */
export const FASHION_COLOR_VARS: Record<FashionColorMode, CSSProperties> = {
  dark: {
    "--brand-primary": FASHION_DARK_COLORS.bone,
    "--brand-secondary": FASHION_DARK_COLORS.ink,
  } as CSSProperties,
  light: {
    "--brand-primary": FASHION_DARK_COLORS.ink,
    "--brand-secondary": FASHION_DARK_COLORS.bone,
  } as CSSProperties,
};

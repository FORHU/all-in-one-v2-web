import type { CSSProperties } from "react";
import type { FashionColorMode } from "../stores/colorMode.store";
import { getFashionColors } from "../theme";

/**
 * CSS custom property overrides per mode, keyed to match styles/theme.css's
 * --brand-primary/--brand-secondary/--brand-accent/--brand-border. Spread
 * onto a root element's style so everything nested inside inherits the
 * flipped values. Sourced from theme.ts's getFashionColors so this stays
 * the single palette definition shared with CartContents.tsx/CartDrawer.tsx
 * (which read FASHION_DARK_COLORS/FASHION_LIGHT_COLORS directly) — before
 * this, "light" only flipped Bone/Ink and dropped Brass/Hairline entirely,
 * so shared/ components (ProductCard, Trending, HeroBanner, ...) had no way
 * to pick up the tenant's warm tan accent, only a flat black-on-cream
 * inversion. "dark" is kept in sync with styles/theme.css's base values
 * since it's also the default mode before the toggle hydrates. Shared by
 * layouts/StorefrontLayout.tsx and pages/LoginPage.tsx, the two page roots
 * that read useFashionColorMode.
 */
function toColorVars(mode: FashionColorMode): CSSProperties {
  const colors = getFashionColors(mode);
  return {
    "--brand-primary": colors.bone,
    "--brand-secondary": colors.ink,
    "--brand-accent": colors.brass,
    "--brand-border": colors.hairline,
  } as CSSProperties;
}

export const FASHION_COLOR_VARS: Record<FashionColorMode, CSSProperties> = {
  dark: toColorVars("dark"),
  light: toColorVars("light"),
};

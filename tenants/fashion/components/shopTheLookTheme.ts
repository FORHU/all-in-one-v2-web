/**
 * Fixed dark palette for the "Shop the Look" widget (TrendingLookbook.tsx),
 * matched to a supplied mockup. Deliberately distinct from the tenant's
 * brand-primary/secondary theme tokens (var(--brand-*)) used elsewhere on
 * the storefront — scoped to this widget only, not a site-wide theme change.
 */
export const STL_COLORS = {
  bgPage: "#0a0a0b",
  bgPanel: "#141415",
  bgRaised: "#1c1c1e",
  borderLine: "#2a2a2c",
  borderSoft: "#222223",
  textPrimary: "#f1ece2",
  textDim: "#a3a3a6",
  textFaint: "#6b6b6e",
  gold: "#c9a15a",
  goldDim: "#8a6f3f",
  teal: "#5f8683",
  tealDim: "#3d5654",
  ctaText: "#181420",
} as const;

export const STL_SERIF_FONT = "Georgia, 'Times New Roman', serif";

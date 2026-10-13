/**
 * Sample "Skincare"/"Makeup & Others" content — taken directly from Mirror
 * Shelf.dc.html's own hardcoded data. Used by MirrorShelfHero.tsx only as a
 * fallback when a column's real category list is empty (beauty's catalog
 * has no products/categories yet), so the page shows the design's actual
 * character instead of a bare "No product available" line. Once beauty has
 * real categories, useCategories() returns real rows and this fallback
 * stops being used automatically — nothing to manually remove later.
 *
 * `productSlug` points each card at one representative mock product from
 * data/products.ts (the closest match for that card's name), so clicking a
 * sample card opens a real product display instead of doing nothing —
 * BeautyProductDetailPage falls back to beautyMockProducts by slug the same
 * way CategoryDetailPage.tsx already does for its own product tiles.
 */
export const SAMPLE_SKINCARE: {
  name: string;
  count: number;
  productSlug: string;
}[] = [
  { name: "Oil cleansers", count: 3, productSlug: "gentle-oil-cleanser" },
  { name: "Essences", count: 4, productSlug: "hydrating-glow-essence" },
  { name: "Treatments", count: 4, productSlug: "vitamin-c-brightening-serum" },
  { name: "Night creams", count: 3, productSlug: "overnight-repair-cream" },
  { name: "Masks", count: 4, productSlug: "clay-detox-mask" },
];

export const SAMPLE_MAKEUP: {
  name: string;
  count: number;
  productSlug: string;
}[] = [
  { name: "Contour", count: 3, productSlug: "soft-sculpt-contour-stick" },
  { name: "Eye colour", count: 4, productSlug: "velvet-eye-palette" },
  { name: "Highlighter", count: 4, productSlug: "glass-skin-highlighter" },
  { name: "Lip tint", count: 4, productSlug: "sheer-tint-lip-oil" },
  { name: "Setting spray", count: 3, productSlug: "all-day-setting-spray" },
];

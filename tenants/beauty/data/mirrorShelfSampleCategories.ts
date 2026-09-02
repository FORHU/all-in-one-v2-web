/**
 * Sample "Skincare"/"Makeup & Others" content — taken directly from Mirror
 * Shelf.dc.html's own hardcoded data. Used by MirrorShelfHero.tsx only as a
 * fallback when a column's real category list is empty (beauty's catalog
 * has no products/categories yet), so the page shows the design's actual
 * character instead of a bare "No product available" line. Once beauty has
 * real categories, useCategories() returns real rows and this fallback
 * stops being used automatically — nothing to manually remove later.
 */
export const SAMPLE_SKINCARE: { name: string; count: number }[] = [
  { name: "Oil cleansers", count: 3 },
  { name: "Essences", count: 4 },
  { name: "Treatments", count: 4 },
  { name: "Night creams", count: 3 },
  { name: "Masks", count: 4 },
];

export const SAMPLE_MAKEUP: { name: string; count: number }[] = [
  { name: "Contour", count: 3 },
  { name: "Eye colour", count: 4 },
  { name: "Highlighter", count: 4 },
  { name: "Lip tint", count: 4 },
  { name: "Setting spray", count: 3 },
];

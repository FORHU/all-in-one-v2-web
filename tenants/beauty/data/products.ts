/**
 * Beauty — mock product catalog, grouped by category slug (see
 * data/categories.ts). Used by CategoryDetailPage.tsx as a fallback when
 * the real useProducts(tenantSlug, { categorySlug }) result is empty
 * (beauty's real catalog has no products yet) — same fallback pattern
 * components/MirrorShelfCategoryCard.tsx already uses for category counts.
 * No real imageUrl (no asset pipeline for this tenant yet — see
 * ImagePlaceholder, which renders its text fallback for a null/missing
 * imageUrl), so `thumbnailLabel` stands in as the placeholder's caption.
 */
export interface BeautyMockProduct {
  id: string;
  slug: string;
  title: string;
  brand: string;
  price: number;
  categorySlug: string;
  thumbnailLabel: string;
}

export const beautyMockProducts: BeautyMockProduct[] = [
  // Skincare
  {
    id: "sc-1",
    slug: "gentle-oil-cleanser",
    title: "Gentle Oil Cleanser",
    brand: "Mirror Shelf",
    price: 24,
    categorySlug: "skincare",
    thumbnailLabel: "Oil Cleanser",
  },
  {
    id: "sc-2",
    slug: "hydrating-glow-essence",
    title: "Hydrating Glow Essence",
    brand: "Mirror Shelf",
    price: 32,
    categorySlug: "skincare",
    thumbnailLabel: "Essence",
  },
  {
    id: "sc-3",
    slug: "vitamin-c-brightening-serum",
    title: "Vitamin C Brightening Serum",
    brand: "Mirror Shelf",
    price: 38,
    categorySlug: "skincare",
    thumbnailLabel: "Serum",
  },
  {
    id: "sc-4",
    slug: "overnight-repair-cream",
    title: "Overnight Repair Cream",
    brand: "Mirror Shelf",
    price: 42,
    categorySlug: "skincare",
    thumbnailLabel: "Night Cream",
  },
  {
    id: "sc-5",
    slug: "clay-detox-mask",
    title: "Clay Detox Mask",
    brand: "Mirror Shelf",
    price: 26,
    categorySlug: "skincare",
    thumbnailLabel: "Mask",
  },

  // Makeup
  {
    id: "mk-1",
    slug: "soft-sculpt-contour-stick",
    title: "Soft Sculpt Contour Stick",
    brand: "Mirror Shelf",
    price: 22,
    categorySlug: "makeup",
    thumbnailLabel: "Contour",
  },
  {
    id: "mk-2",
    slug: "velvet-eye-palette",
    title: "Velvet Eye Palette",
    brand: "Mirror Shelf",
    price: 34,
    categorySlug: "makeup",
    thumbnailLabel: "Eye Colour",
  },
  {
    id: "mk-3",
    slug: "glass-skin-highlighter",
    title: "Glass Skin Highlighter",
    brand: "Mirror Shelf",
    price: 28,
    categorySlug: "makeup",
    thumbnailLabel: "Highlighter",
  },
  {
    id: "mk-4",
    slug: "sheer-tint-lip-oil",
    title: "Sheer Tint Lip Oil",
    brand: "Mirror Shelf",
    price: 19,
    categorySlug: "makeup",
    thumbnailLabel: "Lip Tint",
  },
  {
    id: "mk-5",
    slug: "all-day-setting-spray",
    title: "All-Day Setting Spray",
    brand: "Mirror Shelf",
    price: 21,
    categorySlug: "makeup",
    thumbnailLabel: "Setting Spray",
  },

  // Haircare
  {
    id: "hc-1",
    slug: "silk-repair-shampoo",
    title: "Silk Repair Shampoo",
    brand: "Mirror Shelf",
    price: 18,
    categorySlug: "haircare",
    thumbnailLabel: "Shampoo",
  },
  {
    id: "hc-2",
    slug: "silk-repair-conditioner",
    title: "Silk Repair Conditioner",
    brand: "Mirror Shelf",
    price: 18,
    categorySlug: "haircare",
    thumbnailLabel: "Conditioner",
  },
  {
    id: "hc-3",
    slug: "overnight-hair-oil",
    title: "Overnight Hair Oil",
    brand: "Mirror Shelf",
    price: 27,
    categorySlug: "haircare",
    thumbnailLabel: "Hair Oil",
  },
  {
    id: "hc-4",
    slug: "heat-shield-spray",
    title: "Heat Shield Spray",
    brand: "Mirror Shelf",
    price: 20,
    categorySlug: "haircare",
    thumbnailLabel: "Heat Protectant",
  },

  // Fragrance
  {
    id: "fr-1",
    slug: "midnight-bloom-eau-de-parfum",
    title: "Midnight Bloom Eau de Parfum",
    brand: "Mirror Shelf",
    price: 68,
    categorySlug: "fragrance",
    thumbnailLabel: "Eau de Parfum",
  },
  {
    id: "fr-2",
    slug: "citrus-veil-body-mist",
    title: "Citrus Veil Body Mist",
    brand: "Mirror Shelf",
    price: 24,
    categorySlug: "fragrance",
    thumbnailLabel: "Body Mist",
  },
  {
    id: "fr-3",
    slug: "warm-amber-solid-perfume",
    title: "Warm Amber Solid Perfume",
    brand: "Mirror Shelf",
    price: 30,
    categorySlug: "fragrance",
    thumbnailLabel: "Solid Perfume",
  },
];

/**
 * Beauty — category taxonomy shown in CategoriesPage/CategoryDetailPage.
 * Static, matching beautyConfig.nav's 4 top-level categories/slugs
 * (tenant.config.ts) — real backend categories don't exist for this tenant
 * yet, same reasoning as tenants/fashion/data/categories.ts. Counts here
 * are mock/illustrative; CategoryDetailPage.tsx prefers the real
 * useProducts(...).total when it's non-zero, falling back to this count.
 */
export interface BeautyCategory {
  slug: string;
  label: string;
  count: number;
}

export const beautyCategories: BeautyCategory[] = [
  { slug: "skincare", label: "Skincare", count: 46 },
  { slug: "makeup", label: "Makeup", count: 38 },
  { slug: "haircare", label: "Haircare", count: 24 },
  { slug: "fragrance", label: "Fragrance", count: 17 },
];

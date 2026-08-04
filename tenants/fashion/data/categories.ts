/**
 * Fashion — category taxonomy shown in CategoryGrid/CategoriesPage.
 * Static until features/storefront's useCategories() is backed by a real
 * API — see categories.client.ts. Nav items (Women/Men/Kids/Sale) route
 * through the same /categories/[slug] page but aren't listed here — that's
 * a separate department-level taxonomy not yet reconciled with this one.
 */
export interface FashionCategory {
  slug: string;
  label: string;
  count: number;
}

export const fashionCategories: FashionCategory[] = [
  { slug: "dresses", label: "Dresses", count: 128 },
  { slug: "shirts", label: "Shirts", count: 84 },
  { slug: "jackets", label: "Jackets", count: 46 },
  { slug: "pants", label: "Pants", count: 92 },
  { slug: "shoes", label: "Shoes", count: 61 },
  { slug: "accessories", label: "Accessories", count: 73 },
];

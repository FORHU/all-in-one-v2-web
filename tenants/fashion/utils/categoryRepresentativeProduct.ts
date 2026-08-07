import type { StorefrontSectionProduct } from "@/features/storefront/contracts/storefront-page.contract";

/**
 * CatalogCategory has no image field on the backend, so category tiles
 * source a real photo from one of that category's own products instead of
 * a fabricated placeholder. Builds a categoryId -> first-matching-product
 * lookup from an already-fetched product list (e.g. the NEW_ARRIVALS
 * section, which currently covers the whole seeded catalog) — first match
 * wins, no extra network request needed since callers already have the
 * product list from useStorefrontPage("home").
 */
export function buildCategoryImageMap(
  products: StorefrontSectionProduct[],
): Map<string, StorefrontSectionProduct> {
  const map = new Map<string, StorefrontSectionProduct>();
  for (const product of products) {
    if (product.categoryId && !map.has(product.categoryId)) {
      map.set(product.categoryId, product);
    }
  }
  return map;
}

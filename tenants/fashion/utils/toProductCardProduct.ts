import type { ProductCardProduct } from "@/shared/components/ProductCard";
import type { StorefrontSectionProduct } from "@/features/storefront/contracts/storefront-page.contract";
import type { CategoryProduct } from "@/features/storefront/contracts/category-detail.contract";

/**
 * Maps a resolved storefront-section product (from GET /v2/storefront) into
 * the shape ProductCard expects. No rating/brand exists on the backend
 * product model, so `rating` is omitted (ProductCard skips the star row
 * entirely rather than showing a fabricated value) and `brand` falls back
 * to the storefront's own name — this is a single-brand storefront, so
 * that's accurate, not a placeholder.
 */
export function toProductCardProduct(
  product: StorefrontSectionProduct,
): ProductCardProduct {
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : undefined;

  return {
    id: product.id,
    name: product.title,
    brand: "ADDICTSTYLE",
    price: product.price,
    originalPrice: product.compareAtPrice ?? undefined,
    discountPercent,
    imageLabel: product.title,
    imageUrl: product.thumbnailUrl ?? undefined,
  };
}

/**
 * Maps a category-detail product (from GET /v2/categories/:slug) into the
 * shape ProductCard/CategoryFilters expect. Variant titles across this
 * catalog consistently follow a "Color / Size" convention (e.g. "Navy /
 * Medium", confirmed against live seed data) — split on that to derive
 * discrete color/size facets, since the backend has no separate
 * color/size fields on CatalogProductVariant (just Json `attributes` and
 * a free-text `title`).
 */
export function toProductCardProductFromCategory(
  product: CategoryProduct,
): ProductCardProduct {
  const colors = new Set<string>();
  const sizes = new Set<string>();
  for (const variant of product.variants) {
    const [color, size] = variant.title.split("/").map((part) => part.trim());
    if (color) colors.add(color);
    if (size) sizes.add(size);
  }

  const price = product.variants[0]?.price ?? product.price ?? 0;
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > price
      ? Math.round((1 - price / product.compareAtPrice) * 100)
      : undefined;

  return {
    id: product.id,
    name: product.title,
    brand: "ADDICTSTYLE",
    price,
    originalPrice: product.compareAtPrice ?? undefined,
    discountPercent,
    imageLabel: product.title,
    imageUrl: product.thumbnailUrl ?? undefined,
    colors: colors.size > 0 ? Array.from(colors) : undefined,
    sizes: sizes.size > 0 ? Array.from(sizes) : undefined,
  };
}

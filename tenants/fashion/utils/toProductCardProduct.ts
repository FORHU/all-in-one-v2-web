import type { Product } from "@/features/storefront/contracts/products.contract";
import type { ProductCardProduct } from "@/shared/components/ProductCard";

/**
 * Maps the API's Product shape to ProductCard's prop shape. Kept as a local
 * adapter rather than widening ProductCardProduct itself, since that type is
 * also consumed by QuickViewModal/quickAddToCart/the cart store. Shared by
 * every fashion page that renders a product grid from real API data
 * (CategoryDetailPage, ProductsPage) so they stay in sync.
 */
export function toProductCardProduct(product: Product): ProductCardProduct {
  const discountPercent =
    product.price != null &&
    product.compareAtPrice != null &&
    product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : undefined;

  return {
    id: product.id,
    slug: product.slug,
    name: product.title,
    brand: product.brand ?? "",
    price: product.price ?? 0,
    originalPrice: product.compareAtPrice ?? undefined,
    discountPercent,
    rating: product.rating,
    reviewCount: product.reviewCount,
    colors: product.colors.map((c) => c.swatchColor ?? "#999999"),
    sizes: product.sizes.map((s) => s.value.toUpperCase()),
    imageLabel: product.title,
    imageUrl: product.thumbnailUrl,
  };
}

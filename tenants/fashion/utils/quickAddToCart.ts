import { toast } from "sonner";
import type { ProductCardProduct } from "@/shared/components/ProductCard";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";

/**
 * Adds a product's default variant (first size/color) at quantity 1 —
 * used by ProductCard's "Quick Add to Cart" hover button, which has no
 * variant picker of its own. Full variant selection happens in
 * QuickViewModal instead.
 */
export function quickAddToCart(product: ProductCardProduct) {
  useLocalCartStore.getState().addItem({
    productId: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    imageLabel: product.imageLabel,
    imageUrl: product.imageUrl,
    size: product.sizes?.[0],
    color: product.colors?.[0],
    quantity: 1,
  });
  toast.success(`Added ${product.name} to cart`);
}

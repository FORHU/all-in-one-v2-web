import Link from "next/link";
import {
  ProductCard,
  type ProductCardProduct,
} from "@/shared/components/ProductCard";

/**
 * Fashion — homepage featured-products section.
 * Static placeholder products (not fabricated as "real" data) until
 * features/storefront's useProducts() is backed by a real API.
 */
const products: ProductCardProduct[] = [
  {
    id: "wool-overcoat",
    name: "Wool Overcoat",
    brand: "ADDICTSTYLE",
    price: 248,
    originalPrice: 320,
    discountPercent: 22,
    rating: 4.6,
    reviewCount: 128,
    colors: ["#2b2b2b", "#8a7a63", "#c9c2b3"],
    sizes: ["S", "M", "L", "XL"],
    imageLabel: "Product: Wool Overcoat",
  },
  {
    id: "silk-slip-dress",
    name: "Silk Slip Dress",
    brand: "ADDICTSTYLE",
    price: 168,
    rating: 4.8,
    reviewCount: 94,
    colors: ["#111111", "#7c1f2c"],
    sizes: ["XS", "S", "M"],
    imageLabel: "Product: Silk Slip Dress",
  },
  {
    id: "relaxed-linen-shirt",
    name: "Relaxed Linen Shirt",
    brand: "STUDIO NUE",
    price: 92,
    originalPrice: 120,
    discountPercent: 23,
    rating: 4.4,
    reviewCount: 61,
    colors: ["#e7e2d6", "#3a4a3f"],
    sizes: ["S", "M", "L"],
    imageLabel: "Product: Relaxed Linen Shirt",
  },
  {
    id: "tailored-trouser",
    name: "Tailored Trouser",
    brand: "ADDICTSTYLE",
    price: 138,
    rating: 4.5,
    reviewCount: 77,
    colors: ["#111111", "#5a5a52"],
    sizes: ["28", "30", "32", "34"],
    imageLabel: "Product: Tailored Trouser",
  },
  {
    id: "cashmere-knit",
    name: "Cashmere Knit",
    brand: "STUDIO NUE",
    price: 214,
    originalPrice: 260,
    discountPercent: 18,
    rating: 4.9,
    reviewCount: 152,
    colors: ["#c9c2b3", "#8a7a63"],
    sizes: ["S", "M", "L"],
    imageLabel: "Product: Cashmere Knit",
  },
  {
    id: "leather-ankle-boot",
    name: "Leather Ankle Boot",
    brand: "ADDICTSTYLE",
    price: 286,
    rating: 4.7,
    reviewCount: 103,
    colors: ["#2b2b2b", "#5c3a24"],
    sizes: ["37", "38", "39", "40"],
    imageLabel: "Product: Leather Ankle Boot",
  },
  {
    id: "cropped-denim-jacket",
    name: "Cropped Denim Jacket",
    brand: "STUDIO NUE",
    price: 156,
    originalPrice: 190,
    discountPercent: 18,
    rating: 4.3,
    reviewCount: 48,
    colors: ["#3d4f63"],
    sizes: ["S", "M", "L"],
    imageLabel: "Product: Cropped Denim Jacket",
  },
  {
    id: "minimal-leather-tote",
    name: "Minimal Leather Tote",
    brand: "ADDICTSTYLE",
    price: 320,
    rating: 4.8,
    reviewCount: 66,
    colors: ["#111111", "#8a7a63"],
    sizes: ["One Size"],
    imageLabel: "Product: Minimal Leather Tote",
  },
];

export function FeaturedProducts() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-baseline justify-between">
        <h2
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{
            color: "var(--brand-primary)",
            fontFamily: "var(--font-heading)",
          }}
        >
          New Arrivals
        </h2>
        <Link
          href="/products"
          className="text-sm font-semibold underline"
          style={{ color: "var(--brand-primary)" }}
        >
          View all
        </Link>
      </div>
      <div
        className="grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-4"
        style={{ color: "var(--brand-primary)" }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

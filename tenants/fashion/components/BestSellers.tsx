import {
  ProductCard,
  type ProductCardProduct,
} from "@/shared/components/ProductCard";
import { HorizontalScroller } from "@/shared/components/HorizontalScroller";

/**
 * Fashion — homepage best-sellers rail.
 * Static placeholder products until features/storefront's useProducts()
 * supports a "best selling" sort/filter param backed by a real API.
 * Full black section (not just black accents) — it's the last real content
 * block before the footer, so this + the hero bookend the page in black
 * instead of leaving everything in between plain white.
 */
const bestSellers: ProductCardProduct[] = [
  {
    id: "wool-overcoat",
    name: "Wool Overcoat",
    brand: "ADDICTSTYLE",
    price: 248,
    rating: 4.6,
    imageLabel: "Product: Wool Overcoat",
  },
  {
    id: "cashmere-knit",
    name: "Cashmere Knit",
    brand: "STUDIO NUE",
    price: 214,
    rating: 4.9,
    imageLabel: "Product: Cashmere Knit",
  },
  {
    id: "leather-ankle-boot",
    name: "Leather Ankle Boot",
    brand: "ADDICTSTYLE",
    price: 286,
    rating: 4.7,
    imageLabel: "Product: Leather Ankle Boot",
  },
  {
    id: "silk-slip-dress",
    name: "Silk Slip Dress",
    brand: "ADDICTSTYLE",
    price: 168,
    rating: 4.8,
    imageLabel: "Product: Silk Slip Dress",
  },
  {
    id: "minimal-leather-tote",
    name: "Minimal Leather Tote",
    brand: "ADDICTSTYLE",
    price: 320,
    rating: 4.8,
    imageLabel: "Product: Minimal Leather Tote",
  },
  {
    id: "tailored-trouser",
    name: "Tailored Trouser",
    brand: "ADDICTSTYLE",
    price: 138,
    rating: 4.5,
    imageLabel: "Product: Tailored Trouser",
  },
];

export function BestSellers() {
  return (
    <section
      style={{
        backgroundColor: "var(--brand-primary)",
        color: "var(--brand-secondary)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <h2
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Best Sellers
          </h2>
          <div
            className="mt-3 h-0.5 w-10"
            style={{ backgroundColor: "var(--brand-secondary)" }}
          />
        </div>
        <HorizontalScroller>
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              compact
              className="w-[240px] flex-none"
            />
          ))}
        </HorizontalScroller>
      </div>
    </section>
  );
}

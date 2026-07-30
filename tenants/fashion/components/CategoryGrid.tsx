import Link from "next/link";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";

/**
 * Fashion — homepage featured-category grid.
 * Static placeholder categories until features/storefront's useCategories()
 * is backed by a real API — see categories.client.ts.
 */
const categories = [
  { label: "Dresses", href: "/categories/dresses", count: 128 },
  { label: "Shirts", href: "/categories/shirts", count: 84 },
  { label: "Jackets", href: "/categories/jackets", count: 46 },
  { label: "Pants", href: "/categories/pants", count: 92 },
  { label: "Shoes", href: "/categories/shoes", count: 61 },
  { label: "Accessories", href: "/categories/accessories", count: 73 },
];

export function CategoryGrid() {
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
          Shop by Category
        </h2>
        <Link
          href="/categories"
          className="text-sm font-semibold underline"
          style={{ color: "var(--brand-primary)" }}
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map(({ label, href, count }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-3.5"
            style={{ color: "var(--brand-primary)" }}
          >
            <ImagePlaceholder
              label={`Category: ${label}`}
              aspect="3/4"
              className="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
            <div>
              <div className="text-[15px] font-bold">{label}</div>
              <div className="mt-0.5 text-xs opacity-60">{count} items</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

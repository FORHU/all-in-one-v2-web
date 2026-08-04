import Link from "next/link";
import {
  Sofa,
  Lamp,
  UtensilsCrossed,
  Bed,
  Archive,
  Lightbulb,
} from "lucide-react";

/**
 * Living — homepage featured-category grid.
 * Static placeholder categories until features/storefront's useCategories()
 * is backed by a real API — see categories.client.ts.
 */
const categories = [
  { label: "Furniture", href: "/categories/furniture", Icon: Sofa },
  { label: "Decor", href: "/categories/decor", Icon: Lamp },
  { label: "Kitchen", href: "/categories/kitchen", Icon: UtensilsCrossed },
  { label: "Bedding", href: "/categories/bedding", Icon: Bed },
  { label: "Storage", href: "/categories/storage", Icon: Archive },
  { label: "Lighting", href: "/categories/lighting", Icon: Lightbulb },
];

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2
        className="mb-8 text-2xl font-bold tracking-tight"
        style={{
          color: "var(--brand-primary)",
          fontFamily: "var(--font-heading)",
        }}
      >
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map(({ label, href, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-3 rounded-2xl border p-6 text-center transition-colors hover:opacity-80"
            style={{
              borderColor:
                "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
              color: "var(--brand-primary)",
            }}
          >
            <Icon className="h-6 w-6" />
            <span
              className="text-sm font-medium"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

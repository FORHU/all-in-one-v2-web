import Link from "next/link";
import {
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Lightbulb,
  Gamepad2,
} from "lucide-react";

/**
 * Electronics — homepage featured-category grid.
 * Static placeholder categories until features/storefront's useCategories()
 * is backed by a real API — see categories.client.ts.
 */
const categories = [
  { label: "Phones", href: "/categories/phones", Icon: Smartphone },
  { label: "Laptops", href: "/categories/laptops", Icon: Laptop },
  { label: "Audio", href: "/categories/audio", Icon: Headphones },
  { label: "Wearables", href: "/categories/wearables", Icon: Watch },
  { label: "Smart Home", href: "/categories/smart-home", Icon: Lightbulb },
  { label: "Gaming", href: "/categories/gaming", Icon: Gamepad2 },
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

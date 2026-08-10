import Link from "next/link";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { fashionCategories } from "../data/categories";

/**
 * Fashion — full category listing page.
 * Same static data as components/CategoryGrid.tsx (see
 * tenants/fashion/data/categories.ts) until useCategories() is real.
 */
export function FashionCategoriesPage() {
  return (
    <FashionStorefrontLayout>
      <section
        className="mx-auto max-w-[1600px] px-6 py-16"
        style={{ color: "var(--brand-primary)" }}
      >
        <h1
          className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          All Categories
        </h1>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {fashionCategories.map(({ slug, label, count }) => (
            <Link
              key={slug}
              href={`/categories/${slug}`}
              className="group flex flex-col gap-3.5"
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
    </FashionStorefrontLayout>
  );
}

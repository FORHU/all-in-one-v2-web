import Link from "next/link";
import { BeautyStorefrontLayout } from "../layouts/StorefrontLayout";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { beautyCategories } from "../data/categories";
import { BEAUTY_MIRROR_COLORS as COLORS, beautyPlexMono } from "../theme";

/**
 * Beauty — full category listing page ("Mirror Shelf" aesthetic).
 * Same static data as data/categories.ts (matching beautyConfig.nav's 4
 * top-level categories) until this tenant has a real backend catalog —
 * same reasoning as tenants/fashion/pages/CategoriesPage.tsx.
 */
export function BeautyCategoriesPage() {
  return (
    <BeautyStorefrontLayout>
      <section
        className="mx-auto max-w-7xl px-6 py-16"
        style={{ color: COLORS.ink }}
      >
        <h1
          className="mb-10 text-3xl sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "0.04em" }}
        >
          All Categories
        </h1>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {beautyCategories.map(({ slug, label, count }) => (
            <Link
              key={slug}
              href={`/categories/${slug}`}
              className="group flex flex-col gap-3.5"
            >
              <ImagePlaceholder
                label={`Category: ${label}`}
                aspect="3/4"
                className="text-current transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              <div>
                <div className="text-[15px]" style={{ color: COLORS.inkSoft }}>
                  {label}
                </div>
                <div
                  className="mt-1 text-[11px] tracking-[0.14em]"
                  style={{
                    color: COLORS.muted,
                    fontFamily: beautyPlexMono.style.fontFamily,
                  }}
                >
                  {count} items
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </BeautyStorefrontLayout>
  );
}

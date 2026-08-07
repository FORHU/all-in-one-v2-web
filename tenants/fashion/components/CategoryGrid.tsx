"use client";

import Link from "next/link";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { Skeleton } from "@/shared/components/Skeleton";
import { useCategories } from "@/features/storefront/hooks/queries/useCategories";
import { useStorefrontPage } from "@/features/storefront/hooks/queries/useStorefrontPage";
import { buildCategoryImageMap } from "../utils/categoryRepresentativeProduct";

/**
 * Fashion — homepage featured-category grid.
 * Categories come from GET /v2/categories (useCategories). CatalogCategory
 * has no image field on the backend, so each tile's photo is sourced from
 * one of that category's own products instead — reuses the same "home"
 * storefront page query FeaturedProducts.tsx/BestSellers.tsx already fetch
 * (see useStorefrontPage.ts), so this doesn't add a network request.
 * Categories with no matching product (nothing seeded in them yet) fall
 * back to the placeholder rather than showing a wrong/fabricated image.
 */
export function CategoryGrid() {
  const { data: categories, isLoading, isError } = useCategories();
  const { data: page } = useStorefrontPage("home");
  const newArrivals = page?.sections.find((s) => s.strategy === "NEW_ARRIVALS");
  const categoryImages = buildCategoryImageMap(newArrivals?.products ?? []);

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

      {isLoading && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && !isError && categories && categories.length > 0 && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map(({ id, slug, name }) => {
            const imageUrl = categoryImages.get(id)?.thumbnailUrl;
            return (
              <Link
                key={id}
                href={`/categories/${slug}`}
                className="group flex flex-col gap-3.5"
                style={{ color: "var(--brand-primary)" }}
              >
                {imageUrl ? (
                  <div className="aspect-[3/4] overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element -- external unsplash URLs, remotePatterns not yet configured */}
                    <img
                      src={imageUrl}
                      alt={name}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    />
                  </div>
                ) : (
                  <ImagePlaceholder
                    label={`Category: ${name}`}
                    aspect="3/4"
                    className="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  />
                )}
                <div className="text-[15px] font-bold">{name}</div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

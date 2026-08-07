"use client";

import Link from "next/link";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useCategories } from "@/features/storefront/hooks/queries/useCategories";
import { useStorefrontPage } from "@/features/storefront/hooks/queries/useStorefrontPage";
import { buildCategoryImageMap } from "../utils/categoryRepresentativeProduct";

/**
 * Fashion — homepage editorial storytelling blocks.
 * Eyebrow/title/copy are intentionally static brand voice/marketing copy —
 * no backend model represents "editorial content" (that's what CmsPage
 * exists for, and it isn't wired up here). What IS real: each block's
 * target category (looked up by name via useCategories(), so the href
 * always points at a real, current category slug rather than a guessed
 * one) and its image (a representative product photo from that category,
 * reusing the "home" page query the other homepage sections already fetch
 * — see useStorefrontPage.ts and categoryRepresentativeProduct.ts).
 */
const collections = [
  {
    eyebrow: "TRENDING NOW",
    title: "The Tailored Line",
    copy: "Structured silhouettes reimagined in fluid, breathable fabrics — built for a wardrobe that moves through every season without compromise.",
    categoryName: "Women's Fashion",
    imageFirst: true,
  },
  {
    eyebrow: "JUST DROPPED",
    title: "Knitwear Reimagined",
    copy: "Soft-touch merino and responsibly sourced cashmere blends, cut for quiet layering from studio to street.",
    categoryName: "Men's Fashion",
    imageFirst: false,
  },
];

export function TrendingCollection() {
  const { data: categories } = useCategories();
  const { data: page } = useStorefrontPage("home");
  const newArrivals = page?.sections.find((s) => s.strategy === "NEW_ARRIVALS");
  const categoryImages = buildCategoryImageMap(newArrivals?.products ?? []);

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-16 px-6 py-16 sm:gap-24">
      {collections.map(({ eyebrow, title, copy, categoryName, imageFirst }) => {
        const category = categories?.find((c) => c.name === categoryName);
        const imageUrl = category
          ? categoryImages.get(category.id)?.thumbnailUrl
          : null;
        const href = category ? `/categories/${category.slug}` : "/categories";

        return (
          <div
            key={title}
            className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14"
          >
            <div className={imageFirst ? "order-1" : "order-1 lg:order-2"}>
              {imageUrl ? (
                <div className="h-[320px] w-full overflow-hidden rounded-2xl sm:h-[420px]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- external unsplash URLs, remotePatterns not yet configured */}
                  <img
                    src={imageUrl}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <ImagePlaceholder
                  label={`Editorial: ${title}`}
                  aspect="4/3"
                  className="h-[320px] w-full sm:h-[420px]"
                />
              )}
            </div>
            <div
              className={`flex max-w-md flex-col gap-4 ${
                imageFirst ? "order-2" : "order-2 lg:order-1"
              }`}
              style={{ color: "var(--brand-primary)" }}
            >
              <div className="text-xs font-bold tracking-widest opacity-60">
                {eyebrow}
              </div>
              <h3
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {title}
              </h3>
              <p className="text-[15px] leading-relaxed opacity-70">{copy}</p>
              <Link
                href={href}
                className="mt-2 self-start rounded-2xl px-6 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "var(--brand-secondary)",
                }}
              >
                Discover the Edit
              </Link>
            </div>
          </div>
        );
      })}
    </section>
  );
}

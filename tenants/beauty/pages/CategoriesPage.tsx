"use client";

import Link from "next/link";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useCategories } from "@/features/storefront/hooks/queries/useCategories";
import { useProducts } from "@/features/storefront/hooks/queries/useProducts";
import type { Category } from "@/features/storefront/contracts/categories.contract";
import { BeautyStorefrontLayout } from "../layouts/StorefrontLayout";
import { BEAUTY_MIRROR_COLORS as COLORS } from "../theme";

const cardStyle: React.CSSProperties = {
  backgroundColor: COLORS.glassBg,
  border: `1px solid ${COLORS.glassBorder}`,
  boxShadow: "0 1px 0 rgba(255,255,255,.7) inset",
  backdropFilter: "blur(26px) saturate(170%)",
  WebkitBackdropFilter: "blur(26px) saturate(170%)",
};

/**
 * One real category tile — fetches its first real product (same
 * "representative item" pattern as MirrorShelfCategoryCard/
 * CategoryDetailPage) purely for a real thumbnail + real item count; the
 * card always links to CategoryDetailPage via `category.slug`, which does
 * its own full real fetch independently.
 */
function CategoryTile({
  tenantSlug,
  category,
}: {
  tenantSlug: string;
  category: Category;
}) {
  const { data, isLoading } = useProducts(tenantSlug, {
    categorySlug: category.slug,
    limit: 1,
  });

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-lg"
      style={cardStyle}
    >
      <ImagePlaceholder
        label={category.name}
        imageUrl={data?.items[0]?.thumbnailUrl}
        aspect="3/4"
        className="text-current transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
      <div className="p-4">
        <div
          className="text-[15px] font-semibold"
          style={{ color: COLORS.ink }}
        >
          {category.name}
        </div>
        <div
          className="mt-1 text-[11px] tracking-[0.14em]"
          style={{ color: COLORS.muted }}
        >
          {isLoading ? "LOADING…" : `${data?.total ?? 0} ITEMS`}
        </div>
      </div>
    </Link>
  );
}

/**
 * Beauty — full category listing page ("Mirror Shelf" glass aesthetic).
 * Real data via useCategories(tenantSlug) — this used to render
 * data/categories.ts's 4 static top-level categories with fake mock
 * counts and no real images at all (stale from before beauty's catalog
 * was seeded). Now shows every real category the backend has (10 —
 * Cleansers, Masks, Moisturizers, Serums & Treatments, Skincare, Bath &
 * Body, Beauty Tools & Devices, Fragrance, Hair Care, Makeup &
 * Cosmetics — see categories.seeder.ts), each tile with its own real
 * representative product thumbnail and real item count, same pattern
 * CategoryDetailPage.tsx and MirrorShelfCategoryCard already use.
 */
export function BeautyCategoriesPage({ tenantSlug }: { tenantSlug: string }) {
  const { data: categories, isLoading } = useCategories(tenantSlug);
  const items = categories?.items ?? [];

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

        {isLoading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl"
                style={{ backgroundColor: COLORS.panel }}
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((category) => (
              <CategoryTile
                key={category.id}
                tenantSlug={tenantSlug}
                category={category}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-3 rounded-2xl py-20 text-center"
            style={{ border: `1px solid ${COLORS.panelBorder}` }}
          >
            <p className="text-sm" style={{ color: COLORS.muted }}>
              No categories found yet.
            </p>
          </div>
        )}
      </section>
    </BeautyStorefrontLayout>
  );
}

"use client";

import Link from "next/link";
import { useCategories } from "@/features/storefront/hooks/queries/useCategories";
import { useProducts } from "@/features/storefront/hooks/queries/useProducts";
import type { Category } from "@/features/storefront/contracts/categories.contract";
import { ElectronicsStorefrontLayout } from "../layouts/StorefrontLayout";
import { CategoryTile } from "../components/ShopSection";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";

/**
 * One real category tile — real item count via useProducts(limit:1).total,
 * illustrated with the same flat-tint category art CategoryTile/ShopSection
 * uses everywhere else in this tenant (not a photo — see that component's
 * doc comment).
 */
function CategoryCard({
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
      className="group flex flex-col overflow-hidden rounded-[22px] transition-colors"
      style={{
        backgroundColor: "#ffffff",
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <CategoryTile slug={category.slug} size={84} className="aspect-[4/3]" />
      <div className="p-4">
        <div className="text-[15px] font-bold">{category.name}</div>
        <div
          className="mt-1 text-[11px] tracking-wide"
          style={{ color: COLORS.muted, fontFamily: "var(--font-mono)" }}
        >
          {isLoading ? "LOADING…" : `${data?.total ?? 0} ITEMS`}
        </div>
      </div>
    </Link>
  );
}

/**
 * DigitFriend — full category listing page, restyled to the "digitfriend
 * ui.html" light cream/near-black/lime palette (was the earlier dark
 * "Circuit" theme). Real data via useCategories(tenantSlug).
 */
export function ElectronicsCategoriesPage({
  tenantSlug,
}: {
  tenantSlug: string;
}) {
  const { data: categories, isLoading } = useCategories(tenantSlug);
  const items = categories?.items ?? [];

  return (
    <ElectronicsStorefrontLayout>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h1
          className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          All Categories
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] animate-pulse rounded-[22px]"
                style={{ backgroundColor: COLORS.border }}
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((category) => (
              <CategoryCard
                key={category.id}
                tenantSlug={tenantSlug}
                category={category}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-3 rounded-[22px] py-20 text-center"
            style={{ border: `1px dashed ${COLORS.borderStrong}` }}
          >
            <p className="text-sm" style={{ color: COLORS.muted }}>
              No categories found yet.
            </p>
          </div>
        )}
      </section>
    </ElectronicsStorefrontLayout>
  );
}

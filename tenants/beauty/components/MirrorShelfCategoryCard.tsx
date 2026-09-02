"use client";

import { useProducts } from "@/features/storefront/hooks/queries/useProducts";
import type { Category } from "@/features/storefront/contracts/categories.contract";
import { BEAUTY_MIRROR_COLORS as COLORS, beautyPlexMono } from "../theme";

/**
 * Deterministic per-card bar heights (30–62px, matching the Mirror Shelf
 * reference's own hand-picked range) — purely decorative texture, not tied
 * to any real metric (there's nothing in this data model like "usage" to
 * chart, same as the mockup's own fabricated bar heights). A simple string
 * hash keyed on a stable seed rather than Math.random() so the
 * server-rendered and client-hydrated heights always match.
 */
function barHeights(seed: string, count: number): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return Array.from({ length: count }, (_, i) => {
    const v = (hash >> (i * 5)) & 0x1f; // 0–31
    return 30 + Math.round((v / 31) * 32); // 30–62
  });
}

/**
 * Pure presentational card — name, item count, decorative bars. Used both
 * by MirrorShelfCategoryCard (real category, live count below) and
 * MirrorShelfHero's sample-data fallback (tenants/beauty/data/
 * mirrorShelfSampleCategories.ts), so the two visually match exactly.
 */
export function MirrorShelfCategoryCardView({
  name,
  count,
  isLoading = false,
  seed,
}: {
  name: string;
  count: number;
  isLoading?: boolean;
  seed: string;
}) {
  const bars = barHeights(seed, 4);

  return (
    <div
      className="flex min-h-[120px] flex-1 flex-col rounded-2xl p-4"
      style={{
        border: `1px solid ${COLORS.panelBorder}`,
        background:
          "linear-gradient(150deg, rgba(255,255,255,.075) 0%, rgba(255,255,255,.02) 45%, rgba(255,255,255,.05) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,.16), 0 10px 24px rgba(0,0,0,.28)",
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[15px]" style={{ color: COLORS.inkSoft }}>
          {name}
        </span>
        <span
          className="flex-none text-[10px] tracking-[0.14em]"
          style={{
            color: COLORS.muted,
            fontFamily: beautyPlexMono.style.fontFamily,
          }}
        >
          {isLoading ? "…" : `${count} item${count === 1 ? "" : "s"}`}
        </span>
      </div>
      <div className="mt-auto flex h-[62px] items-end gap-2 pt-3">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-[30px] rounded"
            style={{
              height: h,
              border: "1px solid rgba(255,255,255,.12)",
              backgroundColor: "rgba(255,255,255,.05)",
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(255,255,255,.11) 0px, rgba(255,255,255,.11) 1px, transparent 1px, transparent 5px)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * One "Skincare"/"Makeup & Others" column entry for a *real* category —
 * fetches its real item count via useProducts' `.total` (GET
 * /v2/categories has no bulk per-category count, see categories.client.ts's
 * doc comment) and renders it through the shared view above.
 */
export function MirrorShelfCategoryCard({
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
    <MirrorShelfCategoryCardView
      name={category.name}
      count={data?.total ?? 0}
      isLoading={isLoading}
      seed={category.id}
    />
  );
}

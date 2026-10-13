"use client";

import Link from "next/link";
import { useProducts } from "@/features/storefront/hooks/queries/useProducts";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import type { Category } from "@/features/storefront/contracts/categories.contract";
import { BEAUTY_MIRROR_COLORS as COLORS } from "../theme";

const THUMB_TONES = [COLORS.thumb, COLORS.thumb2, COLORS.thumb3];

// Frosted-glass backdrop blur, matching Main.dc.html's `.glass`/`.glass-
// strong` classes — paired with a translucent `COLORS.glassBg`/
// `glassStrongBg` background.
const glassBlur: React.CSSProperties = {
  backdropFilter: "blur(26px) saturate(170%)",
  WebkitBackdropFilter: "blur(26px) saturate(170%)",
};

/** The one real product a card previews in MirrorShelfHero's center panel on click — see that file's `previewProduct` state. */
export interface MirrorShelfPreviewProduct {
  title: string;
  thumbnailUrl: string | null;
  price: number | null;
  slug: string;
}

/**
 * Pure presentational card — name, item count, a row of thumbnails (one
 * per item, capped at 5). Used both by MirrorShelfCategoryCard
 * (real category, real product thumbnails via the `thumbnails` prop) and
 * MirrorShelfHero's sample-data fallback (tenants/beauty/data/
 * mirrorShelfSampleCategories.ts, no `thumbnails` — there's no real
 * product behind a sample card's thumb slot, so those stay solid-color
 * placeholders rather than pretending to be real photos).
 *
 * Each individual thumbnail (not the card as a whole) is its own click
 * target: clicking a specific product's thumbnail mirrors *that* product
 * into MirrorShelfHero's center panel — not just the category's first
 * item — since a shopper picking a particular thumbnail expects to see
 * that exact product reflected, not whichever one happened to load first.
 * Only thumbnails that carry a `slug` (a real product) are clickable;
 * omit it (or omit `onPreview`) and a thumbnail is a plain image, which is
 * what the sample-card fallback path (no `thumbnails` prop at all) and
 * `href`-only usage fall back to — `href` there still makes the card's
 * name/count header a plain link to a representative product's PDP.
 */
export function MirrorShelfCategoryCardView({
  name,
  count,
  isLoading = false,
  href,
  thumbnails,
  onPreview,
}: {
  name: string;
  count: number;
  isLoading?: boolean;
  href?: string;
  /** Real product thumbnails for this category, when available — omit to fall back to decorative solid-color swatches (the sample-card path). `slug` present makes that specific thumbnail clickable. */
  thumbnails?: {
    url: string | null;
    label: string;
    price?: number | null;
    slug?: string;
  }[];
  onPreview?: (product: MirrorShelfPreviewProduct | null) => void;
}) {
  const thumbCount = Math.max(1, Math.min(count, 5));

  const header = (
    <div className="mb-3 flex items-baseline justify-between gap-2">
      <span
        className="text-base font-semibold tracking-tight"
        style={{ color: COLORS.ink }}
      >
        {name}
      </span>
      <span
        className="flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold"
        style={{
          backgroundColor: COLORS.glassStrongBg,
          border: `1px solid ${COLORS.glassStrongBorder}`,
          color: COLORS.ink,
        }}
      >
        {isLoading ? "…" : `${count} item${count === 1 ? "" : "s"}`}
      </span>
    </div>
  );

  // No flex-1 on the card — it should keep its natural content height, not
  // grow to fill whatever vertical space its flex-col column has left
  // (that stretching, not a missing justify-center, was the real cause of
  // "empty space" under a short column: the one card present was growing
  // to consume all ~2000px of available height instead of staying compact).
  // Translucent + backdrop-blur (Main.dc.html's `.glass.cat`), not an
  // opaque white card.
  const cardStyle = {
    backgroundColor: COLORS.glassBg,
    border: `1px solid ${COLORS.glassBorder}`,
    boxShadow: "0 1px 0 rgba(255,255,255,.7) inset",
    ...glassBlur,
  };

  const nameRow = href ? (
    <Link href={href} className="block">
      {header}
    </Link>
  ) : (
    header
  );

  return (
    <div className="flex-none rounded-[22px] p-4" style={cardStyle}>
      {nameRow}
      {/* Fixed-width thumbs (not flex-1) — a 2-item card and a 5-item
          card must show the same-size thumbnails, not each item's share
          of the full row. Aspect 37/48 and the white-tinted hairline
          border match the reference's own `.th` tile exactly. */}
      <div className="grid grid-cols-5 gap-2">
        {thumbnails
          ? thumbnails.slice(0, 5).map((thumb, i) => {
              const tile = (
                <ImagePlaceholder
                  imageUrl={thumb.url}
                  label={thumb.label}
                  aspect="37/48"
                  className="w-full border border-white/70 text-current"
                />
              );
              if (thumb.slug && onPreview) {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      onPreview({
                        title: thumb.label,
                        thumbnailUrl: thumb.url,
                        price: thumb.price ?? null,
                        slug: thumb.slug!,
                      })
                    }
                    className="block transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    {tile}
                  </button>
                );
              }
              return <div key={i}>{tile}</div>;
            })
          : Array.from({ length: thumbCount }, (_, i) => (
              <div
                key={i}
                className="rounded-[14px]"
                style={{
                  aspectRatio: "37/48",
                  backgroundColor: THUMB_TONES[i % THUMB_TONES.length],
                  border: `1px solid ${COLORS.glassBorder}`,
                }}
              />
            ))}
      </div>
    </div>
  );
}

/**
 * One "Skincare"/"Makeup & Others" column entry for a *real* category —
 * fetches up to 5 real products (GET /v2/categories has no bulk
 * per-category count, see categories.client.ts's doc comment, so this
 * same call also doubles as the `.total` count) and passes each one's
 * thumbnailUrl/price/slug through, so every thumbnail is individually
 * clickable to mirror *that* product into MirrorShelfHero's center panel
 * (see MirrorShelfCategoryCardView's doc comment). `href` on the card's
 * name/count header still points at the first fetched product's PDP as a
 * secondary, always-available way in (there's no "category landing page"
 * to send that click to instead — see CategoryDetailPage's own doc
 * comment); stays non-interactive if the category has zero real products
 * yet.
 */
export function MirrorShelfCategoryCard({
  tenantSlug,
  category,
  onPreview,
}: {
  tenantSlug: string;
  category: Category;
  onPreview?: (product: MirrorShelfPreviewProduct | null) => void;
}) {
  const { data, isLoading } = useProducts(tenantSlug, {
    categorySlug: category.slug,
    limit: 5,
  });

  const firstProduct = data?.items[0];

  return (
    <MirrorShelfCategoryCardView
      name={category.name}
      count={data?.total ?? 0}
      isLoading={isLoading}
      href={firstProduct ? `/products/${firstProduct.slug}` : undefined}
      thumbnails={data?.items.map((p) => ({
        url: p.thumbnailUrl,
        label: p.title,
        price: p.salePrice ?? p.price,
        slug: p.slug,
      }))}
      onPreview={onPreview}
    />
  );
}

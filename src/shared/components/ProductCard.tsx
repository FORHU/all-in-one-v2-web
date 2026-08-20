"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Eye } from "lucide-react";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { StarRating } from "./StarRating";

export interface ProductCardProduct {
  id: string;
  /** Optional — only real API-backed products have one; static mock data doesn't. When present, the card links to /products/{slug}. */
  slug?: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount?: number;
  colors?: string[];
  sizes?: string[];
  imageLabel: string;
  imageUrl?: string | null;
}

/**
 * Quick-add/quick-view are callback props rather than direct store calls —
 * shared/ components can't import features/ (see
 * tools/validate-architecture.mjs) — the tenant page wires the actual
 * cart logic.
 */
export function ProductCard({
  product,
  compact = false,
  className = "",
  onQuickView,
  onQuickAdd,
  onBuyNow,
  index,
}: {
  product: ProductCardProduct;
  compact?: boolean;
  className?: string;
  onQuickView?: (product: ProductCardProduct) => void;
  onQuickAdd?: (product: ProductCardProduct) => void;
  onBuyNow?: (product: ProductCardProduct) => void;
  /**
   * 1-based position in the rail — when given, swaps the caption for an
   * editorial numbered-tile treatment (centered, serif eyebrow number, no
   * brand line) instead of the default left-aligned brand/name stack. Same
   * idea as HeroBanner's numbered look items, applied to a plain product
   * grid (see components/Trending.tsx).
   */
  index?: number;
}) {
  const router = useRouter();

  // Brief "Added" confirmation + bounce on the quick-add button — purely
  // visual feedback, doesn't affect the actual add-to-cart call. `addPulse`
  // is used as a React `key` on the button so the CSS animation restarts on
  // every click, even a second click before the first bounce finishes.
  const [justAdded, setJustAdded] = useState(false);
  const [addPulse, setAddPulse] = useState(0);
  const addedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQuickAdd = () => {
    if (!onQuickAdd) return;
    onQuickAdd(product);
    setJustAdded(true);
    setAddPulse((n) => n + 1);
    if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    addedTimeoutRef.current = setTimeout(() => setJustAdded(false), 1400);
  };

  const image = (
    <ImagePlaceholder
      label={product.imageLabel}
      imageUrl={product.imageUrl}
      aspect="3/4"
      className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
    />
  );

  const hasReviews = Boolean(product.reviewCount);

  const info = (
    <>
      {index ? (
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.15em]"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--brand-accent, var(--brand-primary))",
          }}
        >
          {String(index).padStart(2, "0")}
        </div>
      ) : (
        product.brand && (
          <div className="text-[11px] font-bold uppercase tracking-wide opacity-60">
            {product.brand}
          </div>
        )
      )}
      <div
        className={
          index
            ? "text-[13px] font-semibold uppercase tracking-wide"
            : "text-sm font-semibold"
        }
        style={index ? { fontFamily: "var(--font-heading)" } : undefined}
      >
        {product.name}
      </div>
      {hasReviews && (
        <StarRating
          rating={product.rating}
          reviewCount={product.reviewCount}
          className={`mt-0.5 ${index ? "justify-center" : ""}`}
        />
      )}
      <div className="mt-0.5 flex items-center gap-2">
        <span className="text-[15px] font-bold">
          ${product.price.toFixed(2)}
        </span>
        {product.originalPrice && (
          <span className="text-[13px] opacity-40 line-through">
            ${product.originalPrice.toFixed(2)}
          </span>
        )}
      </div>
    </>
  );

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
        {product.slug ? (
          <Link
            href={`/products/${product.slug}`}
            className="block h-full w-full"
          >
            {image}
          </Link>
        ) : (
          image
        )}

        {!compact && onQuickView && (
          <button
            type="button"
            onClick={() => onQuickView(product)}
            aria-label={`Quick view ${product.name}`}
            className="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--brand-secondary) 90%, transparent)",
            }}
          >
            <Eye
              className="h-4 w-4"
              style={{ color: "var(--brand-primary)" }}
              strokeWidth={2}
            />
          </button>
        )}

        {!compact && (product.discountPercent ?? 0) > 0 && (
          <div
            className={`absolute left-3 rounded-lg px-2.5 py-1 text-[11px] font-bold ${onQuickView ? "top-[46px]" : "top-3"}`}
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "var(--brand-secondary)",
            }}
          >
            -{product.discountPercent}%
          </div>
        )}

        {!compact && (onQuickAdd || onBuyNow) && (
          <div className="absolute inset-x-2.5 bottom-2.5 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {onQuickAdd && (
              <button
                key={addPulse}
                type="button"
                onClick={handleQuickAdd}
                className={`flex-1 rounded-lg py-2.5 text-[12px] font-semibold ${
                  justAdded ? "animate-add-bounce" : ""
                }`}
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "var(--brand-secondary)",
                }}
              >
                {justAdded ? (
                  <span className="flex items-center justify-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    Added
                  </span>
                ) : (
                  "Add to Cart"
                )}
              </button>
            )}
            {onBuyNow && (
              <button
                type="button"
                onClick={() => onBuyNow(product)}
                // /checkout reads headers() (tenant resolution), which
                // forces it to be a dynamic route — every navigation there
                // needs a fresh server round-trip, showing the root
                // loading.tsx fallback while it fetches. Prefetching on
                // hover (which almost always precedes the actual click)
                // gets that round-trip out of the way beforehand, so the
                // click itself lands on an already-warm route instead of
                // showing that loading flash.
                onMouseEnter={() => router.prefetch("/checkout")}
                className="flex-1 rounded-lg border py-2.5 text-[12px] font-semibold"
                style={{
                  borderColor: "var(--brand-primary)",
                  backgroundColor:
                    "color-mix(in srgb, var(--brand-secondary) 90%, transparent)",
                  color: "var(--brand-primary)",
                }}
              >
                Buy Now
              </button>
            )}
          </div>
        )}
      </div>

      {product.slug ? (
        <Link
          href={`/products/${product.slug}`}
          className={`flex flex-col gap-0.5 ${index ? "items-center text-center" : ""}`}
        >
          {info}
        </Link>
      ) : (
        <div
          className={`flex flex-col gap-0.5 ${index ? "items-center text-center" : ""}`}
        >
          {info}
        </div>
      )}
    </div>
  );
}

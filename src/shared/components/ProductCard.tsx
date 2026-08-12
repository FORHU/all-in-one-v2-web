"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
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
}: {
  product: ProductCardProduct;
  compact?: boolean;
  className?: string;
  onQuickView?: (product: ProductCardProduct) => void;
  onQuickAdd?: (product: ProductCardProduct) => void;
  onBuyNow?: (product: ProductCardProduct) => void;
}) {
  const image = (
    <ImagePlaceholder
      label={product.imageLabel}
      imageUrl={product.imageUrl}
      aspect="3/4"
      className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
    />
  );

  const info = (
    <>
      <div className="text-[11px] font-bold uppercase tracking-wide opacity-60">
        {product.brand}
      </div>
      <div className="text-sm font-semibold">{product.name}</div>
      <StarRating
        rating={product.rating}
        reviewCount={product.reviewCount}
        className="mt-0.5"
      />
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

      {!compact && product.colors && product.colors.length > 0 && (
        <div className="mt-1.5 flex gap-1.5">
          {product.colors.map((color) => (
            <span
              key={color}
              className="h-4 w-4 rounded-full border border-current/15"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      {!compact && product.sizes && product.sizes.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {product.sizes.map((size) => (
            <span
              key={size}
              className="rounded-md border border-current/15 px-1.5 py-0.5 text-[10px] font-semibold opacity-60"
            >
              {size}
            </span>
          ))}
        </div>
      )}
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
                type="button"
                onClick={() => onQuickAdd(product)}
                className="flex-1 rounded-lg py-2.5 text-[12px] font-semibold"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "var(--brand-secondary)",
                }}
              >
                Add to Cart
              </button>
            )}
            {onBuyNow && (
              <button
                type="button"
                onClick={() => onBuyNow(product)}
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
          className="flex flex-col gap-0.5"
        >
          {info}
        </Link>
      ) : (
        <div className="flex flex-col gap-0.5">{info}</div>
      )}
    </div>
  );
}

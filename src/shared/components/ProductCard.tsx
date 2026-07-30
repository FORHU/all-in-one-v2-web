"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { StarRating } from "./StarRating";

export interface ProductCardProduct {
  id: string;
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
}

/**
 * Favorite state is local-only for now — there is no wishlist store/endpoint
 * yet (see features/storefront). Quick-add is presentational only until
 * /v2/cart is implemented (features/storefront/api/cart.client.ts).
 */
export function ProductCard({
  product,
  compact = false,
  className = "",
}: {
  product: ProductCardProduct;
  compact?: boolean;
  className?: string;
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
        <ImagePlaceholder
          label={product.imageLabel}
          aspect="3/4"
          className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {!compact && (product.discountPercent ?? 0) > 0 && (
          <div
            className="absolute left-3 top-3 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            -{product.discountPercent}%
          </div>
        )}

        {!compact && (
          <button
            type="button"
            onClick={() => setIsFavorite((prev) => !prev)}
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isFavorite}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90"
          >
            <Heart
              className="h-4 w-4"
              style={{ color: "var(--brand-primary)" }}
              fill={isFavorite ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </button>
        )}

        {!compact && (
          <button
            type="button"
            className="absolute inset-x-2.5 bottom-2.5 rounded-lg py-2.5 text-[13px] font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            Quick Add to Cart
          </button>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
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
          <span className="text-[15px] font-bold">${product.price}</span>
          {product.originalPrice && (
            <span className="text-[13px] opacity-40 line-through">
              ${product.originalPrice}
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
      </div>
    </div>
  );
}

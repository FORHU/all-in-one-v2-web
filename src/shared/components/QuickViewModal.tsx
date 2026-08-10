"use client";

import { useEffect, useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { StarRating } from "./StarRating";
import type { ProductCardProduct } from "./ProductCard";

export interface QuickViewSelection {
  size?: string;
  color?: string;
  quantity: number;
}

/**
 * Quick-view dialog for a single product, with selectable size/color and a
 * quantity stepper. "Add to Cart" is a callback prop (not a direct store
 * call) — shared/ components can't import features/ (see
 * tools/validate-architecture.mjs) — the tenant page wires the actual cart
 * logic.
 */
export function QuickViewModal({
  product,
  onClose,
  onAddToCart,
}: {
  product: ProductCardProduct | null;
  onClose: () => void;
  onAddToCart?: (
    product: ProductCardProduct,
    selection: QuickViewSelection,
  ) => void;
}) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    setSelectedSize(product.sizes?.[0]);
    setSelectedColor(product.colors?.[0]);
    setQuantity(1);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 grid max-h-[90vh] w-full max-w-2xl grid-cols-1 gap-6 overflow-y-auto rounded-2xl p-6 sm:grid-cols-2 sm:p-8"
        style={{
          backgroundColor: "var(--brand-secondary)",
          color: "var(--brand-primary)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-current/5"
        >
          <X className="h-4 w-4" />
        </button>

        <ImagePlaceholder
          label={product.imageLabel}
          imageUrl={product.imageUrl}
          aspect="3/4"
          className="w-full"
        />

        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold uppercase tracking-wide opacity-60">
            {product.brand}
          </div>
          <h2 className="text-xl font-bold tracking-tight">{product.name}</h2>
          <StarRating
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-bold">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm opacity-40 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {product.colors && product.colors.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              <span className="text-xs font-semibold opacity-60">Color</span>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    aria-label={color}
                    aria-pressed={selectedColor === color}
                    className="h-7 w-7 rounded-full border-2"
                    style={{
                      backgroundColor: color,
                      borderColor:
                        selectedColor === color
                          ? "var(--brand-primary)"
                          : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              <span className="text-xs font-semibold opacity-60">Size</span>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize === size}
                    className="rounded-md border px-2.5 py-1 text-xs font-semibold"
                    style={{
                      borderColor:
                        selectedSize === size
                          ? "var(--brand-primary)"
                          : "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
                      backgroundColor:
                        selectedSize === size
                          ? "var(--brand-primary)"
                          : "transparent",
                      color:
                        selectedSize === size
                          ? "var(--brand-secondary)"
                          : "var(--brand-primary)",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 flex flex-col gap-1.5">
            <span className="text-xs font-semibold opacity-60">Quantity</span>
            <div className="flex items-center gap-2 self-start rounded-full border border-current/15 px-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-8 w-8 items-center justify-center"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="flex h-8 w-8 items-center justify-center"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onAddToCart?.(product, {
                size: selectedSize,
                color: selectedColor,
                quantity,
              });
              onClose();
            }}
            className="mt-4 h-11 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "var(--brand-secondary)",
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

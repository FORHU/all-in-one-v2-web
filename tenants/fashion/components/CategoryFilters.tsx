"use client";

import { Accordion } from "@/shared/components/Accordion";

export interface CategoryFilterState {
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
}

/**
 * Swatch hex -> human label. Kept for other consumers (OrderSuccessPage,
 * CartContents) that display a saved cart line's color and gracefully
 * fall back to the raw value (`COLOR_NAMES[color] ?? color`) when it isn't
 * a known hex code — which is the common case now, since real product
 * variants carry color as a name string (e.g. "Terracotta"), not hex.
 */
export const COLOR_NAMES: Record<string, string> = {
  "#2b2b2b": "Charcoal",
  "#8a7a63": "Taupe",
  "#c9c2b3": "Sand",
  "#111111": "Black",
  "#7c1f2c": "Burgundy",
  "#e7e2d6": "Ivory",
  "#3a4a3f": "Forest Green",
  "#5a5a52": "Olive Grey",
  "#5c3a24": "Brown",
  "#3d4f63": "Slate Blue",
};

/**
 * Fashion — category page filter sidebar (Size / Color / Price).
 * Facet options and callbacks are supplied by the parent page, derived
 * from real product variants (see CategoryDetailPage.tsx) — this
 * component holds no product data of its own. Color renders as labeled
 * pills rather than swatches: real variant colors are name strings (e.g.
 * "Terracotta"), not hex codes, so there's no color value to paint a
 * swatch with. No Brand facet — every product in this catalog belongs to
 * one storefront brand, so a brand filter would have nothing to filter.
 */
export function CategoryFilters({
  availableSizes,
  availableColors,
  priceBounds,
  filters,
  onToggleSize,
  onToggleColor,
  onPriceChange,
}: {
  availableSizes: string[];
  availableColors: string[];
  priceBounds: [number, number];
  filters: CategoryFilterState;
  onToggleSize: (size: string) => void;
  onToggleColor: (color: string) => void;
  onPriceChange: (range: [number, number]) => void;
}) {
  return (
    <div className="flex flex-col">
      <Accordion title="Size">
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => {
            const active = filters.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => onToggleSize(size)}
                aria-pressed={active}
                className="rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors"
                style={{
                  borderColor: active
                    ? "var(--brand-primary)"
                    : "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
                  backgroundColor: active
                    ? "var(--brand-primary)"
                    : "transparent",
                  color: active
                    ? "var(--brand-secondary)"
                    : "var(--brand-primary)",
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </Accordion>

      <Accordion title="Color">
        <div className="flex flex-wrap gap-2">
          {availableColors.map((color) => {
            const active = filters.colors.includes(color);
            return (
              <button
                key={color}
                type="button"
                onClick={() => onToggleColor(color)}
                aria-pressed={active}
                className="rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors"
                style={{
                  borderColor: active
                    ? "var(--brand-primary)"
                    : "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
                  backgroundColor: active
                    ? "var(--brand-primary)"
                    : "transparent",
                  color: active
                    ? "var(--brand-secondary)"
                    : "var(--brand-primary)",
                }}
              >
                {color}
              </button>
            );
          })}
        </div>
      </Accordion>

      <Accordion title="Price Range" className="border-b-0">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs font-semibold opacity-70">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide opacity-50">
              Min
              <input
                type="range"
                min={priceBounds[0]}
                max={priceBounds[1]}
                value={filters.priceRange[0]}
                onChange={(event) => {
                  const next = Math.min(
                    Number(event.target.value),
                    filters.priceRange[1],
                  );
                  onPriceChange([next, filters.priceRange[1]]);
                }}
                className="w-full"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide opacity-50">
              Max
              <input
                type="range"
                min={priceBounds[0]}
                max={priceBounds[1]}
                value={filters.priceRange[1]}
                onChange={(event) => {
                  const next = Math.max(
                    Number(event.target.value),
                    filters.priceRange[0],
                  );
                  onPriceChange([filters.priceRange[0], next]);
                }}
                className="w-full"
              />
            </label>
          </div>
        </div>
      </Accordion>
    </div>
  );
}

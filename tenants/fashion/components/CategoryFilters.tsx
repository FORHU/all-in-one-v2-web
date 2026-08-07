"use client";

import { Accordion } from "@/shared/components/Accordion";
import type { ProductAttributeOption } from "@/features/storefront/contracts/products.contract";

export interface CategoryFilterState {
  sizes: string[];
  colors: string[];
  brands: string[];
  priceRange: [number, number];
}

/**
 * Hex -> human label fallback, used by cart/order-success displays
 * (CartContents, OrderSuccessPage) to label a color already stored on a cart
 * line item. Unrelated to this component's own facet-driven color swatches
 * below, which now carry their own `label` from the API. Consumers fall back
 * to the raw hex string when a color isn't in this table, so an incomplete
 * mapping degrades gracefully rather than breaking.
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
  "#000000": "Black",
  "#FFFFFF": "White",
  "#000080": "Navy Blue",
  "#DC143C": "Crimson Red",
  "#708238": "Olive Green",
};

/**
 * Fashion — category page filter sidebar (Size / Color / Price / Brand).
 * Facet options and callbacks are all supplied by the parent page, sourced
 * from the API's `facets` payload (see CategoryDetailPage) — this component
 * holds no product data of its own. `filters.sizes`/`filters.colors` hold
 * attribute `value`s (e.g. "m", "black"), matching the API's filter params.
 */
export function CategoryFilters({
  availableSizes,
  availableColors,
  availableBrands,
  priceBounds,
  filters,
  onToggleSize,
  onToggleColor,
  onToggleBrand,
  onPriceChange,
}: {
  availableSizes: ProductAttributeOption[];
  availableColors: ProductAttributeOption[];
  availableBrands: string[];
  priceBounds: [number, number];
  filters: CategoryFilterState;
  onToggleSize: (size: string) => void;
  onToggleColor: (color: string) => void;
  onToggleBrand: (brand: string) => void;
  onPriceChange: (range: [number, number]) => void;
}) {
  return (
    <div className="flex flex-col">
      <Accordion title="Size">
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => {
            const active = filters.sizes.includes(size.value);
            return (
              <button
                key={size.value}
                type="button"
                onClick={() => onToggleSize(size.value)}
                aria-pressed={active}
                title={size.label}
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
                {size.value.toUpperCase()}
              </button>
            );
          })}
        </div>
      </Accordion>

      <Accordion title="Color">
        <div className="flex flex-wrap gap-3">
          {availableColors.map((color) => {
            const active = filters.colors.includes(color.value);
            return (
              <button
                key={color.value}
                type="button"
                onClick={() => onToggleColor(color.value)}
                aria-pressed={active}
                aria-label={color.label}
                title={color.label}
                className="h-7 w-7 rounded-full border-2 transition-colors"
                style={{
                  backgroundColor: color.swatchColor ?? "#999999",
                  borderColor: active ? "var(--brand-primary)" : "transparent",
                }}
              />
            );
          })}
        </div>
      </Accordion>

      <Accordion title="Price Range">
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

      <Accordion title="Brand" className="border-b-0">
        <div className="flex flex-col gap-2.5">
          {availableBrands.map((brand) => {
            const active = filters.brands.includes(brand);
            return (
              <label
                key={brand}
                className="flex cursor-pointer items-center gap-2.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => onToggleBrand(brand)}
                  className="h-4 w-4"
                />
                {brand}
              </label>
            );
          })}
        </div>
      </Accordion>
    </div>
  );
}

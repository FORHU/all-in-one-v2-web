"use client";

import type { ProductAttributeOption } from "@/features/storefront/contracts/products.contract";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";

/**
 * CJ variants sometimes share a display label while their values differ
 * ("CK61 English" / "CK104 English" both labelled "English") — those fall
 * back to the full value so every chip is distinguishable.
 */
function optionLabeler(options: ProductAttributeOption[]) {
  const counts = new Map<string, number>();
  options.forEach((o) => counts.set(o.label, (counts.get(o.label) ?? 0) + 1));
  return (o: ProductAttributeOption) =>
    (counts.get(o.label) ?? 0) > 1 ? o.value : o.label;
}

/**
 * A row of variant chips (color or size). Shared by the PDP
 * (pages/ProductDetailPage.tsx) and the grid's QuickAddDialog so both pick
 * variants identically. Unavailable (zero-stock) options stay clickable but
 * render struck through, same as before.
 */
export function OptionGroup({
  label,
  options,
  selected,
  onSelect,
  isAvailable,
}: {
  label: string;
  options: ProductAttributeOption[];
  selected: string | undefined;
  onSelect: (value: string) => void;
  isAvailable: (value: string) => boolean;
}) {
  const labelFor = optionLabeler(options);
  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend
        className="mb-2 p-0 text-xs font-medium uppercase tracking-wide"
        style={{ color: COLORS.muted, fontFamily: "var(--font-mono)" }}
      >
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.value === selected;
          const available = isAvailable(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(o.value)}
              className={`min-h-[40px] rounded-full px-4 text-sm font-medium ${available ? "" : "line-through opacity-50"}`}
              style={{
                border: `1px solid ${on ? COLORS.ink : COLORS.borderStrong}`,
                backgroundColor: on ? COLORS.ink : "#ffffff",
                color: on ? "#ffffff" : COLORS.ink,
              }}
            >
              {labelFor(o)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

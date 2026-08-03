"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { fashionLooks } from "../data/looks";

/**
 * Fashion — "Complete the Look" widget shown above the filters+grid on
 * pages/CategoryDetailPage.tsx. The look image is a prev/next carousel over
 * data/looks.ts (same arrow/dot pattern as components/HeroBanner.tsx's own
 * "Get the Look" carousel) so the two widgets never disagree about what's
 * in "The Off-Duty Set" etc.
 */
export function TrendingLookbook() {
  const [activeIndex, setActiveIndex] = useState(0);
  const addCartItem = useLocalCartStore((s) => s.addItem);
  const activeLook = fashionLooks[activeIndex];
  const total = activeLook.items.reduce((sum, item) => sum + item.price, 0);

  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + fashionLooks.length) % fashionLooks.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % fashionLooks.length);

  const addAllToBag = () => {
    activeLook.items.forEach((item) =>
      addCartItem({
        productId: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        imageLabel: item.imageLabel,
        size: item.size,
        quantity: 1,
      }),
    );
    toast.success(`Added ${activeLook.items.length} items to your bag`);
  };

  const borderColor =
    "color-mix(in srgb, var(--brand-primary) 12%, transparent)";
  const arrowButtonClass =
    "flex h-11 w-11 flex-none items-center justify-center rounded-full border outline-none transition-colors hover:bg-current/[0.06] focus-visible:ring-2 focus-visible:ring-current/30";

  return (
    <section
      className="mx-auto max-w-7xl px-6 pt-10"
      style={{ color: "var(--brand-primary)" }}
    >
      <div
        className="flex w-full flex-col gap-6 rounded-2xl border p-6"
        style={{ borderColor }}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs font-bold uppercase tracking-widest opacity-50">
            Shop the Look
          </span>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {activeLook.name}
          </h2>
        </div>

        <div className="flex w-full items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous look"
            className={arrowButtonClass}
            style={{
              borderColor:
                "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-3 sm:gap-4">
            {fashionLooks.map((look, i) => {
              const rel =
                (i - activeIndex + fashionLooks.length) % fashionLooks.length;
              const pos = rel === 0 ? 0 : rel === 1 ? 1 : -1;
              const isActive = pos === 0;
              return (
                <motion.button
                  key={look.id}
                  layout
                  transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-pressed={isActive}
                  aria-label={`Show ${look.name}`}
                  className={`group flex min-w-0 flex-col items-center gap-2 transition-opacity duration-300 ${
                    isActive
                      ? "w-[46%] sm:w-[38%] lg:w-auto"
                      : "w-[24%] opacity-50 hover:opacity-90 sm:w-[22%] lg:w-auto"
                  }`}
                  style={{ order: pos + 1 }}
                >
                  <span
                    className="inline-block w-full min-w-0 overflow-hidden rounded-2xl border-2 transition-all duration-300 group-hover:scale-[1.02] lg:w-auto"
                    style={{
                      borderColor: isActive
                        ? "var(--brand-primary)"
                        : "transparent",
                      boxShadow: isActive
                        ? "0 12px 40px color-mix(in srgb, var(--brand-primary) 15%, transparent)"
                        : "none",
                    }}
                  >
                    <ImagePlaceholder
                      label={look.imageLabel}
                      aspect="3/4"
                      className={
                        isActive
                          ? "w-full h-auto lg:h-[42vh] lg:max-h-[440px] lg:w-auto"
                          : "w-full h-auto lg:h-[30vh] lg:max-h-[310px] lg:w-auto"
                      }
                    />
                  </span>
                  <span
                    className={`truncate text-center text-xs font-semibold transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-0 sm:opacity-60"
                    }`}
                  >
                    {look.name}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next look"
            className={arrowButtonClass}
            style={{
              borderColor:
                "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2">
          {fashionLooks.map((look, i) => (
            <button
              key={look.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show ${look.name}`}
              aria-current={i === activeIndex}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === activeIndex ? "20px" : "6px",
                backgroundColor:
                  i === activeIndex
                    ? "var(--brand-primary)"
                    : "color-mix(in srgb, var(--brand-primary) 30%, transparent)",
              }}
            />
          ))}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide opacity-70">
            Complete the Look
          </h3>
          <div className="flex flex-wrap gap-3">
            {activeLook.items.map((item) => (
              <div
                key={item.id}
                className="flex min-w-[110px] flex-1 flex-col items-center gap-1 rounded-2xl border px-4 py-5 text-center"
                style={{ borderColor }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide opacity-50">
                  {item.tag}
                </span>
                <span className="text-sm font-semibold">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex items-center justify-between border-t pt-4"
          style={{ borderColor }}
        >
          <span className="text-2xl font-bold">${total}</span>
          <button
            type="button"
            onClick={addAllToBag}
            className="rounded-full px-8 py-3 text-sm font-bold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "var(--brand-secondary)",
            }}
          >
            Add All to Bag
          </button>
        </div>
      </div>
    </section>
  );
}

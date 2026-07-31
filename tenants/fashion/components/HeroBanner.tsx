"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { fashionLooks, type LookItem } from "../data/looks";

/**
 * Fashion — homepage hero: "Get the Look" curated outfit carousel.
 * Replaces the earlier full-bleed photo hero. Left: a fanned card stack of
 * data/looks.ts's outfit photos — click a back card (or its expand button)
 * to bring it forward. Right: that look's shoppable items, individually
 * addable or all at once, both wired to the real useLocalCartStore (see
 * that store's doc comment — client-only stand-in for /v2/cart).
 */
export function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const addCartItem = useLocalCartStore((s) => s.addItem);

  const activeLook = fashionLooks[activeIndex];
  const total = activeLook.items.reduce((sum, item) => sum + item.price, 0);

  const addToBag = (item: LookItem) => {
    addCartItem({
      productId: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      imageLabel: item.imageLabel,
      size: item.size,
      quantity: 1,
    });
    toast.success(`Added ${item.name} to your bag`);
  };

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

  return (
    <section
      className="flex w-full items-center overflow-hidden"
      style={{
        minHeight: "calc(100vh - 96px)",
        backgroundColor: "var(--brand-primary)",
        color: "var(--brand-secondary)",
      }}
    >
      <div className="grid w-full grid-cols-1 gap-14 px-8 py-16 sm:px-14 md:py-20 lg:grid-cols-2 lg:gap-20 lg:px-20 xl:px-28">
        <div className="relative flex min-h-[480px] items-center justify-center sm:min-h-[560px] lg:min-h-[640px]">
          {fashionLooks.map((look, i) => {
            const rel =
              (i - activeIndex + fashionLooks.length) % fashionLooks.length;
            const pos = rel === 0 ? 0 : rel === 1 ? 1 : -1;
            const isActive = pos === 0;
            return (
              <div
                key={look.id}
                className="absolute h-[420px] w-[300px] transition-all duration-500 ease-out sm:h-[500px] sm:w-[360px] lg:h-[580px] lg:w-[420px]"
                style={{
                  transform: `translateX(${pos * 90}px) rotate(${pos * 8}deg) scale(${isActive ? 1 : 0.9})`,
                  zIndex: isActive ? 30 : 10,
                }}
              >
                <div
                  className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border"
                  style={{
                    backgroundColor: isActive
                      ? "color-mix(in srgb, var(--brand-secondary) 10%, transparent)"
                      : "color-mix(in srgb, var(--brand-secondary) 5%, transparent)",
                    borderColor: `color-mix(in srgb, var(--brand-secondary) ${isActive ? 25 : 12}%, transparent)`,
                  }}
                >
                  {isActive && (
                    <span className="px-6 text-center text-xs font-medium opacity-50">
                      {look.imageLabel}
                    </span>
                  )}
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      aria-label={`View ${look.name}`}
                      className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--brand-secondary) 15%, transparent)",
                      }}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col justify-center gap-8 lg:gap-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-50 sm:text-sm">
              Editor&rsquo;s Pick
            </div>
            <h2
              className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Get the Look
            </h2>
            <div
              className="mt-4 h-0.5 w-14"
              style={{ backgroundColor: "var(--brand-secondary)" }}
            />
          </div>

          <div className="flex flex-col gap-4">
            {activeLook.items.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-5 rounded-2xl border p-5"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--brand-secondary) 15%, transparent)",
                }}
              >
                <span className="text-sm font-semibold opacity-50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  role="img"
                  aria-label={item.imageLabel}
                  className="h-16 w-16 flex-none rounded-lg border sm:h-20 sm:w-20"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--brand-secondary) 8%, transparent)",
                    borderColor:
                      "color-mix(in srgb, var(--brand-secondary) 15%, transparent)",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--brand-secondary) 12%, transparent)",
                    }}
                  >
                    {item.tag}
                  </span>
                  <div className="mt-1.5 truncate text-base font-bold">
                    {item.name}
                  </div>
                  <div className="text-sm opacity-60">
                    Size {item.size} · ${item.price}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addToBag(item)}
                  className="flex-none rounded-lg border px-5 py-2.5 text-sm font-semibold"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--brand-secondary) 25%, transparent)",
                  }}
                >
                  Add to Bag
                </button>
              </div>
            ))}
          </div>

          <div
            className="flex items-center justify-between border-t pt-6"
            style={{
              borderColor:
                "color-mix(in srgb, var(--brand-secondary) 15%, transparent)",
            }}
          >
            <div>
              <div className="text-sm opacity-60">Complete the look</div>
              <div className="text-3xl font-bold">${total}</div>
            </div>
            <button
              type="button"
              onClick={addAllToBag}
              className="rounded-xl px-8 py-3.5 text-base font-bold"
              style={{
                backgroundColor: "var(--brand-secondary)",
                color: "var(--brand-primary)",
              }}
            >
              Add All to Bag
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/shared/components/Skeleton";
import { useCollections } from "@/features/storefront/hooks/queries/useCollections";
import type { CollectionItem } from "@/features/storefront/contracts/collections.contract";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";

/** "UpperGarment" -> "Upper Garment" for the slot badge. */
function humanizeSlot(slot: string | null): string {
  if (!slot) return "Item";
  return slot.replace(/([a-z])([A-Z])/g, "$1 $2");
}

/**
 * Fashion — homepage hero: "Get the Look" curated outfit carousel.
 * Fetches real OUTFIT collections via GET /v2/collections?type=OUTFIT
 * (see features/storefront/hooks/queries/useCollections.ts). Left: a fanned
 * card stack of each outfit's lead product photo, navigated by explicit
 * prev/next arrows + dot indicators. Right: that outfit's shoppable pieces,
 * individually addable or all at once, wired to useLocalCartStore (see that
 * store's doc comment — client-only stand-in for /v2/cart).
 */
export function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const addCartItem = useLocalCartStore((s) => s.addItem);
  const { data: outfits, isLoading, isError } = useCollections("OUTFIT");

  if (isLoading) {
    return (
      <section
        className="flex w-full items-center justify-center"
        style={{ minHeight: "calc(100vh - 150px)" }}
      >
        <Skeleton className="h-[500px] w-[90%] max-w-6xl rounded-2xl" />
      </section>
    );
  }

  if (isError || !outfits || outfits.length === 0) {
    return null;
  }

  const activeLook = outfits[activeIndex] ?? outfits[0];
  const total = Number(
    activeLook.items
      .reduce((sum, item) => sum + (item.productVariant?.price ?? 0), 0)
      .toFixed(2),
  );

  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + outfits.length) % outfits.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % outfits.length);

  const addToBag = (item: CollectionItem) => {
    addCartItem({
      productId: item.productId,
      name: item.product.title,
      brand: humanizeSlot(item.slot),
      price: item.productVariant?.price ?? 0,
      imageLabel: item.product.title,
      size: item.productVariant?.title,
      quantity: 1,
    });
    toast.success(`Added ${item.product.title} to your bag`);
  };

  const addAllToBag = () => {
    activeLook.items.forEach((item) =>
      addCartItem({
        productId: item.productId,
        name: item.product.title,
        brand: humanizeSlot(item.slot),
        price: item.productVariant?.price ?? 0,
        imageLabel: item.product.title,
        size: item.productVariant?.title,
        quantity: 1,
      }),
    );
    toast.success(`Added ${activeLook.items.length} items to your bag`);
  };

  const heroImageUrl =
    activeLook.imageUrl ?? activeLook.items[0]?.product.thumbnailUrl ?? null;

  return (
    <section
      className="flex w-full items-center overflow-hidden"
      style={{
        minHeight: "calc(100vh - 150px)",
        background:
          "radial-gradient(ellipse 70% 60% at 28% 45%, color-mix(in srgb, var(--brand-primary) 12%, transparent), transparent 70%), " +
          "radial-gradient(ellipse 50% 45% at 85% 15%, color-mix(in srgb, var(--brand-primary) 6%, transparent), transparent 70%), " +
          "var(--brand-secondary)",
        color: "var(--brand-primary)",
      }}
    >
      <div className="grid w-full grid-cols-1 gap-14 px-8 py-16 sm:px-14 md:py-20 lg:grid-cols-2 lg:gap-20 lg:px-20 xl:px-28">
        <div className="flex flex-col items-center gap-7">
          <div className="relative flex min-h-[420px] w-full items-center justify-center sm:min-h-[500px] lg:min-h-[560px]">
            {outfits.map((look, i) => {
              const rel = (i - activeIndex + outfits.length) % outfits.length;
              const pos = rel === 0 ? 0 : rel === 1 ? 1 : -1;
              const isActive = pos === 0;
              const imageUrl =
                look.imageUrl ?? look.items[0]?.product.thumbnailUrl ?? null;
              return (
                <div
                  key={look.id}
                  className="absolute h-[380px] w-[270px] transition-all duration-500 ease-out sm:h-[440px] sm:w-[320px] lg:h-[500px] lg:w-[370px]"
                  style={{
                    transform: `translateX(${pos * 84}px) rotate(${pos * 6}deg) scale(${isActive ? 1 : 0.88})`,
                    zIndex: isActive ? 30 : 10,
                    opacity: isActive ? 1 : 0.5,
                  }}
                >
                  <div
                    className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border transition-shadow duration-500"
                    style={{
                      backgroundColor: isActive
                        ? "color-mix(in srgb, var(--brand-primary) 10%, transparent)"
                        : "color-mix(in srgb, var(--brand-primary) 5%, transparent)",
                      borderColor: `color-mix(in srgb, var(--brand-primary) ${isActive ? 25 : 12}%, transparent)`,
                      boxShadow: isActive
                        ? "0 0 100px color-mix(in srgb, var(--brand-primary) 20%, transparent)"
                        : "none",
                    }}
                  >
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- external unsplash URLs, remotePatterns not yet configured
                      <img
                        src={imageUrl}
                        alt={look.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      isActive && (
                        <span className="px-6 text-center text-xs font-medium opacity-50">
                          {look.title}
                        </span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous look"
              className="flex h-11 w-11 items-center justify-center rounded-full border"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              {outfits.map((look, i) => (
                <button
                  key={look.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Go to ${look.title}`}
                  aria-current={i === activeIndex}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === activeIndex ? "24px" : "6px",
                    backgroundColor:
                      i === activeIndex
                        ? "var(--brand-primary)"
                        : "color-mix(in srgb, var(--brand-primary) 30%, transparent)",
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next look"
              className="flex h-11 w-11 items-center justify-center rounded-full border"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="text-sm font-semibold opacity-70">
            {activeLook.title}
          </div>
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
              style={{ backgroundColor: "var(--brand-primary)" }}
            />
          </div>

          <div className="flex flex-col gap-4">
            {activeLook.items.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-5 rounded-2xl border p-5"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
                }}
              >
                <span className="text-sm font-semibold opacity-50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.product.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- external unsplash URLs, remotePatterns not yet configured
                  <img
                    src={item.product.thumbnailUrl}
                    alt={item.product.title}
                    className="h-16 w-16 flex-none rounded-lg border object-cover sm:h-20 sm:w-20"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
                    }}
                  />
                ) : (
                  <div
                    className="h-16 w-16 flex-none rounded-lg border sm:h-20 sm:w-20"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--brand-primary) 8%, transparent)",
                      borderColor:
                        "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
                    }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
                    }}
                  >
                    {humanizeSlot(item.slot)}
                  </span>
                  <div className="mt-1.5 truncate text-base font-bold">
                    {item.product.title}
                  </div>
                  <div className="text-sm opacity-60">
                    {item.productVariant?.title ?? "One Size"} · $
                    {item.productVariant?.price ?? 0}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addToBag(item)}
                  className="flex-none rounded-lg border px-5 py-2.5 text-sm font-semibold"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
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
                "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
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
                backgroundColor: "var(--brand-primary)",
                color: "var(--brand-secondary)",
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

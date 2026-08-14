"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useCollections } from "@/features/storefront/hooks/queries/useCollections";
import type { Look, LookItem } from "../data/looks";
import { toLook } from "../utils/toLook";

/**
 * Fashion — homepage hero: "Get the Look" curated outfit carousel. Shows
 * exactly one look per Women/Men/Kids/Accessories/Shoes category — the
 * first CatalogCollection returned for each via
 * GET /v2/collections?categorySlug= (same endpoint/mapper TrendingLookbook
 * uses). This is a fixed 5-look editorial pick, one per category, not a
 * full browse. Left: a fanned card stack of outfit photos, navigated by
 * explicit prev/next arrows + dot indicators (not by clicking the stack
 * itself — that was ambiguous, easy to miss). Right: that look's shoppable
 * items, individually addable or all at once, both wired to the real
 * useLocalCartStore (see that store's doc comment — client-only stand-in
 * for /v2/cart).
 */
export function HeroBanner({ tenantSlug }: { tenantSlug: string }) {
  const { data: womensLooks, isLoading: loadingWomens } = useCollections(
    tenantSlug,
    undefined,
    "womens-fashion",
  );
  const { data: mensLooks, isLoading: loadingMens } = useCollections(
    tenantSlug,
    undefined,
    "mens-fashion",
  );
  const { data: kidsLooks, isLoading: loadingKids } = useCollections(
    tenantSlug,
    undefined,
    "kids",
  );
  const { data: accessoriesLooks, isLoading: loadingAccessories } =
    useCollections(tenantSlug, undefined, "accessories");
  const { data: shoesLooks, isLoading: loadingShoes } = useCollections(
    tenantSlug,
    undefined,
    "shoes",
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const addCartItem = useLocalCartStore((s) => s.addItem);

  // Per-item "Added" confirmation + bounce on each row's "Add to Bag"
  // button — same pattern as ProductCard's quick-add. Keyed by item id
  // since each look renders several of these buttons independently.
  // `pulseByItemId` is used as a React `key` so the CSS animation restarts
  // even if the same item is clicked again before the previous bounce ends.
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());
  const [pulseByItemId, setPulseByItemId] = useState<Record<string, number>>(
    {},
  );
  const addedTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  // Same bounce/"Added" treatment for the single "Add All to Bag" button.
  const [justAddedAll, setJustAddedAll] = useState(false);
  const [addAllPulse, setAddAllPulse] = useState(0);
  const addAllTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const looks: Look[] = [
    womensLooks?.[0],
    mensLooks?.[0],
    kidsLooks?.[0],
    accessoriesLooks?.[0],
    shoesLooks?.[0],
  ]
    .filter((collection): collection is NonNullable<typeof collection> =>
      Boolean(collection),
    )
    .map(toLook);

  // Still loading, or none of the five categories have a look yet — hide
  // the hero rather than render an empty/broken carousel.
  const isLoading =
    loadingWomens ||
    loadingMens ||
    loadingKids ||
    loadingAccessories ||
    loadingShoes;
  if (isLoading || looks.length === 0) {
    return null;
  }

  const safeIndex = activeIndex % looks.length;
  const activeLook = looks[safeIndex];
  const total = activeLook.items.reduce((sum, item) => sum + item.price, 0);

  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + looks.length) % looks.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % looks.length);

  const addToBag = (item: LookItem) => {
    addCartItem({
      productId: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      imageLabel: item.imageLabel,
      imageUrl: item.imageUrl,
      size: item.size,
      quantity: 1,
    });
    toast.success(`Added ${item.name} to your bag`);

    setAddedItemIds((prev) => new Set(prev).add(item.id));
    setPulseByItemId((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] ?? 0) + 1,
    }));
    if (addedTimeoutsRef.current[item.id]) {
      clearTimeout(addedTimeoutsRef.current[item.id]);
    }
    addedTimeoutsRef.current[item.id] = setTimeout(() => {
      setAddedItemIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 1400);
  };

  const addAllToBag = () => {
    activeLook.items.forEach((item) =>
      addCartItem({
        productId: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        imageLabel: item.imageLabel,
        imageUrl: item.imageUrl,
        size: item.size,
        quantity: 1,
      }),
    );
    toast.success(`Added ${activeLook.items.length} items to your bag`);

    setJustAddedAll(true);
    setAddAllPulse((n) => n + 1);
    if (addAllTimeoutRef.current) clearTimeout(addAllTimeoutRef.current);
    addAllTimeoutRef.current = setTimeout(() => setJustAddedAll(false), 1400);
  };

  return (
    <section
      className="flex w-full items-center overflow-hidden"
      style={{
        minHeight: "calc(100vh - 320px)",
        background:
          "radial-gradient(ellipse 70% 60% at 28% 45%, color-mix(in srgb, var(--brand-primary) 12%, transparent), transparent 70%), " +
          "radial-gradient(ellipse 50% 45% at 85% 15%, color-mix(in srgb, var(--brand-primary) 6%, transparent), transparent 70%), " +
          "var(--brand-secondary)",
        color: "var(--brand-primary)",
      }}
    >
      <div className="grid w-full grid-cols-1 gap-14 px-8 pb-16 pt-6 sm:px-14 md:pb-20 md:pt-8 lg:grid-cols-2 lg:gap-20 lg:px-20 xl:px-28">
        <div className="flex flex-col items-center gap-7">
          <div className="relative flex min-h-[420px] w-full items-center justify-center sm:min-h-[500px] lg:min-h-[560px]">
            {looks.map((look, i) => {
              const rel = (i - safeIndex + looks.length) % looks.length;
              const pos = rel === 0 ? 0 : rel === 1 ? 1 : -1;
              const isActive = pos === 0;
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
                      borderColor: `color-mix(in srgb, var(--brand-primary) ${isActive ? 25 : 12}%, transparent)`,
                      boxShadow: isActive
                        ? "0 0 100px color-mix(in srgb, var(--brand-primary) 20%, transparent)"
                        : "none",
                    }}
                  >
                    <ImagePlaceholder
                      label={look.imageLabel}
                      imageUrl={look.imageUrl}
                      aspect="3/4"
                      className="h-full w-full"
                    />
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
              {looks.map((look, i) => (
                <button
                  key={look.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Go to ${look.name}`}
                  aria-current={i === safeIndex}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === safeIndex ? "24px" : "6px",
                    backgroundColor:
                      i === safeIndex
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
            {activeLook.name}
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
                {(() => {
                  const itemContent = (
                    <>
                      <ImagePlaceholder
                        label={item.imageLabel}
                        imageUrl={item.imageUrl}
                        aspect="1/1"
                        className="h-16 w-16 flex-none sm:h-20 sm:w-20"
                      />
                      <div className="min-w-0 flex-1">
                        <span
                          className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                          style={{
                            backgroundColor:
                              "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
                          }}
                        >
                          {item.tag}
                        </span>
                        <div className="mt-1.5 truncate text-base font-bold">
                          {item.name}
                        </div>
                        <div className="text-sm opacity-60">
                          Size {item.size} · ${item.price.toFixed(2)}
                        </div>
                      </div>
                    </>
                  );

                  return item.slug ? (
                    <Link
                      href={`/products/${item.slug}`}
                      className="flex min-w-0 flex-1 items-center gap-5"
                    >
                      {itemContent}
                    </Link>
                  ) : (
                    <div className="flex min-w-0 flex-1 items-center gap-5">
                      {itemContent}
                    </div>
                  );
                })()}
                <button
                  key={pulseByItemId[item.id] ?? 0}
                  type="button"
                  onClick={() => addToBag(item)}
                  className={`flex-none rounded-lg border px-5 py-2.5 text-sm font-semibold ${
                    addedItemIds.has(item.id) ? "animate-add-bounce" : ""
                  }`}
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
                  }}
                >
                  {addedItemIds.has(item.id) ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Check className="h-4 w-4" />
                      Added
                    </span>
                  ) : (
                    "Add to Bag"
                  )}
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
              <div className="text-3xl font-bold">${total.toFixed(2)}</div>
            </div>
            <button
              key={addAllPulse}
              type="button"
              onClick={addAllToBag}
              className={`rounded-xl px-8 py-3.5 text-base font-bold ${
                justAddedAll ? "animate-add-bounce" : ""
              }`}
              style={{
                backgroundColor: "var(--brand-primary)",
                color: "var(--brand-secondary)",
              }}
            >
              {justAddedAll ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="h-5 w-5" />
                  Added
                </span>
              ) : (
                "Add All to Bag"
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

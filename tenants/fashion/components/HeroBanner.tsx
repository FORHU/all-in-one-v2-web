"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useCollections } from "@/features/storefront/hooks/queries/useCollections";
import type { Look, LookItem } from "../data/looks";
import { toLook } from "../utils/toLook";

/** Carousel shows at most this many looks — an editorial pick, not a full browse. */
const MAX_LOOKS = 5;

/**
 * Fashion — homepage hero: "Get the Look" outfit carousel. Pulls every
 * OUTFIT-type CatalogCollection for the tenant via GET /v2/collections?
 * type=OUTFIT (same endpoint/mapper TrendingLookbook uses, but unscoped by
 * categorySlug — real collections here are frequently uncategorized, e.g.
 * seeded OUTFIT rows with no categoryId, so filtering by category would
 * silently hide them). Shows up to MAX_LOOKS.
 *
 * Deliberately minimal: one large centered photo per look, crossfading on
 * prev/next/dot navigation — no side-by-side item list competing for
 * attention, so the outfit photo itself is what the hero communicates.
 * Shopping the look is one click away via "Shop This Look", which opens the
 * same kind of item-breakdown overlay pages/CategoryDetailPage.tsx's
 * TrendingLookbook uses (large photo + itemized list + Add All to Bag) —
 * kept local rather than shared since the two components' surrounding
 * layouts differ enough that extracting a shared piece would just be an
 * extra layer of indirection for ~80 lines of markup.
 */
export function HeroBanner({ tenantSlug }: { tenantSlug: string }) {
  const { data: collections, isLoading } = useCollections(tenantSlug, "OUTFIT");

  const [activeIndex, setActiveIndex] = useState(0);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const addCartItem = useLocalCartStore((s) => s.addItem);

  // Per-item "Added" confirmation + bounce on each row's "Add to Bag"
  // button — same pattern as ProductCard's quick-add. Keyed by item id
  // since each look renders several of these buttons independently.
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

  const looks: Look[] = (collections ?? [])
    .filter((collection) => collection.items.length > 0)
    .slice(0, MAX_LOOKS)
    .map(toLook);

  const safeIndex = looks.length > 0 ? activeIndex % looks.length : 0;
  const activeLook = looks[safeIndex];

  // Crossfades the photo when the active look changes — same
  // decoupled-from-selection pattern as TrendingLookbook's center panel: the
  // image keeps showing the *previous* look until it's faded to 0, only
  // then swapping src and fading back in, so the swap never pops in at full
  // opacity on the very first frame.
  const FADE_MS = 300;
  const [displayedLookId, setDisplayedLookId] = useState<string | null>(null);
  const [imageVisible, setImageVisible] = useState(true);
  useEffect(() => {
    if (!activeLook || activeLook.id === displayedLookId) return;
    if (displayedLookId === null) {
      setDisplayedLookId(activeLook.id);
      return;
    }
    setImageVisible(false);
    const timeout = setTimeout(() => {
      setDisplayedLookId(activeLook.id);
      setImageVisible(true);
    }, FADE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLook?.id]);

  useEffect(() => {
    if (!isShopOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsShopOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isShopOpen]);

  // Still loading — nothing to show yet either way, so stay hidden rather
  // than flash an empty state before the real data (or lack of it) arrives.
  if (isLoading) {
    return null;
  }

  // Loaded, but no collection has any items yet — render the hero with an
  // explicit empty state instead of disappearing, so the homepage doesn't
  // look broken/incomplete when nothing's curated yet.
  if (looks.length === 0 || !activeLook) {
    return (
      <section
        className="flex w-full items-center justify-center overflow-hidden"
        style={{
          minHeight: "calc(100vh - 320px)",
          background:
            "radial-gradient(ellipse 70% 60% at 28% 45%, color-mix(in srgb, var(--brand-primary) 12%, transparent), transparent 70%), " +
            "radial-gradient(ellipse 50% 45% at 85% 15%, color-mix(in srgb, var(--brand-primary) 6%, transparent), transparent 70%), " +
            "var(--brand-secondary)",
          color: "var(--brand-primary)",
        }}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-xs font-bold uppercase tracking-widest opacity-50 sm:text-sm">
            Editor&rsquo;s Pick
          </div>
          <h2
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Get the Look
          </h2>
          <div
            className="h-0.5 w-14"
            style={{ backgroundColor: "var(--brand-primary)" }}
          />
          <p className="mt-2 text-sm opacity-60">No product available</p>
        </div>
      </section>
    );
  }

  const displayedLook =
    looks.find((look) => look.id === displayedLookId) ?? activeLook;
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
      className="flex w-full items-center justify-center overflow-hidden"
      style={{
        minHeight: "calc(100vh - 320px)",
        background:
          "radial-gradient(ellipse 70% 60% at 28% 45%, color-mix(in srgb, var(--brand-primary) 12%, transparent), transparent 70%), " +
          "radial-gradient(ellipse 50% 45% at 85% 15%, color-mix(in srgb, var(--brand-primary) 6%, transparent), transparent 70%), " +
          "var(--brand-secondary)",
        color: "var(--brand-primary)",
      }}
    >
      <div className="flex w-full flex-col items-center gap-7 px-8 pb-16 pt-10 sm:px-14 md:pb-20">
        <div className="flex flex-col items-center text-center">
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

        {/* One main image, centered — crossfades between looks */}
        <div className="relative flex w-full max-w-md items-center justify-center">
          <div
            className="relative flex h-[440px] w-full items-center justify-center overflow-hidden rounded-2xl border sm:h-[520px] lg:h-[600px]"
            style={{
              borderColor:
                "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
              boxShadow:
                "0 0 100px color-mix(in srgb, var(--brand-primary) 20%, transparent)",
            }}
          >
            <ImagePlaceholder
              label={displayedLook.imageLabel}
              imageUrl={displayedLook.imageUrl}
              aspect="3/4"
              className={`h-full w-full transition-opacity duration-300 ${
                imageVisible ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          {looks.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous look"
                className="absolute left-0 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: "var(--brand-secondary)",
                  borderColor:
                    "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next look"
                className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: "var(--brand-secondary)",
                  borderColor:
                    "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {looks.length > 1 && (
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
        )}

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-lg font-bold">{activeLook.name}</div>
          <button
            type="button"
            onClick={() => setIsShopOpen(true)}
            className="rounded-xl px-8 py-3.5 text-base font-bold"
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "var(--brand-secondary)",
            }}
          >
            Shop This Look
          </button>
        </div>
      </div>

      {/* Shop-the-look overlay — the itemized breakdown, tucked behind a click
          so the hero itself stays a clean, single-image showcase. */}
      {isShopOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsShopOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border"
            style={{
              backgroundColor: "var(--brand-secondary)",
              borderColor:
                "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
              color: "var(--brand-primary)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsShopOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
              }}
            >
              <X className="h-4 w-4" />
            </button>

            <div
              className="flex flex-col gap-1 border-b p-6 pb-5"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
              }}
            >
              <div className="text-xs font-bold uppercase tracking-widest opacity-50">
                Shop This Look
              </div>
              <div className="text-xl font-bold">{activeLook.name}</div>
            </div>

            <div className="scrollbar-hide flex flex-1 flex-col gap-4 overflow-y-auto p-6">
              {activeLook.items.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border p-4"
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
                          className="h-16 w-16 flex-none"
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
                          <div className="mt-1.5 truncate text-sm font-bold">
                            {item.name}
                          </div>
                          <div className="text-xs opacity-60">
                            Size {item.size} · ${item.price.toFixed(2)}
                          </div>
                        </div>
                      </>
                    );

                    return item.slug ? (
                      <Link
                        href={`/products/${item.slug}`}
                        className="flex min-w-0 flex-1 items-center gap-4"
                      >
                        {itemContent}
                      </Link>
                    ) : (
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        {itemContent}
                      </div>
                    );
                  })()}
                  <button
                    key={pulseByItemId[item.id] ?? 0}
                    type="button"
                    onClick={() => addToBag(item)}
                    className={`flex-none rounded-lg border px-4 py-2 text-xs font-semibold ${
                      addedItemIds.has(item.id) ? "animate-add-bounce" : ""
                    }`}
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
                    }}
                  >
                    {addedItemIds.has(item.id) ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
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
              className="flex items-center justify-between gap-3 border-t p-6"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
              }}
            >
              <div>
                <div className="text-sm opacity-60">Complete the look</div>
                <div className="text-2xl font-bold">${total.toFixed(2)}</div>
              </div>
              <button
                key={addAllPulse}
                type="button"
                onClick={addAllToBag}
                className={`rounded-xl px-6 py-3 text-sm font-bold ${
                  justAddedAll ? "animate-add-bounce" : ""
                }`}
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "var(--brand-secondary)",
                }}
              >
                {justAddedAll ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="h-4 w-4" />
                    Added
                  </span>
                ) : (
                  "Add All to Bag"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

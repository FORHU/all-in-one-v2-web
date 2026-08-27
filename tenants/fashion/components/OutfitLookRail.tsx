"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Heart, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useWishlistStore } from "@/features/storefront/stores/wishlist.store";
import { type Look, type LookItem } from "../data/looks";
import { fashionInter, FASHION_MOOD_COLORS as MOOD } from "../theme";

/**
 * Literal Tailwind class per supported desktop column count — kept as full,
 * literal strings (not built from a template) so Tailwind's JIT scanner can
 * actually find them; a dynamically interpolated arbitrary-value class
 * wouldn't be detected at build time. Each gap total is (columns - 1) * 4px
 * (gap-x-1), matching the rail's own gap-x-1 spacing.
 */
const DESKTOP_BASIS: Record<number, string> = {
  6: "lg:basis-[calc((100%-20px)/6)]",
  8: "lg:basis-[calc((100%-28px)/8)]",
};

/**
 * Fashion — reusable outfit tile strip + "Complete the Look" detail overlay.
 * Extracted from GetTheLookMoodboard so both it (one rail, all its outfits)
 * and ShopBySeason (one rail per season) share the same tile/overlay/
 * add-to-bag logic instead of duplicating it. Prev/Next inside the detail
 * overlay cycles only through the `looks` this instance was given — each
 * rail is its own independent look set. Assumes `looks` is non-empty; the
 * caller decides what to render (or skip) when there's nothing to show.
 */
export function OutfitLookRail({
  looks,
  desktopColumns = 6,
  naturalImages = false,
}: {
  looks: Look[];
  /** How many tiles show on desktop before the strip needs scrolling. */
  desktopColumns?: 6 | 8;
  /**
   * When true, renders the outfit photo at its own natural aspect ratio
   * (plain `<img>`, no forced aspect-ratio box/crop/rounded frame) instead
   * of the default fixed 3/5 boxed treatment. GetTheLookMoodboard opts into
   * this; ShopBySeason keeps the boxed default.
   */
  naturalImages?: boolean;
}) {
  const [activeLookId, setActiveLookId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [justAddedAll, setJustAddedAll] = useState(false);
  const [addAllPulse, setAddAllPulse] = useState(0);
  const addAllTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addCartItem = useLocalCartStore((s) => s.addItem);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const toggleFavorite = useWishlistStore((s) => s.toggle);

  useEffect(() => {
    if (!isDetailOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDetailOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDetailOpen]);

  const openLook = (id: string) => {
    setActiveLookId(id);
    setIsDetailOpen(true);
  };

  const activeLook =
    looks.find((look) => look.id === activeLookId) ?? looks[0] ?? null;
  const activeIndex = activeLook
    ? looks.findIndex((look) => look.id === activeLook.id)
    : -1;
  const total = activeLook
    ? activeLook.items.reduce((sum, item) => sum + item.price, 0)
    : 0;
  const baseItems = activeLook
    ? activeLook.items.filter((item) => item.tag === "BASE")
    : [];
  const accessoryItems = activeLook
    ? activeLook.items.filter((item) => item.tag === "OVER")
    : [];

  const showPrevLook = () => {
    if (!activeLook) return;
    const prevIndex = (activeIndex - 1 + looks.length) % looks.length;
    setActiveLookId(looks[prevIndex].id);
  };

  const showNextLook = () => {
    if (!activeLook) return;
    const nextIndex = (activeIndex + 1) % looks.length;
    setActiveLookId(looks[nextIndex].id);
  };

  const addAllToBag = () => {
    if (!activeLook) return;
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

  const addItemToBag = (item: LookItem) => {
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
  };

  return (
    <>
      {/* One column per look — hero photo, uppercase caption, outline heart.
          A horizontal snap-scroll strip, not a wrapping grid: 6 columns show
          by default on desktop (2 on mobile, 3 on tablet) and any looks
          beyond that are reached by swiping/scrolling sideways rather than
          wrapping to a second row. Gap kept minimal (gap-x-1) and the hero
          image tall (3/5) so each column's basis-calc offset must stay in
          sync with the gap total (20px = 5 gaps x 4px gap-x-1). */}
      <div className="flex snap-x snap-mandatory gap-x-1 overflow-x-auto pb-2 scrollbar-hide">
        {looks.map((look) => {
          const isFavorite = wishlistIds.includes(look.id);
          return (
            <div
              key={look.id}
              className={`flex min-w-0 flex-none snap-start basis-1/2 flex-col items-stretch sm:basis-1/3 ${DESKTOP_BASIS[desktopColumns]}`}
            >
              <div className="flex flex-col items-center gap-3 pb-2 pt-1">
                <button
                  type="button"
                  onClick={() => openLook(look.id)}
                  aria-label={`Open ${look.name}`}
                  className={
                    naturalImages
                      ? "group relative w-full"
                      : "group relative aspect-[3/5] w-full overflow-hidden rounded-xl"
                  }
                >
                  {naturalImages ? (
                    look.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- deliberately unboxed/unsized: shows the photo at its own natural aspect ratio, which next/image's fill mode (used by ImagePlaceholder) can't do without a fixed-size container.
                      <img
                        src={look.imageUrl}
                        alt={look.imageLabel}
                        loading="lazy"
                        className="w-full h-auto max-h-[420px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        role="img"
                        aria-label={look.imageLabel}
                        className="flex aspect-[3/5] items-center justify-center rounded-xl border border-dashed border-current/15 bg-current/[0.04] text-center text-[11px] font-medium leading-snug text-current/40"
                      >
                        <span className="px-3">{look.imageLabel}</span>
                      </div>
                    )
                  ) : (
                    <ImagePlaceholder
                      label={look.imageLabel}
                      imageUrl={look.imageUrl}
                      aspect="3/5"
                      objectFit="contain"
                      className="h-full w-full text-current transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  )}
                </button>
                <div
                  className="line-clamp-2 min-h-[2.5em] text-center text-xs font-extrabold uppercase leading-snug tracking-[0.12em]"
                  style={{
                    color: MOOD.ink,
                    fontFamily: fashionInter.style.fontFamily,
                  }}
                >
                  {look.name}
                </div>
                <button
                  type="button"
                  onClick={() => toggleFavorite(look.id)}
                  aria-pressed={isFavorite}
                  aria-label={
                    isFavorite
                      ? `Remove ${look.name} from wishlist`
                      : `Add ${look.name} to wishlist`
                  }
                  className="flex items-center gap-1.5 transition-transform hover:scale-110"
                  style={{
                    color: isFavorite ? MOOD.sage : MOOD.border,
                  }}
                >
                  <span
                    className="h-px w-3"
                    style={{ backgroundColor: "currentColor" }}
                  />
                  <Heart
                    className="h-3 w-3"
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                  <span
                    className="h-px w-3"
                    style={{ backgroundColor: "currentColor" }}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail overlay — large photo, prev/next between this rail's looks, itemized breakdown, Add All to Bag */}
      {isDetailOpen && activeLook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setIsDetailOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-2xl border p-5 sm:flex-row sm:gap-6"
            style={{
              backgroundColor: MOOD.cream,
              borderColor: MOOD.border,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsDetailOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: MOOD.creamSoft, color: MOOD.ink }}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left — active look, large */}
            <div className="relative flex h-[320px] flex-none items-center justify-center sm:h-auto sm:w-[320px]">
              <div
                className="relative mx-auto flex h-full w-full max-w-[320px] items-center justify-center overflow-hidden rounded-2xl border"
                style={{
                  backgroundColor: MOOD.creamSoft,
                  borderColor: MOOD.border,
                }}
              >
                <ImagePlaceholder
                  label={activeLook.imageLabel}
                  imageUrl={activeLook.imageUrl}
                  aspect="3/4"
                  objectFit="contain"
                  className="h-full w-full"
                />
              </div>

              {looks.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrevLook}
                    aria-label="Show previous look"
                    className="absolute left-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border transition-colors hover:border-current"
                    style={{
                      backgroundColor: MOOD.cream,
                      borderColor: MOOD.border,
                      color: MOOD.ink,
                    }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={showNextLook}
                    aria-label="Show next look"
                    className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border transition-colors hover:border-current"
                    style={{
                      backgroundColor: MOOD.cream,
                      borderColor: MOOD.border,
                      color: MOOD.ink,
                    }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Right — pieces in this look */}
            <div className="mt-5 flex min-w-0 flex-1 flex-col gap-4 sm:mt-0">
              <h2
                className="text-xl font-extrabold tracking-tight"
                style={{
                  color: MOOD.ink,
                  fontFamily: fashionInter.style.fontFamily,
                }}
              >
                {activeLook.name}
              </h2>
              <h3
                className="text-xs font-bold uppercase tracking-[0.25em]"
                style={{ color: MOOD.sageDark }}
              >
                Complete the Look
              </h3>
              <div className="relative flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1 scrollbar-hide">
                <div
                  className="pointer-events-none absolute bottom-2 left-1.5 top-2 border-l border-dashed"
                  style={{ borderColor: MOOD.border }}
                />
                {baseItems.length > 0 && (
                  <div
                    className="pl-3 text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: MOOD.textMuted }}
                  >
                    Base Item
                  </div>
                )}
                {baseItems.map((item) => (
                  <OutfitLookItemRow
                    key={item.id}
                    item={item}
                    onAdd={addItemToBag}
                  />
                ))}

                {accessoryItems.length > 0 && (
                  <div
                    className="pl-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: MOOD.textMuted }}
                  >
                    Accessory Items
                  </div>
                )}
                {accessoryItems.map((item) => (
                  <OutfitLookItemRow
                    key={item.id}
                    item={item}
                    onAdd={addItemToBag}
                  />
                ))}
              </div>

              <div
                className="flex flex-none items-center justify-between gap-3 border-t pt-3"
                style={{ borderColor: MOOD.border }}
              >
                <div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: MOOD.textMuted }}
                  >
                    Edit Total
                  </div>
                  <span
                    className="text-lg font-bold"
                    style={{ color: MOOD.sageDark }}
                  >
                    ${total.toFixed(2)}
                  </span>
                </div>
                <button
                  key={addAllPulse}
                  type="button"
                  onClick={addAllToBag}
                  className={`flex-none whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 ${
                    justAddedAll ? "animate-add-bounce" : ""
                  }`}
                  style={{ backgroundColor: MOOD.sage, color: MOOD.cream }}
                >
                  {justAddedAll ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Check className="h-4 w-4" />
                      Added
                    </span>
                  ) : (
                    "Add all to bag"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** A single "Complete the Look" row, shared by the Base Item and Accessory Items groups. */
function OutfitLookItemRow({
  item,
  onAdd,
}: {
  item: LookItem;
  onAdd: (item: LookItem) => void;
}) {
  const [justAdded, setJustAdded] = useState(false);
  const [pulse, setPulse] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAdd = () => {
    onAdd(item);
    setJustAdded(true);
    setPulse((n) => n + 1);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setJustAdded(false), 1400);
  };

  const itemContent = (
    <>
      <ImagePlaceholder
        label={item.imageLabel}
        imageUrl={item.imageUrl}
        aspect="1/1"
        className="h-14 w-14 flex-none overflow-hidden rounded-lg"
      />
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-sm font-semibold"
          style={{ color: MOOD.ink }}
        >
          {item.name}
        </div>
        <div className="text-xs font-bold" style={{ color: MOOD.sageDark }}>
          ${item.price.toFixed(2)}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex w-3 flex-none items-center justify-center self-stretch">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: MOOD.sage }}
        />
      </div>
      {item.slug ? (
        <Link
          href={`/products/${item.slug}`}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          {itemContent}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {itemContent}
        </div>
      )}
      <button
        key={pulse}
        type="button"
        onClick={handleAdd}
        aria-label={`Add ${item.name} to bag`}
        className={`flex h-8 w-8 flex-none items-center justify-center rounded-full transition-opacity hover:opacity-90 ${
          justAdded ? "animate-add-bounce" : ""
        }`}
        style={{ backgroundColor: MOOD.sage, color: MOOD.cream }}
      >
        {justAdded ? (
          <Check className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

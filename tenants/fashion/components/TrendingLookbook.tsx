"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ChevronLeft, ChevronRight, Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useWishlistStore } from "@/features/storefront/stores/wishlist.store";
import { useCollections } from "@/features/storefront/hooks/queries/useCollections";
import {
  LOOK_CATEGORIES,
  type Look,
  type LookCategory,
  type LookItem,
} from "../data/looks";
import { toLook } from "../utils/toLook";
import { STL_COLORS, STL_SERIF_FONT } from "./shopTheLookTheme";

const PANEL_HEIGHT = "lg:h-[520px]";
const ALL_CATEGORIES = "All" as const;
type CategoryFilter = LookCategory | typeof ALL_CATEGORIES;

/**
 * Fashion — "Shop the Look" widget shown above the filters+grid on
 * pages/CategoryDetailPage.tsx. Three panels: a vertical looks carousel
 * (left), the active look at large size (center), and that look's
 * individual pieces (right). Backed by CatalogCollection/CatalogCollectionItem
 * via GET /v2/collections (no type filter — fetches both OUTFIT and LOOKBOOK
 * rows), scoped to `categorySlug` so each category page only shows looks
 * featured under it (e.g. Men only shows looks tagged mens-fashion) — a
 * category with no tagged looks renders nothing (see the early return
 * below), which is expected for categories like Shoes/Accessories/Kids that
 * don't have a dedicated look yet. Separate from components/HeroBanner.tsx's
 * own "Get the Look" carousel, which still reads the static data/looks.ts
 * mock — that's the homepage widget, out of scope here.
 *
 * Visual design (fixed near-black palette) is intentionally scoped to this
 * component only — see shopTheLookTheme.ts.
 */
export function TrendingLookbook({
  tenantSlug,
  categorySlug,
}: {
  tenantSlug: string;
  categorySlug?: string;
}) {
  const { data: collections, isLoading } = useCollections(
    tenantSlug,
    undefined,
    categorySlug,
  );
  const looks: Look[] = (collections ?? []).map(toLook);

  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>(ALL_CATEGORIES);
  const [activeLookId, setActiveLookId] = useState<string | null>(null);
  const addCartItem = useLocalCartStore((s) => s.addItem);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const toggleFavorite = useWishlistStore((s) => s.toggle);

  // Looks load asynchronously — pick the first one once they arrive, and
  // re-pick if the currently active look disappears (e.g. data refetches).
  useEffect(() => {
    if (looks.length === 0) return;
    if (!looks.some((look) => look.id === activeLookId)) {
      setActiveLookId(looks[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [looks.map((l) => l.id).join(",")]);

  // Crossfades the center photo when the active look changes (arrows,
  // thumbnail clicks, category switches). The photo shown is deliberately
  // decoupled from `activeLookId` — title/subtitle/right panel update
  // immediately, but the image itself keeps rendering the *previous* look
  // until it has faded to 0, only then swapping `src` and fading back in.
  // Swapping the src immediately (e.g. via a plain opacity toggle on the
  // same render as the id change) makes the new photo pop in at full
  // opacity on the very first frame, since nothing lags behind to fade —
  // this is what made the transition invisible before.
  const FADE_MS = 300;
  const [displayedLookId, setDisplayedLookId] = useState<string | null>(null);
  const [imageVisible, setImageVisible] = useState(true);
  useEffect(() => {
    if (activeLookId === null || activeLookId === displayedLookId) return;
    if (displayedLookId === null) {
      // First look ever selected — show it immediately, nothing to fade from.
      setDisplayedLookId(activeLookId);
      return;
    }
    setImageVisible(false);
    const timeout = setTimeout(() => {
      setDisplayedLookId(activeLookId);
      setImageVisible(true);
    }, FADE_MS);
    return () => clearTimeout(timeout);
  }, [activeLookId, displayedLookId]);

  const carouselRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
    moved: false,
  });

  // No looks yet (still loading) or none exist for this tenant — hide the
  // whole widget rather than render an empty shell.
  if (isLoading || looks.length === 0) return null;

  const filteredLooks =
    categoryFilter === ALL_CATEGORIES
      ? looks
      : looks.filter((look) => look.category === categoryFilter);
  const activeLook = looks.find((look) => look.id === activeLookId) ?? looks[0];
  if (!activeLook) return null;
  const displayedLook =
    looks.find((look) => look.id === displayedLookId) ?? activeLook;
  const total = activeLook.items.reduce((sum, item) => sum + item.price, 0);
  const lookNumber = String(
    looks.findIndex((look) => look.id === activeLook.id) + 1,
  ).padStart(3, "0");
  const baseItems = activeLook.items.filter((item) => item.tag === "BASE");
  const accessoryItems = activeLook.items.filter((item) => item.tag === "OVER");

  // Center-panel arrows step through the same filteredLooks list the left
  // carousel renders, so advancing here also moves the highlighted
  // thumbnail there — one shared selection, two ways to drive it.
  const activeIndexInFiltered = filteredLooks.findIndex(
    (look) => look.id === activeLook.id,
  );

  const showPrevLook = () => {
    if (filteredLooks.length === 0) return;
    const currentIndex =
      activeIndexInFiltered === -1 ? 0 : activeIndexInFiltered;
    const prevIndex =
      (currentIndex - 1 + filteredLooks.length) % filteredLooks.length;
    setActiveLookId(filteredLooks[prevIndex].id);
  };

  const showNextLook = () => {
    if (filteredLooks.length === 0) return;
    const currentIndex =
      activeIndexInFiltered === -1 ? 0 : activeIndexInFiltered;
    const nextIndex = (currentIndex + 1) % filteredLooks.length;
    setActiveLookId(filteredLooks[nextIndex].id);
  };

  // Click-and-drag scrolling for mouse users — touch already scrolls
  // natively via swipe, so this only activates for pointerType "mouse".
  // Pointer capture is deferred until real movement crosses the threshold
  // (not taken immediately on pointerdown) — setPointerCapture also
  // redirects the compatibility mouse/click events to the capturing
  // element, so capturing eagerly silently ate every plain click on the
  // look thumbnails, drag or not. `moved` gates whether a drag should
  // suppress the click (dragging past a thumbnail shouldn't select it).
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const container = carouselRef.current;
    if (!container) return;
    dragRef.current = {
      dragging: true,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
      moved: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const container = carouselRef.current;
    if (!drag.dragging || !container) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      drag.moved = true;
      container.setPointerCapture(event.pointerId);
    }
    if (!drag.moved) return;
    container.scrollLeft = drag.scrollLeft - dx;
    container.scrollTop = drag.scrollTop - dy;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current.dragging = false;
    if (carouselRef.current?.hasPointerCapture(event.pointerId)) {
      carouselRef.current.releasePointerCapture(event.pointerId);
    }
  };

  // Switching category jumps the active look to the first match in the new
  // filter — the previously active look may not even be in the new list.
  const handleCategoryChange = (category: CategoryFilter) => {
    setCategoryFilter(category);
    const nextLooks =
      category === ALL_CATEGORIES
        ? looks
        : looks.filter((look) => look.category === category);
    if (nextLooks.length > 0) setActiveLookId(nextLooks[0].id);
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

  const addItemToBag = (item: LookItem) => {
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

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pt-10">
      {/* Header — eyebrow, title, subtitle, category tabs */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center gap-4">
            <span
              className="h-px w-10"
              style={{ backgroundColor: STL_COLORS.borderLine }}
            />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.35em]"
              style={{ color: STL_COLORS.teal }}
            >
              Shop the Look
            </span>
            <span
              className="h-px w-10"
              style={{ backgroundColor: STL_COLORS.borderLine }}
            />
          </div>

          <h2
            className="text-2xl font-medium tracking-tight sm:text-3xl"
            style={{
              color: STL_COLORS.textPrimary,
              fontFamily: STL_SERIF_FONT,
            }}
          >
            {activeLook.name}
          </h2>
        </div>

        <div className="scrollbar-hide flex max-w-full flex-wrap items-center gap-x-6 gap-y-2 overflow-x-auto pt-2">
          {[ALL_CATEGORIES, ...LOOK_CATEGORIES].map((category) => {
            const isActive = categoryFilter === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                aria-pressed={isActive}
                className="relative flex-none pb-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                style={{
                  color: isActive ? STL_COLORS.textPrimary : STL_COLORS.textDim,
                }}
              >
                {category}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: STL_COLORS.gold }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[400px_1fr_320px]">
        {/* Left — looks carousel, product-photo thumbnails */}
        <div
          ref={carouselRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`scrollbar-hide flex min-w-0 cursor-grab select-none gap-2 overflow-x-auto overflow-y-hidden pb-1 active:cursor-grabbing lg:grid lg:grid-cols-3 lg:auto-rows-[240px] lg:gap-1.5 lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0 ${PANEL_HEIGHT}`}
        >
          {filteredLooks.map((look) => {
            const isActive = look.id === activeLookId;
            const isFavorite = wishlistIds.includes(look.id);
            const lookTotal = look.items.reduce(
              (sum, item) => sum + item.price,
              0,
            );
            return (
              <div
                key={look.id}
                className="flex w-20 flex-none flex-col gap-1 transition-opacity duration-300 lg:w-full"
                style={{ opacity: isActive ? 1 : 0.6 }}
              >
                <div
                  className="relative h-20 w-full overflow-hidden rounded-lg border-2 transition-colors duration-300 lg:h-full lg:w-full lg:flex-1"
                  style={{
                    borderColor: isActive ? STL_COLORS.gold : "transparent",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (dragRef.current.moved) return;
                      setActiveLookId(look.id);
                    }}
                    aria-pressed={isActive}
                    aria-label={`Show ${look.name}`}
                    className="absolute inset-0"
                  >
                    <ImagePlaceholder
                      label={look.imageLabel}
                      imageUrl={look.imageUrl}
                      aspect="1/1"
                      className="h-full w-full"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite(look.id);
                    }}
                    aria-pressed={isFavorite}
                    aria-label={
                      isFavorite
                        ? `Remove ${look.name} from wishlist`
                        : `Add ${look.name} to wishlist`
                    }
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full transition-colors"
                    style={{
                      backgroundColor: `${STL_COLORS.bgPage}b3`,
                      color: isFavorite
                        ? STL_COLORS.gold
                        : STL_COLORS.textPrimary,
                    }}
                  >
                    <Heart
                      className="h-3.5 w-3.5"
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <span
                  className="truncate text-center text-[11px] font-semibold"
                  style={{
                    color: isActive
                      ? STL_COLORS.textPrimary
                      : STL_COLORS.textDim,
                  }}
                >
                  {look.name}
                </span>
                <span
                  className="text-center text-[10px] font-bold"
                  style={{ color: STL_COLORS.gold }}
                >
                  ${lookTotal.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Center — active look, large */}
        <div
          className={`relative flex min-w-0 items-center justify-center ${PANEL_HEIGHT}`}
        >
          <div
            className="relative mx-auto flex h-full w-full max-w-[320px] items-center justify-center overflow-hidden rounded-2xl border"
            style={{
              backgroundColor: STL_COLORS.bgPanel,
              borderColor: STL_COLORS.borderLine,
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
            <span
              className="absolute bottom-3 right-3 text-[10px] font-semibold uppercase tracking-[0.3em]"
              style={{
                color: STL_COLORS.goldDim,
                writingMode: "vertical-rl",
              }}
            >
              Look № {lookNumber}
            </span>
          </div>

          {filteredLooks.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevLook}
                aria-label="Show previous look"
                className="absolute left-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border transition-colors hover:border-current"
                style={{
                  backgroundColor: STL_COLORS.bgRaised,
                  borderColor: STL_COLORS.borderLine,
                  color: STL_COLORS.textPrimary,
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
                  backgroundColor: STL_COLORS.bgRaised,
                  borderColor: STL_COLORS.borderLine,
                  color: STL_COLORS.textPrimary,
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Right — pieces in this look */}
        <div className={`flex min-w-0 flex-col gap-4 ${PANEL_HEIGHT}`}>
          <h3
            className="text-xs font-bold uppercase tracking-[0.25em]"
            style={{ color: STL_COLORS.teal }}
          >
            Complete the Look
          </h3>
          <div className="relative flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1 scrollbar-hide">
            <div
              className="pointer-events-none absolute bottom-2 left-1.5 top-2 border-l border-dashed"
              style={{ borderColor: STL_COLORS.borderLine }}
            />
            {baseItems.length > 0 && (
              <div
                className="pl-3 text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: STL_COLORS.textFaint }}
              >
                Base Item
              </div>
            )}
            {baseItems.map((item) => (
              <ShopTheLookItemRow
                key={item.id}
                item={item}
                onAdd={addItemToBag}
              />
            ))}

            {accessoryItems.length > 0 && (
              <div
                className="pl-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: STL_COLORS.textFaint }}
              >
                Accessory Items
              </div>
            )}
            {accessoryItems.map((item) => (
              <ShopTheLookItemRow
                key={item.id}
                item={item}
                onAdd={addItemToBag}
              />
            ))}
          </div>

          <div
            className="flex flex-none items-center justify-between gap-3 border-t pt-3"
            style={{ borderColor: STL_COLORS.borderLine }}
          >
            <div>
              <div
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: STL_COLORS.textFaint }}
              >
                Edit Total
              </div>
              <span
                className="text-lg font-bold"
                style={{ color: STL_COLORS.gold }}
              >
                ${total.toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              onClick={addAllToBag}
              className="flex-none whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: STL_COLORS.gold,
                color: STL_COLORS.ctaText,
              }}
            >
              Add all to bag
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A single "Complete the Look" row, shared by the Base Item and Accessory Items groups. */
function ShopTheLookItemRow({
  item,
  onAdd,
}: {
  item: LookItem;
  onAdd: (item: LookItem) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex w-3 flex-none items-center justify-center self-stretch">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: STL_COLORS.goldDim }}
        />
      </div>
      <ImagePlaceholder
        label={item.imageLabel}
        imageUrl={item.imageUrl}
        aspect="1/1"
        className="h-14 w-14 flex-none overflow-hidden rounded-lg"
      />
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-sm font-semibold"
          style={{ color: STL_COLORS.textPrimary }}
        >
          {item.name}
        </div>
        <div className="text-xs font-bold" style={{ color: STL_COLORS.gold }}>
          ${item.price.toFixed(2)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onAdd(item)}
        aria-label={`Add ${item.name} to bag`}
        className="flex h-8 w-8 flex-none items-center justify-center rounded-full transition-opacity hover:opacity-90"
        style={{ backgroundColor: STL_COLORS.gold, color: STL_COLORS.ctaText }}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

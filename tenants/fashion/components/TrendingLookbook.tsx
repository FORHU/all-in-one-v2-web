"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useWishlistStore } from "@/features/storefront/stores/wishlist.store";
import { useCollections } from "@/features/storefront/hooks/queries/useCollections";
import { type Look, type LookItem } from "../data/looks";
import { toLook } from "../utils/toLook";
import { useFashionColorMode } from "../stores/colorMode.store";
import { getFashionColors, fashionFraunces } from "../theme";

const PANEL_HEIGHT = "lg:h-[520px]";
type FashionColors = ReturnType<typeof getFashionColors>;

/**
 * Fashion — "Shop the Look" widget shown above the filters+grid on
 * pages/CategoryDetailPage.tsx. Three panels: a vertical looks carousel
 * (left), the active look at large size (center), and that look's
 * individual pieces (right). Backed by CatalogCollection/CatalogCollectionItem
 * via GET /v2/collections (no type filter — fetches both OUTFIT and LOOKBOOK
 * rows), scoped to `categorySlug` so each category page only shows looks
 * featured under it (e.g. Men only shows looks tagged mens-fashion) — a
 * category with no tagged looks renders an explicit "No product available"
 * empty state rather than nothing, which is expected for categories like
 * Shoes/Accessories/Kids that don't have a dedicated look yet. Separate from
 * components/HeroBanner.tsx's own "Get the Look" carousel, which is also
 * backed by CatalogCollection (via the same useCollections hook, one query
 * per fixed category) but fetches one look per category rather than being
 * scoped to a single page.
 *
 * Follows the site's light/dark toggle — see ../theme.ts's
 * getFashionColors. Gated behind a mount flag since useFashionColorMode
 * persists to localStorage, unavailable during SSR (same pattern as
 * layouts/StorefrontLayout.tsx). Inactive thumbnails in the left carousel
 * are dimmed with a black gradient overlay on the image itself rather than
 * fading the whole element's opacity — a plain opacity fade let the page
 * background show through and washed out both the image and its label in
 * light mode.
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

  const [activeLookId, setActiveLookId] = useState<string | null>(null);
  const [justAddedAll, setJustAddedAll] = useState(false);
  const [addAllPulse, setAddAllPulse] = useState(0);
  const addAllTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addCartItem = useLocalCartStore((s) => s.addItem);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const toggleFavorite = useWishlistStore((s) => s.toggle);
  const colorMode = useFashionColorMode((s) => s.mode);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  const mode = hasMounted ? colorMode : "dark";
  const colors = getFashionColors(mode);

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

  // Still loading — nothing to show yet either way, so stay hidden rather
  // than flash an empty state before the real data (or lack of it) arrives.
  if (isLoading) return null;

  // Loaded, but this tenant/category genuinely has no looks — render the
  // section with an explicit empty state instead of disappearing, so the
  // page doesn't look broken/incomplete when a category simply has nothing
  // curated yet.
  if (looks.length === 0) {
    return (
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pt-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center gap-4">
            <span
              className="h-px w-10"
              style={{ backgroundColor: colors.hairline }}
            />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.35em]"
              style={{ color: colors.brass }}
            >
              Shop the Look
            </span>
            <span
              className="h-px w-10"
              style={{ backgroundColor: colors.hairline }}
            />
          </div>
          <p className="text-sm" style={{ color: colors.boneDim }}>
            No product available
          </p>
        </div>
      </section>
    );
  }

  const filteredLooks = looks;
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
    <section className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pt-10">
      {/* Header — eyebrow, title, subtitle, category tabs */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center gap-4">
            <span
              className="h-px w-10"
              style={{ backgroundColor: colors.hairline }}
            />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.35em]"
              style={{ color: colors.brass }}
            >
              Shop the Look
            </span>
            <span
              className="h-px w-10"
              style={{ backgroundColor: colors.hairline }}
            />
          </div>

          <h2
            className="text-2xl font-medium tracking-tight sm:text-3xl"
            style={{
              color: colors.bone,
              fontFamily: fashionFraunces.style.fontFamily,
            }}
          >
            {activeLook.name}
          </h2>
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
                className="flex w-20 flex-none flex-col gap-1 lg:w-full"
              >
                <div
                  className="relative h-20 w-full overflow-hidden rounded-lg border-2 transition-colors duration-300 lg:h-full lg:w-full lg:flex-1"
                  style={{
                    borderColor: isActive ? colors.brass : "transparent",
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
                    {!isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 transition-opacity duration-300"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.2))",
                        }}
                      />
                    )}
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
                      backgroundColor: `${colors.ink}b3`,
                      color: isFavorite ? colors.brass : colors.bone,
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
                    color: isActive ? colors.bone : colors.boneDim,
                  }}
                >
                  {look.name}
                </span>
                <span
                  className="text-center text-[10px] font-bold"
                  style={{ color: colors.brass }}
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
              backgroundColor: colors.ink,
              borderColor: colors.hairline,
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
                color: colors.brassDim,
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
                  backgroundColor: colors.ink2,
                  borderColor: colors.hairline,
                  color: colors.bone,
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
                  backgroundColor: colors.ink2,
                  borderColor: colors.hairline,
                  color: colors.bone,
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
            style={{ color: colors.brass }}
          >
            Complete the Look
          </h3>
          <div className="relative flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1 scrollbar-hide">
            <div
              className="pointer-events-none absolute bottom-2 left-1.5 top-2 border-l border-dashed"
              style={{ borderColor: colors.hairline }}
            />
            {baseItems.length > 0 && (
              <div
                className="pl-3 text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: colors.boneDim }}
              >
                Base Item
              </div>
            )}
            {baseItems.map((item) => (
              <ShopTheLookItemRow
                key={item.id}
                item={item}
                onAdd={addItemToBag}
                colors={colors}
              />
            ))}

            {accessoryItems.length > 0 && (
              <div
                className="pl-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: colors.boneDim }}
              >
                Accessory Items
              </div>
            )}
            {accessoryItems.map((item) => (
              <ShopTheLookItemRow
                key={item.id}
                item={item}
                onAdd={addItemToBag}
                colors={colors}
              />
            ))}
          </div>

          <div
            className="flex flex-none items-center justify-between gap-3 border-t pt-3"
            style={{ borderColor: colors.hairline }}
          >
            <div>
              <div
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: colors.boneDim }}
              >
                Edit Total
              </div>
              <span
                className="text-lg font-bold"
                style={{ color: colors.brass }}
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
              style={{
                backgroundColor: colors.brass,
                color: colors.ink,
              }}
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
    </section>
  );
}

/** A single "Complete the Look" row, shared by the Base Item and Accessory Items groups. */
function ShopTheLookItemRow({
  item,
  onAdd,
  colors,
}: {
  item: LookItem;
  onAdd: (item: LookItem) => void;
  colors: FashionColors;
}) {
  // Same bounce/checkmark-swap confirmation as the other add-to-bag
  // buttons — no text label here, so "added" just swaps Plus for Check.
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
          style={{ color: colors.bone }}
        >
          {item.name}
        </div>
        <div className="text-xs font-bold" style={{ color: colors.brass }}>
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
          style={{ backgroundColor: colors.brassDim }}
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
        style={{
          backgroundColor: colors.brass,
          color: colors.ink,
        }}
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

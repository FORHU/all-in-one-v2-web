"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useCollections } from "@/features/storefront/hooks/queries/useCollections";
import {
  LOOK_CATEGORIES,
  type Look,
  type LookCategory,
  type LookItem,
} from "../data/looks";
import { toLook } from "../utils/toLook";

const PANEL_HEIGHT = "lg:h-[680px]";
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

  // Looks load asynchronously — pick the first one once they arrive, and
  // re-pick if the currently active look disappears (e.g. data refetches).
  useEffect(() => {
    if (looks.length === 0) return;
    if (!looks.some((look) => look.id === activeLookId)) {
      setActiveLookId(looks[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [looks.map((l) => l.id).join(",")]);

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
  const total = activeLook.items.reduce((sum, item) => sum + item.price, 0);

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

  const borderColor =
    "color-mix(in srgb, var(--brand-primary) 12%, transparent)";

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

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[420px_1fr_280px]">
          {/* Left — vertical looks carousel */}
          <div
            className={`flex min-w-0 flex-col gap-2 rounded-2xl border p-3 ${PANEL_HEIGHT}`}
            style={{ borderColor }}
          >
            <div className="scrollbar-hide flex flex-none gap-1.5 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
              {[ALL_CATEGORIES, ...LOOK_CATEGORIES].map((category) => {
                const isActive = categoryFilter === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryChange(category)}
                    aria-pressed={isActive}
                    className="flex-none rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors"
                    style={{
                      backgroundColor: isActive
                        ? "var(--brand-primary)"
                        : "transparent",
                      color: isActive
                        ? "var(--brand-secondary)"
                        : "var(--brand-primary)",
                      borderColor: isActive
                        ? "var(--brand-primary)"
                        : "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div
              ref={carouselRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="scrollbar-hide flex min-h-0 flex-1 cursor-grab select-none gap-3 overflow-x-auto overflow-y-hidden pb-1 active:cursor-grabbing lg:grid lg:grid-cols-3 lg:auto-rows-[220px] lg:gap-2 lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0"
            >
              {filteredLooks.map((look) => {
                const isActive = look.id === activeLookId;
                return (
                  <button
                    key={look.id}
                    type="button"
                    onClick={() => {
                      if (dragRef.current.moved) return;
                      setActiveLookId(look.id);
                    }}
                    aria-pressed={isActive}
                    aria-label={`Show ${look.name}`}
                    className={`flex w-24 flex-none flex-col gap-1.5 transition-opacity duration-300 lg:w-full ${
                      isActive ? "" : "opacity-50 hover:opacity-90"
                    }`}
                  >
                    <span
                      className="block overflow-hidden rounded-xl border-2 transition-colors duration-300 lg:flex-1"
                      style={{
                        borderColor: isActive
                          ? "var(--brand-primary)"
                          : "transparent",
                      }}
                    >
                      <ImagePlaceholder
                        label={look.imageLabel}
                        imageUrl={look.imageUrl}
                        aspect="1/1"
                        className="h-32 w-full lg:h-full lg:w-full"
                      />
                    </span>
                    <span className="truncate text-center text-[11px] font-semibold">
                      {look.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center — active look, large */}
          <div
            className={`flex min-w-0 justify-center rounded-2xl border p-6 ${PANEL_HEIGHT}`}
            style={{ borderColor }}
          >
            <ImagePlaceholder
              label={activeLook.imageLabel}
              imageUrl={activeLook.imageUrl}
              aspect="3/4"
              className="w-[70%] h-auto sm:w-[46%] lg:h-auto lg:w-auto lg:max-h-full lg:max-w-full"
            />
          </div>

          {/* Right — pieces in this look */}
          <div
            className={`flex min-w-0 flex-col gap-4 rounded-2xl border p-5 ${PANEL_HEIGHT}`}
            style={{ borderColor }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-70">
              Complete the Look
            </h3>
            <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
              {activeLook.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-1 items-center gap-3 rounded-2xl border p-3"
                  style={{ borderColor }}
                >
                  <ImagePlaceholder
                    label={item.imageLabel}
                    imageUrl={item.imageUrl}
                    aspect="1/1"
                    className="h-20 w-20 flex-none"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold uppercase tracking-wide opacity-50">
                      {item.tag}
                    </div>
                    <div className="truncate text-base font-semibold">
                      {item.name}
                    </div>
                    <div className="text-sm font-bold opacity-70">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addItemToBag(item)}
                    aria-label={`Add ${item.name} to bag`}
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-full transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: "var(--brand-primary)",
                      color: "var(--brand-secondary)",
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div
              className="flex flex-none items-center justify-between gap-3 border-t pt-4"
              style={{ borderColor }}
            >
              <span className="text-2xl font-bold">${total.toFixed(2)}</span>
              <button
                type="button"
                onClick={addAllToBag}
                className="flex-none whitespace-nowrap rounded-full px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90"
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
      </div>
    </section>
  );
}

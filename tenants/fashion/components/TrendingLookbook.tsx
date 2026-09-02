"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Maximize2,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import type { ProductCardProduct } from "@/shared/components/ProductCard";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useWishlistStore } from "@/features/storefront/stores/wishlist.store";
import { useCollections } from "@/features/storefront/hooks/queries/useCollections";
import { useProducts } from "@/features/storefront/hooks/queries/useProducts";
import { type Look, type LookItem } from "../data/looks";
import { toLook } from "../utils/toLook";
import { toProductCardProduct } from "../utils/toProductCardProduct";
import { useFashionColorMode } from "../stores/colorMode.store";
import { getFashionColors, fashionDidone, fashionInter } from "../theme";

function humanize(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** ISO-8601 week number (1–53) for "WEEK N" — a real, computable value, not a placeholder. */
function isoWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

type FashionColors = ReturnType<typeof getFashionColors>;

/**
 * Fashion — "Shop the Look" widget shown above the filters+grid on
 * pages/CategoryDetailPage.tsx. A dense mosaic grid of every look's thumbnail
 * (matches a "30 outfit ideas" moodboard reference, not a single-look
 * carousel) — clicking a thumbnail opens the full look (large photo,
 * prev/next between looks, "Complete the Look" items, Add All to Bag) in an
 * overlay, reusing the same detail logic the old 3-panel layout had inline.
 * Backed by CatalogCollection/CatalogCollectionItem via GET /v2/collections
 * (no type filter — fetches both OUTFIT and LOOKBOOK rows), scoped to
 * `categorySlug` so each category page only shows looks featured under it
 * (e.g. Men only shows looks tagged mens-fashion) — a category with no
 * tagged looks falls back to that category's own trending products
 * (GET /v2/products?categorySlug=...&sort=popularity, same query
 * pages/CategoryDetailPage.tsx's grid below could show — intentionally
 * duplicated content, not a bug, since there's no other curated content to
 * fill this slot with yet) rather than an empty "No product available"
 * line. A category with neither curated looks nor any products at all
 * still shows that empty state. Separate from
 * components/HeroBanner.tsx's "Get the Look" moodboard
 * (components/GetTheLookMoodboard.tsx), which is also backed by
 * CatalogCollection (via the same useCollections hook) but is unscoped by
 * category — every curated look for the tenant, not just one page's.
 *
 * Follows the site's light/dark toggle — see ../theme.ts's
 * getFashionColors. Gated behind a mount flag since useFashionColorMode
 * persists to localStorage, unavailable during SSR (same pattern as
 * layouts/StorefrontLayout.tsx).
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

  // Fallback source for this section when the category has no curated
  // looks — only fetched once we actually know that's the case, not
  // speculatively on every render. Fetches enough for a few pages of the
  // TRENDING_PAGE_SIZE-wide carousel below, not just one page's worth.
  const TRENDING_PAGE_SIZE = 5;
  const shouldFetchTrending =
    !isLoading && looks.length === 0 && !!categorySlug;
  const { data: trendingData, isLoading: isLoadingTrending } = useProducts(
    tenantSlug,
    { categorySlug, sort: "popularity", limit: 15 },
    shouldFetchTrending,
  );
  const trendingProducts: ProductCardProduct[] = (
    trendingData?.items ?? []
  ).map(toProductCardProduct);
  const [trendingPage, setTrendingPage] = useState(0);
  const trendingPageCount = Math.max(
    1,
    Math.ceil(trendingProducts.length / TRENDING_PAGE_SIZE),
  );
  const visibleTrending = trendingProducts.slice(
    trendingPage * TRENDING_PAGE_SIZE,
    trendingPage * TRENDING_PAGE_SIZE + TRENDING_PAGE_SIZE,
  );

  const [activeLookId, setActiveLookId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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

  // Closing the overlay (Escape, backdrop click, X) only hides it — the
  // last-viewed look stays selected so reopening (or navigating prev/next
  // right after) doesn't jump back to look #1.
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

  // Still loading — nothing to show yet either way, so stay hidden rather
  // than flash an empty state before the real data (or lack of it) arrives.
  if (isLoading) return null;

  // Loaded, but this tenant/category genuinely has no looks — render the
  // section with an explicit empty state instead of disappearing, so the
  // page doesn't look broken/incomplete when a category simply has nothing
  // curated yet.
  if (looks.length === 0) {
    const weekNumber = isoWeekNumber(new Date());
    const canGoPrev = trendingPage > 0;
    const canGoNext = trendingPage < trendingPageCount - 1;

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
          {!isLoadingTrending && trendingProducts.length === 0 && (
            <p className="text-sm" style={{ color: colors.boneDim }}>
              No product available
            </p>
          )}
        </div>

        {trendingProducts.length > 0 && (
          <div className="flex flex-col gap-6">
            {/* Heading row — title left, week/ranking-method + carousel arrows right */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2
                className="text-2xl font-medium tracking-tight sm:text-3xl"
                style={{
                  color: colors.bone,
                  fontFamily: fashionDidone.style.fontFamily,
                }}
              >
                Trending in {categorySlug ? humanize(categorySlug) : "Fashion"}
              </h2>
              <div className="flex items-center gap-4">
                <span
                  className="text-[11px] uppercase tracking-[0.2em]"
                  style={{
                    color: colors.boneDim,
                    fontFamily: fashionInter.style.fontFamily,
                  }}
                >
                  Week {weekNumber} · Ranked by reviews
                </span>
                {trendingPageCount > 1 && (
                  <div className="flex flex-none gap-2">
                    <button
                      type="button"
                      onClick={() => setTrendingPage((p) => Math.max(0, p - 1))}
                      disabled={!canGoPrev}
                      aria-label="Previous trending products"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-30"
                      style={{
                        borderColor: colors.hairline,
                        color: colors.bone,
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTrendingPage((p) =>
                          Math.min(trendingPageCount - 1, p + 1),
                        )
                      }
                      disabled={!canGoNext}
                      aria-label="Next trending products"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-30"
                      style={{
                        borderColor: colors.hairline,
                        color: colors.bone,
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Ranking timeline — a hairline "ruler" tying the rank numbers
                together, purely decorative (no real time-series data behind
                it, just the current snapshot's order). */}
            <div className="relative">
              <div
                className="absolute inset-x-0 top-[13px] h-px"
                style={{ backgroundColor: colors.hairline }}
              />
              <div className="grid grid-cols-5 gap-2">
                {visibleTrending.map((product, i) => (
                  <TrendingProductTile
                    key={product.id}
                    rank={trendingPage * TRENDING_PAGE_SIZE + i + 1}
                    product={product}
                    colors={colors}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  const activeLook = looks.find((look) => look.id === activeLookId) ?? looks[0];
  const activeIndex = looks.findIndex((look) => look.id === activeLook.id);
  const total = activeLook.items.reduce((sum, item) => sum + item.price, 0);
  const lookNumber = String(activeIndex + 1).padStart(3, "0");
  const baseItems = activeLook.items.filter((item) => item.tag === "BASE");
  const accessoryItems = activeLook.items.filter((item) => item.tag === "OVER");

  const showPrevLook = () => {
    const prevIndex = (activeIndex - 1 + looks.length) % looks.length;
    setActiveLookId(looks[prevIndex].id);
  };

  const showNextLook = () => {
    const nextIndex = (activeIndex + 1) % looks.length;
    setActiveLookId(looks[nextIndex].id);
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
      {/* Header — eyebrow + title */}
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
            fontFamily: fashionDidone.style.fontFamily,
          }}
        >
          {looks.length} Outfit Idea{looks.length !== 1 ? "s" : ""}
        </h2>
      </div>

      {/* Mosaic grid — every look's thumbnail, click to open the full look */}
      <div className="grid grid-cols-5 gap-2">
        {looks.map((look) => {
          const isFavorite = wishlistIds.includes(look.id);
          const lookTotal = look.items.reduce(
            (sum, item) => sum + item.price,
            0,
          );
          return (
            <div key={look.id} className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => openLook(look.id)}
                aria-label={`Open ${look.name}`}
                className="group relative aspect-[3/4] w-full overflow-hidden rounded-lg border"
                style={{ borderColor: colors.hairline }}
              >
                <ImagePlaceholder
                  label={look.imageLabel}
                  imageUrl={look.imageUrl}
                  aspect="3/4"
                  className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0) 55%)",
                  }}
                />
                <span
                  className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    backgroundColor: `${colors.ink}b3`,
                    color: colors.bone,
                  }}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </span>
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
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full"
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
              </button>
              <div>
                <div
                  className="truncate text-xs font-semibold"
                  style={{ color: colors.bone }}
                >
                  {look.name}
                </div>
                <div
                  className="text-[11px] font-bold"
                  style={{ color: colors.brass }}
                >
                  ${lookTotal.toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail overlay — the previously inline center/right panels, now a lightbox */}
      {isDetailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsDetailOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-2xl border p-5 sm:flex-row sm:gap-6"
            style={{
              backgroundColor: colors.ink2,
              borderColor: colors.hairline,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsDetailOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.ink}b3`, color: colors.bone }}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left — active look, large */}
            <div className="relative flex h-[320px] flex-none items-center justify-center sm:h-auto sm:w-[320px]">
              <div
                className="relative mx-auto flex h-full w-full max-w-[320px] items-center justify-center overflow-hidden rounded-2xl border"
                style={{
                  backgroundColor: colors.ink,
                  borderColor: colors.hairline,
                }}
              >
                <ImagePlaceholder
                  label={activeLook.imageLabel}
                  imageUrl={activeLook.imageUrl}
                  aspect="3/4"
                  className="h-full w-full"
                />
                <span
                  className="absolute bottom-3 right-3 text-[10px] font-semibold uppercase tracking-[0.3em]"
                  style={{ color: colors.brassDim, writingMode: "vertical-rl" }}
                >
                  Look № {lookNumber}
                </span>
              </div>

              {looks.length > 1 && (
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
            <div className="mt-5 flex min-w-0 flex-1 flex-col gap-4 sm:mt-0">
              <h2
                className="text-xl font-medium tracking-tight"
                style={{
                  color: colors.bone,
                  fontFamily: fashionDidone.style.fontFamily,
                }}
              >
                {activeLook.name}
              </h2>
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
                  style={{ backgroundColor: colors.brass, color: colors.ink }}
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
    </section>
  );
}

/**
 * One "Trending in {Category}" tile — rank number, image, a persistent
 * "Shop This" link (not hover-only, matching this rail's reference design),
 * name, price. Deliberately doesn't show a rank-change indicator or a
 * "bagged" count — nothing in this app tracks either (cart is client-only
 * localStorage, and there's no historical rank snapshot to diff against),
 * so showing invented numbers there would read as real social proof that
 * isn't.
 */
function TrendingProductTile({
  rank,
  product,
  colors,
}: {
  rank: number;
  product: ProductCardProduct;
  colors: FashionColors;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="text-2xl font-medium"
        style={{
          color: colors.brass,
          fontFamily: fashionDidone.style.fontFamily,
        }}
      >
        {String(rank).padStart(2, "0")}
      </div>
      <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-lg">
        <ImagePlaceholder
          label={product.imageLabel}
          imageUrl={product.imageUrl}
          aspect="3/4"
          className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {product.slug && (
          <Link
            href={`/products/${product.slug}`}
            className="absolute inset-x-0 bottom-0 border-t py-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:opacity-90"
            style={{
              borderColor: colors.hairline,
              backgroundColor: `${colors.ink}cc`,
              color: colors.bone,
              fontFamily: fashionInter.style.fontFamily,
            }}
          >
            Shop This
          </Link>
        )}
      </div>
      <div>
        <div
          className="line-clamp-2 min-h-[2.5em] text-xs font-semibold leading-snug"
          style={{ color: colors.bone }}
        >
          {product.name}
        </div>
        <div
          className="mt-0.5 text-[11px] font-bold"
          style={{ color: colors.brass }}
        >
          ${product.price.toFixed(2)}
        </div>
      </div>
    </div>
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

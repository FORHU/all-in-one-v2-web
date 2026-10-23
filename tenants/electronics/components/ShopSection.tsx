"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAllowedImageHost } from "@/shared/components/ImagePlaceholder";
import { useElectronicsProducts } from "@/features/storefront/hooks/queries/useElectronicsProducts";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useWishlistStore } from "@/features/storefront/stores/wishlist.store";
import type { Product } from "@/features/storefront/contracts/products.contract";
import type {
  ElectronicsProductSort,
  ElectronicsProductsParams,
} from "@/features/storefront/api/electronics-products.client";
import { QuickAddDialog } from "./QuickAddDialog";
import {
  DIGITFRIEND_COLORS as COLORS,
  DIGITFRIEND_CATEGORY_META as CATEGORY_META,
} from "../theme";

type PriceKey = "any" | "u50" | "50to80" | "o80";
type ViewKey = "grid" | "list";

/** Products per page — the API pages the catalog; the browser holds one page. */
export const ELECTRONICS_PAGE_SIZE = 12;

/**
 * Shop grid columns: 4 per row on desktop (xl+, where the content column
 * beside the filter sidebar is ~970px), stepping down to 3/2/1 as it
 * narrows — explicit breakpoints rather than auto-fill, which only fit 3
 * beside the sidebar. 12 per page = 3 full rows of 4.
 */
const PRODUCT_GRID_CLASS =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export const SORT_OPTIONS: { value: ElectronicsProductSort; label: string }[] =
  [
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: low to high" },
    { value: "price-desc", label: "Price: high to low" },
    { value: "name-asc", label: "Name: A–Z" },
  ];

/** Sent to the API as priceMin/priceMax (inclusive; prices have 2 decimals). */
const PRICE_BUCKETS: {
  id: PriceKey;
  label: string;
  range: Pick<ElectronicsProductsParams, "priceMin" | "priceMax">;
}[] = [
  { id: "any", label: "Any", range: {} },
  { id: "u50", label: "Under $50", range: { priceMax: 49.99 } },
  { id: "50to80", label: "$50 – $80", range: { priceMin: 50, priceMax: 80 } },
  { id: "o80", label: "Over $80", range: { priceMin: 80.01 } },
];

function finalPriceOf(p: Product): number {
  return p.salePrice ?? p.price ?? 0;
}

/** The product's detail page (ProductDetailPage.tsx). */
export function productHref(p: Pick<Product, "slug">): string {
  return `/products/${p.slug}`;
}

/** The reference's own hand-drawn line icon per category, at a caller-chosen size/stroke. */
function CategoryIconPaths({ slug }: { slug: string }) {
  switch (slug) {
    case "audio":
      return (
        <>
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z" />
        </>
      );
    case "cameras-optics":
      return (
        <>
          <path d="M22 18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="3.5" />
        </>
      );
    case "computer-peripherals":
      return (
        <>
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
        </>
      );
    case "gaming-accessories":
      return (
        <>
          <path d="M12 2a6 6 0 0 1 6 6v8a6 6 0 0 1-12 0V8a6 6 0 0 1 6-6z" />
          <path d="M12 2v7M6 9h12" />
        </>
      );
    case "smart-home":
      return (
        <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      );
    case "wearable-tech":
      return (
        <>
          <rect x="6" y="6" width="12" height="12" rx="3" />
          <path d="M9 6l1-4h4l1 4M9 18l1 4h4l1-4M12 10v2l1.5 1.5" />
        </>
      );
    default:
      return null;
  }
}

/**
 * The design's own illustration system — a flat per-category tint field
 * with a centered line icon. Used for category tiles (CategoriesPage.tsx),
 * and as ProductMedia's fallback for a product with no usable photo.
 */
export function CategoryTile({
  slug,
  size,
  className = "",
}: {
  slug: string;
  size: number;
  className?: string;
}) {
  const meta = CATEGORY_META[slug];
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ backgroundColor: meta?.tint ?? COLORS.border }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={COLORS.ink}
        strokeWidth={size >= 70 ? 1.3 : 1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <CategoryIconPaths slug={slug} />
      </svg>
    </div>
  );
}

/**
 * A product card's image area: the product's real thumbnail when it has one
 * on an allowed host (next/image throws on any other — see
 * isAllowedImageHost), otherwise the category's CategoryTile art. The tint
 * sits behind the photo too, so letterboxed/transparent images still match
 * the category colour.
 */
export function ProductMedia({
  product,
  categorySlug,
  iconSize,
  sizes,
  className = "",
}: {
  product: Product;
  categorySlug: string;
  iconSize: number;
  sizes: string;
  className?: string;
}) {
  const url = product.thumbnailUrl;
  if (!url || !isAllowedImageHost(url)) {
    return (
      <CategoryTile slug={categorySlug} size={iconSize} className={className} />
    );
  }
  // `className` carries the caller's own positioning (e.g. `absolute
  // inset-0`), so next/image's required `relative` parent is a separate
  // inner box — on the same element, Tailwind's `relative` would override
  // `absolute` and collapse the box to zero height.
  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="relative h-full w-full"
        style={{
          backgroundColor: CATEGORY_META[categorySlug]?.tint ?? COLORS.border,
        }}
      >
        <Image
          src={url}
          alt={product.title}
          fill
          sizes={sizes}
          className="object-cover"
        />
      </div>
    </div>
  );
}

/**
 * Real availability line — `inStock` is any variant with stock left. No
 * shipping promise here: shipping is a live CJ quote charged at checkout,
 * never free unless a FREE_SHIPPING promotion applies.
 */
export function StockNote({
  inStock,
  className,
}: {
  inStock: boolean;
  className: string;
}) {
  return (
    <span
      className={className}
      style={{ color: inStock ? COLORS.success : COLORS.muted }}
    >
      {inStock ? "In stock" : "Out of stock"}
    </span>
  );
}

export function WishlistHeart({
  productId,
  variant,
}: {
  productId: string;
  variant: "overlay" | "outline";
}) {
  const saved = useWishlistStore((s) => s.ids.includes(productId));
  const toggle = useWishlistStore((s) => s.toggle);
  const base =
    variant === "overlay"
      ? "absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full"
      : "flex h-11 w-11 items-center justify-center rounded-xl";
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      onClick={() => toggle(productId)}
      className={base}
      style={{
        backgroundColor: "#ffffff",
        border:
          variant === "outline" ? `1px solid ${COLORS.border}` : undefined,
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={saved ? COLORS.wishlist : "none"}
        stroke={saved ? COLORS.wishlist : COLORS.ink}
        strokeWidth="2"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}

/**
 * A card's "Add" button. Opens QuickAddDialog to choose the variant and
 * quantity first — it no longer adds 1 instantly (that skipped the variant,
 * which checkout then resolved to an arbitrary one). Once any of this
 * product is in the cart, a lime count pill shows how many; quantities are
 * edited on /cart, where each variant has its own line.
 */
export function CartControl({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const inCart = useLocalCartStore((s) =>
    s.items
      .filter((i) => i.productId === product.id)
      .reduce((sum, i) => sum + i.quantity, 0),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!product.inStock}
        aria-haspopup="dialog"
        aria-label={
          inCart > 0
            ? `Add ${product.title} to cart, ${inCart} already in cart`
            : `Add ${product.title} to cart`
        }
        className="flex h-11 flex-none items-center gap-2 rounded-xl px-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
        style={{ backgroundColor: COLORS.ink }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add
        {inCart > 0 && (
          <span
            aria-hidden="true"
            className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1.5 text-xs"
            style={{ backgroundColor: COLORS.accent, color: COLORS.accentInk }}
          >
            {inCart}
          </span>
        )}
      </button>
      {open && (
        <QuickAddDialog product={product} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

export function GridCard({
  product,
  categorySlug,
  badge,
}: {
  product: Product;
  categorySlug: string;
  /** Optional lime tag over the photo's bottom-left, e.g. "New · 3d ago". */
  badge?: string;
}) {
  const meta = CATEGORY_META[categorySlug];
  return (
    <article
      className="flex flex-col overflow-hidden rounded-[22px]"
      style={{
        backgroundColor: COLORS.cardBg,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div className="relative aspect-[4/3]">
        <Link
          href={productHref(product)}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0"
        >
          <ProductMedia
            product={product}
            categorySlug={categorySlug}
            iconSize={84}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="h-full w-full"
          />
        </Link>
        <span
          className="absolute left-3 top-3 rounded-md px-2 py-1 text-[11px] font-medium uppercase tracking-wide"
          style={{
            backgroundColor: "#ffffff",
            color: COLORS.ink,
            fontFamily: "var(--font-mono)",
          }}
        >
          {meta?.short ?? categorySlug}
        </span>
        {badge && (
          <span
            className="absolute bottom-3 left-3 rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide"
            style={{
              backgroundColor: COLORS.accent,
              color: COLORS.accentInk,
              fontFamily: "var(--font-mono)",
            }}
          >
            {badge}
          </span>
        )}
        <WishlistHeart productId={product.id} variant="overlay" />
      </div>
      <div className="flex flex-1 flex-col gap-3.5 p-4">
        <h3 className="m-0 min-h-[43px] text-base font-bold leading-snug">
          <Link href={productHref(product)} className="hover:underline">
            {product.title}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ${finalPriceOf(product).toFixed(2)}
            </span>
            <StockNote
              inStock={product.inStock}
              className="text-xs font-medium"
            />
          </div>
          <CartControl product={product} />
        </div>
      </div>
    </article>
  );
}

function ListCard({
  product,
  categorySlug,
}: {
  product: Product;
  categorySlug: string;
}) {
  const meta = CATEGORY_META[categorySlug];
  return (
    <article
      className="flex flex-wrap items-center gap-5 rounded-[20px] p-3"
      style={{
        backgroundColor: COLORS.cardBg,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <Link
        href={productHref(product)}
        tabIndex={-1}
        aria-hidden="true"
        className="flex-none"
      >
        <ProductMedia
          product={product}
          categorySlug={categorySlug}
          iconSize={56}
          sizes="132px"
          className="h-[132px] w-[132px] rounded-[14px]"
        />
      </Link>
      <div
        className="flex min-w-0 flex-1 flex-col gap-1.5"
        style={{ flexBasis: "240px" }}
      >
        <span
          className="text-[11px] font-medium uppercase tracking-wide"
          style={{ color: COLORS.muted, fontFamily: "var(--font-mono)" }}
        >
          {meta?.short ?? categorySlug}
        </span>
        <h3 className="m-0 text-lg font-bold leading-snug">
          <Link href={productHref(product)} className="hover:underline">
            {product.title}
          </Link>
        </h3>
        <StockNote
          inStock={product.inStock}
          className="text-[13px] font-medium"
        />
      </div>
      <div className="flex items-center gap-3 pr-2">
        <span
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ${finalPriceOf(product).toFixed(2)}
        </span>
        <WishlistHeart productId={product.id} variant="outline" />
        <CartControl product={product} />
      </div>
    </article>
  );
}

/** Page numbers to show: first, last and current±1, with gaps collapsed to "…". */
function pageItems(page: number, totalPages: number): (number | "gap")[] {
  const keep = new Set([1, totalPages, page - 1, page, page + 1]);
  const items: (number | "gap")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (keep.has(p)) items.push(p);
    else if (items[items.length - 1] !== "gap") items.push("gap");
  }
  return items;
}

/**
 * Previous / numbered pages / Next for a server-paginated list — `onChange`
 * just sets the page the API is asked for. Shared with
 * CategoryDetailPage.tsx.
 */
export function Pagination({
  page,
  totalPages,
  onChange,
  disabled = false,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}) {
  const edgeButton =
    "flex h-11 items-center gap-1.5 rounded-xl px-3.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40";
  const edgeStyle = {
    backgroundColor: "#ffffff",
    border: `1px solid ${COLORS.borderStrong}`,
  };
  return (
    <nav
      aria-label="Pagination"
      className="mt-2 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
        className={edgeButton}
        style={edgeStyle}
      >
        <span aria-hidden="true">‹</span> Previous
      </button>
      {pageItems(page, totalPages).map((item, i) =>
        item === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden="true"
            className="px-1 text-sm"
            style={{ color: COLORS.muted }}
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            disabled={disabled}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className="h-11 min-w-[44px] rounded-xl px-3 text-sm font-bold disabled:cursor-not-allowed"
            style={{
              fontFamily: "var(--font-mono)",
              backgroundColor: item === page ? COLORS.ink : "#ffffff",
              color: item === page ? "#ffffff" : COLORS.ink,
              border: `1px solid ${item === page ? COLORS.ink : COLORS.borderStrong}`,
            }}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={disabled || page >= totalPages}
        className={edgeButton}
        style={edgeStyle}
      >
        Next <span aria-hidden="true">›</span>
      </button>
    </nav>
  );
}

/**
 * DigitFriend — the "Shop" section: breadcrumb, sort/view controls, a
 * category + price filter sidebar, and a grid/list product listing.
 * Replaces the earlier hero + CategoryGrid + bento FeaturedProducts with a
 * single filterable browse surface, matching the "digitfriend ui.html"
 * design reference. Real data from the electronics tenant (CJ-sourced),
 * via GET /api/v2/electronics/products (useElectronicsProducts): category,
 * price range, search (?q= from the header search), sort and page all go
 * to the API, which filters, sorts and paginates server-side — this
 * component only ever holds the one page it renders. The same response
 * carries the sidebar's per-category counts (current price + search
 * filters). Changing any filter returns to page 1. Wishlist/cart are real (useWishlistStore/useLocalCartStore) —
 * this is the one place on the tenant where "Add to cart" actually mutates
 * the same cart state the header badge reads.
 */
export function ShopSection({
  tenantSlug,
  initialCategory = "all",
  searchQuery = "",
}: {
  tenantSlug: string;
  /** Pre-selected category slug, e.g. from /shop?category=audio. */
  initialCategory?: string;
  /** Free-text search from /shop?q=… (the header search's full results). */
  searchQuery?: string;
}) {
  const router = useRouter();
  const search = searchQuery.trim();
  const [category, setCategoryState] = useState<string>(initialCategory);
  const [price, setPriceState] = useState<PriceKey>("any");
  const [sort, setSortState] = useState<ElectronicsProductSort>("newest");
  const [view, setView] = useState<ViewKey>("grid");
  const [page, setPage] = useState(1);

  // Any filter change starts over at page 1.
  const setCategory = (value: string) => {
    setCategoryState(value);
    setPage(1);
  };
  const setPrice = (value: PriceKey) => {
    setPriceState(value);
    setPage(1);
  };
  const setSort = (value: ElectronicsProductSort) => {
    setSortState(value);
    setPage(1);
  };

  const priceBucket = PRICE_BUCKETS.find((b) => b.id === price)!;

  const { data, isLoading, isError, isPlaceholderData } =
    useElectronicsProducts(tenantSlug, {
      category: category === "all" ? undefined : category,
      ...priceBucket.range,
      q: search || undefined,
      sort,
      page,
      limit: ELECTRONICS_PAGE_SIZE,
    });

  const categories = useMemo(() => data?.categories ?? [], [data]);
  const filtered = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const idToSlug = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => (map[c.id] = c.slug));
    return map;
  }, [categories]);

  const goToPage = (next: number) => {
    setPage(next);
    document
      .getElementById("shop")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // A product in a subcategory isn't in the root `categories` list — fall
  // back to the selected category so its card still gets that category's art.
  const cardCategorySlug = (p: Product) =>
    (p.categoryId ? idToSlug[p.categoryId] : undefined) ??
    (category === "all" ? "" : category);
  const activeCategory = categories.find((c) => c.slug === category);
  const heading = search
    ? `Results for “${search}”`
    : category === "all"
      ? "Shop all gear"
      : (activeCategory?.name ?? category);
  // The search lives in the URL (?q=), so clearing it navigates — keeping
  // the current category — which also empties the header search box.
  const clearSearch = () =>
    router.replace(
      category === "all"
        ? "/shop"
        : `/shop?category=${encodeURIComponent(category)}`,
    );
  const chips: { label: string; clear: () => void }[] = [];
  if (search) chips.push({ label: `Search: “${search}”`, clear: clearSearch });
  if (category !== "all")
    chips.push({
      label: activeCategory?.name ?? category,
      clear: () => setCategory("all"),
    });
  if (price !== "any")
    chips.push({ label: priceBucket.label, clear: () => setPrice("any") });
  const clearAll = () => {
    setCategory("all");
    setPrice("any");
    if (search) router.replace("/shop");
  };

  return (
    <main
      id="shop"
      className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pb-6 pt-7"
    >
      <div className="flex flex-col gap-2">
        <nav
          aria-label="Breadcrumb"
          className="flex gap-2 text-[13px]"
          style={{ color: COLORS.muted }}
        >
          <Link href="/" className="no-underline hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span style={{ color: COLORS.ink }}>
            {search ? "Search" : category === "all" ? "All products" : heading}
          </span>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-baseline gap-3.5">
            <h1
              className="m-0 text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {heading}
            </h1>
            <span
              className="text-[13px]"
              style={{ color: COLORS.muted, fontFamily: "var(--font-mono)" }}
            >
              {isLoading ? "…" : `${total} ${total === 1 ? "item" : "items"}`}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <label
              htmlFor="df-sort"
              className="text-sm"
              style={{ color: COLORS.muted }}
            >
              Sort by
            </label>
            <select
              id="df-sort"
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as ElectronicsProductSort)
              }
              className="h-11 rounded-xl px-3.5 text-sm font-medium"
              style={{
                border: `1px solid ${COLORS.borderStrong}`,
                backgroundColor: "#ffffff",
                color: COLORS.ink,
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <div
              role="group"
              aria-label="Layout"
              className="flex gap-0.5 rounded-xl p-[3px]"
              style={{
                backgroundColor: "#ffffff",
                border: `1px solid ${COLORS.borderStrong}`,
              }}
            >
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
                className="flex h-9 w-10 items-center justify-center rounded-[9px]"
                style={{
                  backgroundColor: view === "grid" ? COLORS.ink : "transparent",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={view === "grid" ? "#ffffff" : COLORS.ink}
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="List view"
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
                className="flex h-9 w-10 items-center justify-center rounded-[9px]"
                style={{
                  backgroundColor: view === "list" ? COLORS.ink : "transparent",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={view === "list" ? "#ffffff" : COLORS.ink}
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="5" height="5" rx="1" />
                  <rect x="3" y="15" width="5" height="5" rx="1" />
                  <path d="M12 6.5h9M12 17.5h9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-8">
        <aside
          aria-label="Filters"
          className="flex max-w-full flex-1 flex-col gap-7"
          style={{ flexBasis: "230px" }}
        >
          <div className="flex flex-col gap-1">
            <h2
              className="m-0 mb-2 text-xs font-medium uppercase tracking-wide"
              style={{ color: COLORS.muted, fontFamily: "var(--font-mono)" }}
            >
              Category
            </h2>
            <button
              type="button"
              onClick={() => setCategory("all")}
              aria-pressed={category === "all"}
              className="flex min-h-[44px] items-center justify-between gap-2.5 rounded-xl px-3 text-left text-[15px]"
              style={{
                backgroundColor:
                  category === "all" ? COLORS.ink : "transparent",
                color: category === "all" ? "#ffffff" : COLORS.ink,
                fontWeight: category === "all" ? 700 : 500,
              }}
            >
              <span>All products</span>
              <span
                className="text-xs opacity-75"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {data?.allCount ?? 0}
              </span>
            </button>
            {categories.map((c) => {
              const on = c.slug === category;
              const count = c.count;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.slug)}
                  aria-pressed={on}
                  className="flex min-h-[44px] items-center justify-between gap-2.5 rounded-xl px-3 text-left text-[15px]"
                  style={{
                    backgroundColor: on ? COLORS.ink : "transparent",
                    color: on ? "#ffffff" : COLORS.ink,
                    fontWeight: on ? 700 : 500,
                  }}
                >
                  <span>{c.name}</span>
                  <span
                    className="text-xs opacity-75"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            <h2
              className="m-0 mb-1 text-xs font-medium uppercase tracking-wide"
              style={{ color: COLORS.muted, fontFamily: "var(--font-mono)" }}
            >
              Price
            </h2>
            <div className="flex flex-wrap gap-2">
              {PRICE_BUCKETS.map((r) => {
                const on = r.id === price;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setPrice(r.id)}
                    aria-pressed={on}
                    className="h-10 rounded-full px-3.5 text-sm font-medium"
                    style={{
                      border: `1px solid ${on ? COLORS.ink : COLORS.borderStrong}`,
                      backgroundColor: on ? COLORS.ink : "#ffffff",
                      color: on ? "#ffffff" : COLORS.ink,
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* p-5, not p-4.5 — Tailwind 3 has no 4.5 step, so the old class
              silently produced zero padding. */}
          <div
            className="flex items-start gap-3.5 rounded-[18px] p-5 text-white"
            style={{ backgroundColor: COLORS.ink, colorScheme: "dark" }}
          >
            <span
              className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px]"
              style={{ backgroundColor: COLORS.accent }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.accentInk}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M1 6h13v10H1zM14 10h4l3 3v3h-7" />
                <circle cx="5.5" cy="18" r="1.8" />
                <circle cx="17.5" cy="18" r="1.8" />
              </svg>
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-[15px] font-bold leading-snug">
                Shipping calculated at checkout
              </span>
              <span
                className="text-sm leading-relaxed"
                style={{ color: "#b8bcc6" }}
              >
                Live shipping rates for your address, shown before you pay.
              </span>
            </span>
          </div>
        </aside>

        <section
          aria-label="Products"
          aria-busy={isPlaceholderData}
          className="flex min-w-0 flex-[999_1_560px] flex-col gap-4 transition-opacity"
          style={{ opacity: isPlaceholderData ? 0.55 : 1 }}
        >
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {chips.map((ch) => (
                <button
                  key={ch.label}
                  type="button"
                  onClick={ch.clear}
                  aria-label={`Remove filter ${ch.label}`}
                  className="flex h-9 items-center gap-2 rounded-full pl-3.5 pr-2.5 text-sm font-medium"
                  style={{
                    backgroundColor: COLORS.accent,
                    color: COLORS.accentInk,
                  }}
                >
                  {ch.label}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={COLORS.accentInk}
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="h-9 px-2.5 text-sm underline"
                style={{ color: COLORS.ink }}
              >
                Clear all
              </button>
            </div>
          )}

          {isLoading ? (
            <div className={PRODUCT_GRID_CLASS}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] animate-pulse rounded-[22px]"
                  style={{ backgroundColor: COLORS.border }}
                />
              ))}
            </div>
          ) : isError ? (
            <div
              className="flex flex-col items-center gap-3 rounded-[22px] px-6 py-14 text-center"
              style={{
                backgroundColor: "#ffffff",
                border: `1px dashed ${COLORS.borderStrong}`,
              }}
            >
              <span
                className="text-[22px] font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Couldn&apos;t load products
              </span>
              <span className="text-[15px]" style={{ color: COLORS.muted }}>
                Please try again in a moment.
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 rounded-[22px] px-6 py-14 text-center"
              style={{
                backgroundColor: "#ffffff",
                border: `1px dashed ${COLORS.borderStrong}`,
              }}
            >
              <span
                className="text-[22px] font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {search
                  ? `No products match “${search}”`
                  : "Nothing matches those filters"}
              </span>
              <span className="text-[15px]" style={{ color: COLORS.muted }}>
                {search
                  ? "Check the spelling or try a more general word."
                  : "Try another price range or category."}
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="h-11 rounded-xl px-5 text-sm font-bold text-white"
                style={{ backgroundColor: COLORS.ink }}
              >
                Clear filters
              </button>
            </div>
          ) : view === "grid" ? (
            <div className={PRODUCT_GRID_CLASS}>
              {filtered.map((p) => (
                <GridCard
                  key={p.id}
                  product={p}
                  categorySlug={cardCategorySlug(p)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((p) => (
                <ListCard
                  key={p.id}
                  product={p}
                  categorySlug={cardCategorySlug(p)}
                />
              ))}
            </div>
          )}

          {!isError && totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={goToPage}
              disabled={isPlaceholderData}
            />
          )}
        </section>
      </div>
    </main>
  );
}

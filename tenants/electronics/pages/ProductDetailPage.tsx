"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useProductDetail } from "@/features/storefront/hooks/queries/useProductDetail";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import type {
  ProductAttributeOption,
  ProductDetail,
} from "@/features/storefront/contracts/products.contract";
import { isAllowedImageHost } from "@/shared/components/ImagePlaceholder";
import { sanitizeHtml } from "@/shared/lib/sanitizeHtml";
import { ElectronicsStorefrontLayout } from "../layouts/StorefrontLayout";
import {
  CategoryTile,
  StockNote,
  WishlistHeart,
} from "../components/ShopSection";
import {
  DIGITFRIEND_COLORS as COLORS,
  DIGITFRIEND_CATEGORY_META as CATEGORY_META,
} from "../theme";

/** Descriptions taller than this collapse behind a "Show more" toggle. */
const COLLAPSED_DESCRIPTION_PX = 520;

/**
 * CJ variants sometimes share a display label while their values differ
 * ("CK61 English" / "CK104 English" both labelled "English") — those fall
 * back to the full value so every chip is distinguishable.
 */
function optionLabeler(options: ProductAttributeOption[]) {
  const counts = new Map<string, number>();
  options.forEach((o) => counts.set(o.label, (counts.get(o.label) ?? 0) + 1));
  return (o: ProductAttributeOption) =>
    (counts.get(o.label) ?? 0) > 1 ? o.value : o.label;
}

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

/**
 * DigitFriend — product detail page. Backed by GET /v2/products/:slug
 * (useProductDetail), the same endpoint fashion's PDP uses, restyled to the
 * "digitfriend ui.html" palette. Products are CJ Dropshipping imports, so:
 *  - the gallery shows every distinct supplier photo (5–20 is typical);
 *  - variant chips switch the shown price and stock to that variant's own
 *    numbers — CJ variants of one product are often priced differently, and
 *    checkout charges the chosen variant's price, not the product's
 *    "from" price;
 *  - the description is CJ's raw HTML, sanitized before rendering.
 * Add to cart writes the chosen variant (color/size values) into the local
 * cart, which is what checkout resolves back to a real variant.
 */
export function ElectronicsProductDetailPage({
  tenantSlug,
  slug,
}: {
  tenantSlug: string;
  slug: string;
}) {
  const {
    data: product,
    isLoading,
    isError,
  } = useProductDetail(tenantSlug, slug);

  return (
    <ElectronicsStorefrontLayout>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 pb-16 pt-7">
        {isLoading ? (
          <div className="grid gap-10 lg:grid-cols-2">
            <div
              className="aspect-square animate-pulse rounded-[22px]"
              style={{ backgroundColor: COLORS.border }}
            />
            <div className="flex flex-col gap-4">
              {[60, 90, 40, 70].map((w) => (
                <div
                  key={w}
                  className="h-6 animate-pulse rounded-lg"
                  style={{ width: `${w}%`, backgroundColor: COLORS.border }}
                />
              ))}
            </div>
          </div>
        ) : isError || !product ? (
          <NotFound failed={isError} />
        ) : (
          <ProductView product={product} />
        )}
      </main>
    </ElectronicsStorefrontLayout>
  );
}

function NotFound({ failed }: { failed: boolean }) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-[22px] px-6 py-20 text-center"
      style={{
        backgroundColor: "#ffffff",
        border: `1px dashed ${COLORS.borderStrong}`,
      }}
    >
      <span
        className="text-[22px] font-bold"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {failed ? "Something went wrong" : "Product not found"}
      </span>
      <span className="text-[15px]" style={{ color: COLORS.muted }}>
        {failed
          ? "We couldn't load this product. Please try again."
          : "It may have been removed from the catalog."}
      </span>
      <Link
        href="/#shop"
        className="mt-1 flex h-11 items-center rounded-xl px-5 text-sm font-bold text-white"
        style={{ backgroundColor: COLORS.ink }}
      >
        Back to shop
      </Link>
    </div>
  );
}

function ProductView({ product }: { product: ProductDetail }) {
  const addItem = useLocalCartStore((s) => s.addItem);
  const categorySlug = product.categorySlug ?? "";

  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors[0]?.value,
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes[0]?.value,
  );
  const [quantity, setQuantity] = useState(1);

  // Reset the selection when navigating between products.
  useEffect(() => {
    setSelectedColor(product.colors[0]?.value);
    setSelectedSize(product.sizes[0]?.value);
    setQuantity(1);
  }, [product]);

  const selectedVariant = product.variants.find(
    (v) =>
      (product.colors.length === 0 || v.color === selectedColor) &&
      (product.sizes.length === 0 || v.size === selectedSize),
  );
  const hasOptions = product.colors.length > 0 || product.sizes.length > 0;

  const price =
    selectedVariant?.price ?? product.salePrice ?? product.price ?? 0;
  const compareAtRaw =
    selectedVariant?.compareAtPrice ?? product.compareAtPrice ?? null;
  const compareAt =
    compareAtRaw != null && compareAtRaw > price ? compareAtRaw : null;
  const stock = hasOptions ? selectedVariant?.stock : undefined;
  const inStock = stock != null ? stock > 0 : product.inStock;

  // Keep the quantity within what the selected variant actually has.
  useEffect(() => {
    if (stock != null && stock > 0) setQuantity((q) => Math.min(q, stock));
  }, [stock]);

  const images = useMemo(
    () => product.images.filter((url) => isAllowedImageHost(url)),
    [product.images],
  );

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.title,
      brand: product.brand ?? "",
      price,
      imageLabel: product.title,
      imageUrl: images[0] ?? product.thumbnailUrl,
      color: selectedColor,
      size: selectedSize,
      quantity,
      stock,
    });
    toast.success(`Added ${product.title} to cart`);
  };

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-wrap gap-2 text-[13px]"
        style={{ color: COLORS.muted }}
      >
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        {product.categorySlug && (
          <>
            <Link
              href={`/categories/${product.categorySlug}`}
              className="hover:underline"
            >
              {product.categoryName ?? product.categorySlug}
            </Link>
            <span aria-hidden="true">/</span>
          </>
        )}
        <span className="min-w-0 truncate" style={{ color: COLORS.ink }}>
          {product.title}
        </span>
      </nav>

      <div className="grid items-start gap-10 lg:grid-cols-2">
        <Gallery
          images={images}
          title={product.title}
          categorySlug={categorySlug}
        />

        <section className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-2">
            {CATEGORY_META[categorySlug] && (
              <span
                className="text-[11px] font-medium uppercase tracking-wide"
                style={{ color: COLORS.muted, fontFamily: "var(--font-mono)" }}
              >
                {CATEGORY_META[categorySlug].short}
              </span>
            )}
            <h1
              className="m-0 text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {product.title}
            </h1>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-3">
              <span
                className="text-4xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {money(price)}
              </span>
              {compareAt != null && (
                <>
                  <span
                    className="text-lg line-through"
                    style={{ color: COLORS.muted }}
                  >
                    {money(compareAt)}
                  </span>
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{
                      backgroundColor: COLORS.accent,
                      color: COLORS.accentInk,
                    }}
                  >
                    Save {Math.round(((compareAt - price) / compareAt) * 100)}%
                  </span>
                </>
              )}
            </div>
            <StockNote inStock={inStock} className="text-sm font-medium" />
          </div>

          {product.colors.length > 0 && (
            <OptionGroup
              label={product.colors.length > 1 ? "Choose a variant" : "Variant"}
              options={product.colors}
              selected={selectedColor}
              onSelect={setSelectedColor}
              isAvailable={(value) =>
                product.variants.some((v) => v.color === value && v.stock > 0)
              }
            />
          )}
          {product.sizes.length > 0 && (
            <OptionGroup
              label="Size"
              options={product.sizes}
              selected={selectedSize}
              onSelect={setSelectedSize}
              isAvailable={(value) =>
                product.variants.some((v) => v.size === value && v.stock > 0)
              }
            />
          )}

          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex h-12 items-center rounded-xl"
              style={{
                backgroundColor: "#ffffff",
                border: `1px solid ${COLORS.borderStrong}`,
              }}
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-12 w-11 items-center justify-center disabled:opacity-30"
              >
                <Minus size={16} />
              </button>
              <span
                aria-live="polite"
                className="min-w-[28px] text-center text-[15px] font-bold"
              >
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
                disabled={stock != null && quantity >= stock}
                className="flex h-12 w-11 items-center justify-center disabled:opacity-30"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={!inStock}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: COLORS.ink, minWidth: "180px" }}
            >
              <Plus size={18} strokeWidth={2.6} />
              {inStock
                ? `Add to cart · ${money(price * quantity)}`
                : "Out of stock"}
            </button>

            <WishlistHeart productId={product.id} variant="outline" />
          </div>

          <ul
            className="m-0 grid list-none gap-3 rounded-[18px] p-4 sm:grid-cols-3"
            style={{
              backgroundColor: "#ffffff",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {[
              {
                Icon: Truck,
                title: "Shipping",
                text: "Calculated at checkout",
              },
              {
                Icon: ShieldCheck,
                title: "Warranty",
                text: "Extended cover included",
              },
              {
                Icon: RotateCcw,
                title: "30-day returns",
                text: "No-hassle returns",
              },
            ].map(({ Icon, title, text }) => (
              <li key={title} className="flex items-start gap-2.5">
                <span
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-lg"
                  style={{ backgroundColor: COLORS.accent }}
                >
                  <Icon size={18} color={COLORS.accentInk} />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-bold">{title}</span>
                  <span className="text-xs" style={{ color: COLORS.muted }}>
                    {text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {product.description && <Description html={product.description} />}
    </>
  );
}

function Gallery({
  images,
  title,
  categorySlug,
}: {
  images: string[];
  title: string;
  categorySlug: string;
}) {
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [images]);

  if (images.length === 0) {
    return (
      <CategoryTile
        slug={categorySlug}
        size={140}
        className="aspect-square rounded-[22px]"
      />
    );
  }

  const current = images[Math.min(active, images.length - 1)];
  const step = (delta: number) =>
    setActive((i) => (i + delta + images.length) % images.length);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div
        className="relative aspect-square overflow-hidden rounded-[22px]"
        style={{
          backgroundColor: "#ffffff",
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <Image
          src={current}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain"
        />
        {images.length > 1 && (
          <>
            {[
              {
                delta: -1,
                label: "Previous photo",
                Icon: ChevronLeft,
                side: "left-3",
              },
              {
                delta: 1,
                label: "Next photo",
                Icon: ChevronRight,
                side: "right-3",
              },
            ].map(({ delta, label, Icon, side }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                onClick={() => step(delta)}
                className={`absolute top-1/2 ${side} flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full`}
                style={{
                  backgroundColor: "#ffffff",
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Icon size={20} />
              </button>
            ))}
            <span
              className="absolute bottom-3 right-3 rounded-md px-2 py-1 text-[11px]"
              style={{
                backgroundColor: COLORS.ink,
                color: "#ffffff",
                fontFamily: "var(--font-mono)",
              }}
            >
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              className="relative h-[72px] w-[72px] flex-none overflow-hidden rounded-xl"
              style={{
                backgroundColor: "#ffffff",
                border: `2px solid ${i === active ? COLORS.ink : COLORS.border}`,
              }}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="72px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OptionGroup({
  label,
  options,
  selected,
  onSelect,
  isAvailable,
}: {
  label: string;
  options: ProductAttributeOption[];
  selected: string | undefined;
  onSelect: (value: string) => void;
  isAvailable: (value: string) => boolean;
}) {
  const labelFor = optionLabeler(options);
  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend
        className="mb-2 p-0 text-xs font-medium uppercase tracking-wide"
        style={{ color: COLORS.muted, fontFamily: "var(--font-mono)" }}
      >
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.value === selected;
          const available = isAvailable(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(o.value)}
              className={`min-h-[40px] rounded-full px-4 text-sm font-medium ${available ? "" : "line-through opacity-50"}`}
              style={{
                border: `1px solid ${on ? COLORS.ink : COLORS.borderStrong}`,
                backgroundColor: on ? COLORS.ink : "#ffffff",
                color: on ? "#ffffff" : COLORS.ink,
              }}
            >
              {labelFor(o)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * CJ's description, sanitized (it's third-party HTML, often with large
 * spec/size-chart images). Long ones collapse behind "Show more".
 */
function Description({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const clean = useMemo(() => sanitizeHtml(html), [html]);

  // Re-measured as the description's images load in and grow it.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const measure = () =>
      setOverflowing(el.scrollHeight > COLLAPSED_DESCRIPTION_PX + 1);
    measure();
    const observer = new ResizeObserver(measure);
    Array.from(el.children).forEach((child) => observer.observe(child));
    el.querySelectorAll("img").forEach((img) =>
      img.addEventListener("load", measure),
    );
    return () => observer.disconnect();
  }, [clean]);

  const collapsed = overflowing && !expanded;

  return (
    <section
      className="flex flex-col gap-4 rounded-[22px] p-6"
      style={{
        backgroundColor: "#ffffff",
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <h2
        className="m-0 text-2xl font-bold tracking-tight"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Product details
      </h2>
      <div className="relative">
        <div
          ref={bodyRef}
          className="overflow-hidden text-[15px] leading-relaxed [&_b]:font-bold [&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_p]:mb-3 [&_table]:max-w-full"
          style={{
            color: COLORS.muted,
            maxHeight: expanded ? undefined : COLLAPSED_DESCRIPTION_PX,
          }}
          dangerouslySetInnerHTML={{ __html: clean }}
        />
        {collapsed && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
            style={{
              background: "linear-gradient(to bottom, transparent, #ffffff)",
            }}
          />
        )}
      </div>
      {overflowing && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="h-11 self-start rounded-xl px-5 text-sm font-bold"
          style={{ border: `1px solid ${COLORS.borderStrong}` }}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </section>
  );
}

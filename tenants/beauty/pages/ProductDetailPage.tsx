"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import { BeautyStorefrontLayout } from "../layouts/StorefrontLayout";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { sanitizeHtml } from "@/shared/lib/sanitizeHtml";
import { useProductDetail } from "@/features/storefront/hooks/queries/useProductDetail";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useBuyNowStore } from "@/features/storefront/stores/buyNow.store";
import { useWishlistStore } from "@/features/storefront/stores/wishlist.store";
import type { ProductAttributeOption } from "@/features/storefront/contracts/products.contract";
import { BEAUTY_MIRROR_COLORS as COLORS } from "../theme";
import { beautyMockProducts } from "../data/products";
import { beautyCategories } from "../data/categories";

/** Shape both a real ProductDetail and a mock product (data/products.ts) can fill — lets the page render one body regardless of which one it got. */
type ProductView = {
  id: string;
  title: string;
  brand: string | null;
  price: number;
  compareAtPrice: number | null;
  description: string | null;
  images: string[];
  thumbnailUrl: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  colors: ProductAttributeOption[];
  sizes: ProductAttributeOption[];
  variants: { color: string | null; size: string | null; stock: number }[];
  inStock: boolean;
  /** True for a mock-fallback product — no real backend record, shown with an explanatory banner. */
  isPreview: boolean;
};

/**
 * Beauty — product detail page (PDP). Backed by the same GET
 * /v2/products/:slug as every other tenant (useProductDetail) — this is
 * new wiring, not new backend work: until now beauty had no entry in
 * src/app/products/[slug]/page.tsx's productDetailPagesBySlug, so hitting
 * a product rendered a blank page.
 *
 * Beauty's real catalog may be empty for a given slug, so when the real
 * fetch finds nothing this falls back to data/products.ts's mock catalog
 * by slug — the same fallback pattern CategoryDetailPage.tsx and
 * MirrorShelfHero.tsx already use — so a mock product (e.g. clicked from
 * MirrorShelfHero's sample cards, see mirrorShelfSampleCategories.ts's
 * productSlug field) still opens a real-looking product display instead of
 * a bare "not found." It's clearly marked PREVIEW via a banner, but
 * quantity/wishlist/Add to Bag all work normally — the local cart is
 * client-only state with no real backend record requirement either way,
 * so there's no technical reason to block interaction on a mock product.
 * Once beauty has a real catalog row for that slug, useProductDetail
 * returns it and this fallback stops being used automatically.
 *
 * "Buy Now" routes straight to /checkout?mode=buy-now (now wired, see
 * pages/CheckoutPage.tsx), the same single-item flow fashion's PDP uses —
 * writes this one item to the shared useBuyNowStore instead of the cart,
 * so it never touches whatever's already in the bag. Hidden for a preview
 * (mock-fallback) product specifically: its id isn't a real
 * CatalogProduct row, so checkoutDirect would fail trying to resolve it
 * server-side — "Add to Bag" stays enabled for preview products since the
 * local cart is client-only state with no such requirement.
 */
export function BeautyProductDetailPage({
  tenantSlug,
  slug,
}: {
  tenantSlug: string;
  slug: string;
}) {
  const router = useRouter();
  const { data: product, isLoading } = useProductDetail(tenantSlug, slug);
  const addItem = useLocalCartStore((s) => s.addItem);
  const setBuyNowItem = useBuyNowStore((s) => s.setItem);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);

  const mockProduct =
    !isLoading && !product
      ? beautyMockProducts.find((p) => p.slug === slug)
      : undefined;

  const view: ProductView | null = useMemo(
    () =>
      product
        ? {
            id: product.id,
            title: product.title,
            brand: product.brand,
            price: product.price ?? 0,
            compareAtPrice: product.compareAtPrice,
            description: product.description,
            images: product.images,
            thumbnailUrl: product.thumbnailUrl,
            categorySlug: product.categorySlug,
            categoryName: product.categoryName,
            colors: product.colors,
            sizes: product.sizes,
            variants: product.variants,
            inStock: product.inStock,
            isPreview: false,
          }
        : mockProduct
          ? {
              id: mockProduct.id,
              title: mockProduct.title,
              brand: mockProduct.brand,
              price: mockProduct.price,
              compareAtPrice: null,
              description: null,
              images: [],
              thumbnailUrl: null,
              categorySlug: mockProduct.categorySlug,
              categoryName:
                beautyCategories.find(
                  (c) => c.slug === mockProduct.categorySlug,
                )?.label ?? null,
              colors: [],
              sizes: [],
              variants: [],
              inStock: true,
              isPreview: true,
            }
          : null,
    [product, mockProduct],
  );

  useEffect(() => {
    if (!view) return;
    setSelectedImage(0);
    setSelectedColor(view.colors[0]?.value);
    setSelectedSize(view.sizes[0]?.value);
    setQuantity(1);
  }, [view]);

  if (isLoading) {
    return (
      <BeautyStorefrontLayout>
        <div
          className="mx-auto max-w-7xl px-6 py-16"
          style={{ color: COLORS.muted }}
        >
          Loading…
        </div>
      </BeautyStorefrontLayout>
    );
  }

  if (!view) {
    return (
      <BeautyStorefrontLayout>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
          <h1
            className="text-2xl font-semibold"
            style={{ color: COLORS.ink, fontFamily: "var(--font-heading)" }}
          >
            Product not found
          </h1>
          <Link
            href="/categories"
            className="rounded-full px-6 py-3 text-xs font-bold uppercase tracking-wide"
            style={{ backgroundColor: COLORS.ink, color: COLORS.accentInk }}
          >
            Continue Shopping
          </Link>
        </div>
      </BeautyStorefrontLayout>
    );
  }

  const isFavorite = wishlistIds.includes(view.id);
  const price = view.price;
  const hasDiscount =
    view.compareAtPrice != null && view.compareAtPrice > price;
  const savings = hasDiscount ? view.compareAtPrice! - price : 0;
  const activeImage =
    view.images[selectedImage] ?? view.thumbnailUrl ?? undefined;

  const selectedVariantStock =
    view.colors.length === 0 && view.sizes.length === 0
      ? undefined
      : view.variants.find((v) => {
          const colorMatches =
            view.colors.length === 0 || v.color === selectedColor;
          const sizeMatches =
            view.sizes.length === 0 || v.size === selectedSize;
          return colorMatches && sizeMatches;
        })?.stock;
  const isSelectionInStock =
    selectedVariantStock != null ? selectedVariantStock > 0 : view.inStock;

  const handleAddToBag = () => {
    addItem({
      productId: view.id,
      name: view.title,
      brand: view.brand ?? "",
      price,
      imageLabel: view.title,
      imageUrl: activeImage,
      size: selectedSize,
      color: selectedColor,
      quantity,
      stock: selectedVariantStock,
    });
    toast.success(`Added ${view.title} to bag`);
  };

  const handleBuyNow = () => {
    setBuyNowItem({
      id: `${view.id}-${selectedSize ?? "none"}-${selectedColor ?? "none"}`,
      productId: view.id,
      name: view.title,
      brand: view.brand ?? "",
      price,
      imageLabel: view.title,
      imageUrl: activeImage,
      size: selectedSize,
      color: selectedColor,
      quantity,
      stock: selectedVariantStock,
    });
    router.push("/checkout?mode=buy-now");
  };

  return (
    <BeautyStorefrontLayout>
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-1.5 text-xs"
          style={{ color: COLORS.muted }}
        >
          <Link href="/" className="hover:opacity-100" style={{ opacity: 0.8 }}>
            Home
          </Link>
          <span>/</span>
          <Link
            href={
              view.categorySlug
                ? `/categories/${view.categorySlug}`
                : "/categories"
            }
            className="hover:opacity-100"
            style={{ opacity: 0.8 }}
          >
            {view.categoryName ?? "Categories"}
          </Link>
          <span>/</span>
          <span style={{ color: COLORS.ink }}>{view.title}</span>
        </nav>

        {view.isPreview && (
          <div
            className="mb-8 rounded-2xl px-5 py-4 text-sm"
            style={{
              backgroundColor: COLORS.panel,
              border: `1px solid ${COLORS.panelBorder}`,
              color: COLORS.muted,
            }}
          >
            This category doesn&rsquo;t have real inventory yet — you&rsquo;re
            looking at a preview of what this product will look like. You can
            still add it to your bag or save it, same as any other item.
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
          {/* Image column */}
          <div>
            <div
              className="overflow-hidden rounded-[24px]"
              style={{
                backgroundColor: COLORS.portraitBg,
                border: `1px solid ${COLORS.panelBorder}`,
                boxShadow:
                  "0 1px 2px rgba(34,34,34,.04), 0 16px 36px -14px rgba(34,34,34,.14)",
              }}
            >
              <ImagePlaceholder
                imageUrl={activeImage}
                label={view.title}
                aspect="3/4"
                className="w-full text-current"
              />
            </div>

            {view.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {view.images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className="h-16 w-16 flex-none overflow-hidden rounded-xl"
                    style={{
                      border: `2px solid ${
                        i === selectedImage ? COLORS.accent : COLORS.panelBorder
                      }`,
                    }}
                  >
                    <ImagePlaceholder
                      imageUrl={img}
                      label={view.title}
                      aspect="1/1"
                      className="h-full w-full text-current"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info column */}
          <div>
            {view.brand && (
              <div
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: COLORS.muted }}
              >
                {view.brand}
              </div>
            )}

            <h1
              className="mt-2 text-3xl font-semibold tracking-tight"
              style={{ color: COLORS.ink, fontFamily: "var(--font-heading)" }}
            >
              {view.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className="text-2xl font-bold"
                style={{ color: COLORS.ink }}
              >
                ${price.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span
                    className="text-sm line-through"
                    style={{ color: COLORS.muted }}
                  >
                    ${view.compareAtPrice!.toFixed(2)}
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: COLORS.accentDeep }}
                  >
                    You save ${savings.toFixed(2)}
                  </span>
                </>
              )}
              <span
                className="flex items-center gap-1.5 text-xs font-bold"
                style={{
                  color: isSelectionInStock ? COLORS.accentDeep : "#B3473D",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "currentColor" }}
                />
                {!isSelectionInStock
                  ? "Out of stock"
                  : selectedVariantStock != null
                    ? `${selectedVariantStock} in stock`
                    : "In stock"}
              </span>
            </div>

            {view.description && (
              <div
                className="prose prose-sm mt-6 max-w-none border-t pt-5"
                style={{ borderColor: COLORS.hairline, color: COLORS.muted }}
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(view.description),
                }}
              />
            )}

            {view.colors.length > 0 && (
              <div
                className="mt-6 border-t pt-5"
                style={{ borderColor: COLORS.hairline }}
              >
                <div
                  className="mb-2.5 text-xs font-bold uppercase tracking-wide"
                  style={{ color: COLORS.muted }}
                >
                  Shade
                </div>
                <div className="flex flex-wrap gap-2">
                  {view.colors.map((color) => {
                    const active = selectedColor === color.value;
                    return (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        aria-pressed={active}
                        className="h-9 rounded-full px-4 text-xs font-semibold"
                        style={{
                          border: `1px solid ${active ? COLORS.ink : COLORS.panelBorder}`,
                          backgroundColor: active ? COLORS.ink : COLORS.surface,
                          color: active ? COLORS.accentInk : COLORS.ink,
                        }}
                      >
                        {color.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {view.sizes.length > 0 && (
              <div
                className="mt-6 border-t pt-5"
                style={{ borderColor: COLORS.hairline }}
              >
                <div
                  className="mb-2.5 text-xs font-bold uppercase tracking-wide"
                  style={{ color: COLORS.muted }}
                >
                  Size
                </div>
                <div className="flex flex-wrap gap-2">
                  {view.sizes.map((size) => {
                    const active = selectedSize === size.value;
                    return (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setSelectedSize(size.value)}
                        aria-pressed={active}
                        className="h-9 rounded-full px-4 text-xs font-semibold"
                        style={{
                          border: `1px solid ${active ? COLORS.ink : COLORS.panelBorder}`,
                          backgroundColor: active ? COLORS.ink : COLORS.surface,
                          color: active ? COLORS.accentInk : COLORS.ink,
                        }}
                      >
                        {size.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5"
              style={{ borderColor: COLORS.hairline }}
            >
              <div
                className="flex items-center rounded-full"
                style={{ border: `1px solid ${COLORS.panelBorder}` }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="flex h-11 w-11 items-center justify-center disabled:opacity-40"
                  style={{ color: COLORS.ink }}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span
                  className="w-8 text-center text-sm font-semibold"
                  style={{ color: COLORS.ink }}
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) =>
                      selectedVariantStock != null
                        ? Math.min(q + 1, selectedVariantStock)
                        : q + 1,
                    )
                  }
                  disabled={
                    selectedVariantStock != null &&
                    quantity >= selectedVariantStock
                  }
                  aria-label="Increase quantity"
                  className="flex h-11 w-11 items-center justify-center disabled:opacity-40"
                  style={{ color: COLORS.ink }}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => toggleWishlist(view.id)}
                aria-pressed={isFavorite}
                aria-label={
                  isFavorite ? "Remove from wishlist" : "Add to wishlist"
                }
                className="flex h-11 w-11 flex-none items-center justify-center rounded-full"
                style={{
                  border: `1px solid ${COLORS.panelBorder}`,
                  color: isFavorite ? COLORS.accent : COLORS.muted,
                }}
              >
                <Heart
                  className="h-4 w-4"
                  fill={isFavorite ? "currentColor" : "none"}
                />
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={!isSelectionInStock}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-xs font-bold uppercase tracking-wide disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isSelectionInStock
                    ? COLORS.ink
                    : COLORS.panel,
                  color: isSelectionInStock ? COLORS.accentInk : COLORS.muted,
                }}
              >
                {isSelectionInStock ? (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Add to Bag — ${(price * quantity).toFixed(2)}
                  </>
                ) : (
                  "Currently Unavailable"
                )}
              </button>
              {!view.isPreview && (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!isSelectionInStock}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border text-xs font-bold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ borderColor: COLORS.ink, color: COLORS.ink }}
                >
                  <Zap className="h-4 w-4" />
                  Buy Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </BeautyStorefrontLayout>
  );
}

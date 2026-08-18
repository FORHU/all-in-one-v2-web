"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useProductDetail } from "@/features/storefront/hooks/queries/useProductDetail";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useWishlistStore } from "@/features/storefront/stores/wishlist.store";
import { useBuyNow } from "../hooks/useBuyNow";
import { toProductCardProduct } from "../utils/toProductCardProduct";
import { useFashionColorMode } from "../stores/colorMode.store";
import { getFashionColors, fashionFraunces, fashionInter } from "../theme";
import { ProductSpecSheet } from "../components/ProductSpecSheet";

/**
 * Fashion — product detail page (PDP). Backed by GET /v2/products/:slug
 * (features/storefront/hooks/queries/useProductDetail.ts).
 *
 * The gallery adapts to however many real images the product actually has
 * (CatalogProductMedia) rather than assuming a fixed count — today's seed
 * data only populates a single thumbnailUrl per product, so the thumbnail
 * rail is hidden whenever there's nothing to switch between.
 *
 * No auth gate here — browsing a product doesn't require sign-in. The
 * gate lives at checkout instead (see pages/CheckoutPage.tsx).
 *
 * Follows the site's light/dark toggle (unlike TrendingLookbook.tsx, which
 * is deliberately always-dark) — see ../theme.ts's getFashionColors. Gated
 * behind a mount flag since useFashionColorMode persists to localStorage,
 * unavailable during SSR (same pattern as layouts/StorefrontLayout.tsx).
 */
export function FashionProductDetailPage({
  tenantSlug,
  slug,
}: {
  tenantSlug: string;
  slug: string;
}) {
  const router = useRouter();
  const { data: product, isLoading } = useProductDetail(tenantSlug, slug);
  const addItem = useLocalCartStore((s) => s.addItem);
  const buyNow = useBuyNow();
  const colorMode = useFashionColorMode((s) => s.mode);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  const mode = hasMounted ? colorMode : "dark";
  const colors = getFashionColors(mode);
  const eyebrowStyle: React.CSSProperties = {
    color: colors.boneDim,
    letterSpacing: "1.2px",
  };

  useEffect(() => {
    if (!product) return;
    setSelectedImage(0);
    setSelectedColor(product.colors[0]?.value);
    setSelectedSize(product.sizes[0]?.value);
    setQuantity(1);
  }, [product]);

  // Clamp quantity down whenever switching to a color/size combo that has
  // less stock than the quantity currently dialed in.
  useEffect(() => {
    if (!product) return;
    const stock = product.variants.find((v) => {
      const colorMatches =
        product.colors.length === 0 || v.color === selectedColor;
      const sizeMatches = product.sizes.length === 0 || v.size === selectedSize;
      return colorMatches && sizeMatches;
    })?.stock;
    if (stock != null && stock > 0) {
      setQuantity((q) => Math.min(q, stock));
    }
  }, [product, selectedColor, selectedSize]);

  if (isLoading) {
    return (
      <FashionStorefrontLayout>
        <div className="min-h-screen" style={{ backgroundColor: colors.ink }} />
      </FashionStorefrontLayout>
    );
  }

  if (!product) {
    return (
      <FashionStorefrontLayout>
        <div
          className={fashionInter.className}
          style={{ backgroundColor: colors.ink }}
        >
          <div
            className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center"
            style={{ color: colors.bone }}
          >
            <h1
              className={fashionFraunces.className}
              style={{ fontSize: 28, fontWeight: 600 }}
            >
              Product not found
            </h1>
            <Link
              href="/products"
              className="rounded-2xl px-6 py-3 text-sm font-semibold uppercase transition-colors hover:bg-[var(--pdp-brass-hover)]"
              style={
                {
                  backgroundColor: colors.brass,
                  color: colors.ink,
                  letterSpacing: "0.6px",
                  "--pdp-brass-hover": colors.brassHover,
                } as React.CSSProperties
              }
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </FashionStorefrontLayout>
    );
  }

  const isFavorite = wishlistIds.includes(product.id);
  const price = product.price ?? 0;
  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - price) / product.compareAtPrice!) * 100,
      )
    : undefined;
  const savings = hasDiscount ? product.compareAtPrice! - price : 0;
  const selectedColorLabel = product.colors.find(
    (c) => c.value === selectedColor,
  )?.label;
  const activeImage =
    product.images[selectedImage] ?? product.thumbnailUrl ?? undefined;

  // Stock for whatever color/size combo is currently selected — falls back
  // to the product-wide inStock flag when the product has no color/size
  // variants to match against (e.g. a single-SKU product).
  const selectedVariantStock =
    product.colors.length === 0 && product.sizes.length === 0
      ? undefined
      : product.variants.find((v) => {
          const colorMatches =
            product.colors.length === 0 || v.color === selectedColor;
          const sizeMatches =
            product.sizes.length === 0 || v.size === selectedSize;
          return colorMatches && sizeMatches;
        })?.stock;
  const isSelectionInStock =
    selectedVariantStock != null ? selectedVariantStock > 0 : product.inStock;

  const handleAddToBag = () => {
    addItem({
      productId: product.id,
      name: product.title,
      brand: product.brand ?? "",
      price,
      imageLabel: product.title,
      imageUrl: activeImage,
      size: selectedSize,
      color: selectedColor,
      quantity,
      stock: selectedVariantStock,
    });
    toast.success(`Added ${product.title} to bag`);
  };

  const handleCheckout = () => {
    buyNow(toProductCardProduct(product), {
      size: selectedSize,
      color: selectedColor,
      quantity,
      stock: selectedVariantStock,
    });
  };

  const goPrevImage = () =>
    setSelectedImage(
      (i) => (i - 1 + product.images.length) % product.images.length,
    );
  const goNextImage = () =>
    setSelectedImage((i) => (i + 1) % product.images.length);

  return (
    <FashionStorefrontLayout>
      <div
        className={fashionInter.className}
        style={{ backgroundColor: colors.ink }}
      >
        <div
          className="mx-auto max-w-[1600px] px-6 py-10 xl:px-12"
          style={{ color: colors.bone }}
        >
          {/* Back button + breadcrumb, inline on one row. */}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors"
              style={{ borderColor: colors.hairline, color: colors.bone }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <nav
              className="flex items-center gap-2 text-xs"
              style={{ color: colors.boneDim }}
            >
              <Link
                href={
                  product.categorySlug
                    ? `/categories/${product.categorySlug}`
                    : "/products"
                }
                className="hover:underline"
              >
                {product.categoryName ?? "All Products"}
              </Link>
              <span>/</span>
              <span style={{ color: colors.bone }}>{product.title}</span>
            </nav>
          </div>

          <div className="mx-auto flex max-w-xl flex-col lg:max-w-none lg:grid lg:grid-cols-[420px_1fr] lg:items-start lg:gap-12">
            {/* Media column — no card frame, just the photo itself: a
                price-tag badge and wishlist toggle float directly over it,
                prev/next arrows sit outside it, and a thumbnail strip below
                lets you jump straight to a photo. */}
            <div className="lg:sticky lg:top-6 lg:min-w-0">
              <div className="mx-auto flex max-w-sm items-center gap-3 lg:mx-0">
                {product.images.length > 1 && (
                  <button
                    type="button"
                    onClick={goPrevImage}
                    aria-label="Previous image"
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-full border transition-colors"
                    style={{
                      borderColor: colors.hairline,
                      color: colors.bone,
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}

                <div className="relative min-w-0 flex-1">
                  {/* Price tag — a physical price-tag shape (tilted, with a
                      "hole" dot) rather than a plain badge. */}
                  <div
                    className="absolute -left-2 -top-2 z-10 -rotate-6 rounded-md border px-3 py-1.5 shadow-sm"
                    style={{
                      backgroundColor: colors.bone,
                      borderColor: colors.hairline,
                    }}
                  >
                    <span
                      className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full border"
                      style={{
                        borderColor: colors.hairline,
                        backgroundColor: colors.ink,
                      }}
                    />
                    <div
                      className="pl-2 text-sm font-bold"
                      style={{ color: colors.ink }}
                    >
                      ${price.toFixed(2)}
                    </div>
                    {!isSelectionInStock && (
                      <div
                        className="pl-2 text-[9px] font-bold uppercase"
                        style={{ color: colors.brick }}
                      >
                        Out of stock
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    aria-pressed={isFavorite}
                    aria-label={
                      isFavorite ? "Remove from wishlist" : "Add to wishlist"
                    }
                    className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                    style={{
                      backgroundColor: `${colors.ink}b3`,
                      color: isFavorite ? colors.brass : colors.bone,
                    }}
                  >
                    <Heart
                      className="h-4 w-4"
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                  </button>

                  <div
                    className="overflow-hidden rounded-2xl"
                    style={{ backgroundColor: colors.ink2 }}
                  >
                    <ImagePlaceholder
                      imageUrl={activeImage}
                      label={product.title}
                      aspect="3/5"
                      className="w-full"
                    />
                  </div>

                  {product.images.length > 1 && (
                    <div
                      className="absolute bottom-3 left-3 rounded-md px-2 py-1 text-[10px] italic"
                      style={{
                        backgroundColor: `${colors.ink}b3`,
                        color: colors.bone,
                      }}
                    >
                      Image {selectedImage + 1} of {product.images.length}
                    </div>
                  )}
                </div>

                {product.images.length > 1 && (
                  <button
                    type="button"
                    onClick={goNextImage}
                    aria-label="Next image"
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-full border transition-colors"
                    style={{
                      borderColor: colors.hairline,
                      color: colors.bone,
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="mx-auto mt-3 flex max-w-sm gap-2 overflow-x-auto [scrollbar-width:none] lg:mx-0 [&::-webkit-scrollbar]:hidden">
                  {product.images.map((img, i) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setSelectedImage(i)}
                      aria-label={`View image ${i + 1}`}
                      className="h-16 w-16 flex-none overflow-hidden rounded-lg border-2 transition-colors"
                      style={{
                        borderColor:
                          i === selectedImage ? colors.brass : colors.hairline,
                      }}
                    >
                      <ImagePlaceholder
                        imageUrl={img}
                        label={product.title}
                        aspect="1/1"
                        className="h-full w-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info column — no card frame either; sections are separated
                by hairline rules instead of borders/backgrounds. */}
            <div className="mt-8 flex flex-col lg:mt-0 lg:min-w-0">
              <div
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: colors.boneDim }}
              >
                {[product.brand, product.categoryName ?? "Shop"]
                  .filter(Boolean)
                  .join(" — ")}
                {" — REF. "}
                {product.id.slice(-6).toUpperCase()}
              </div>

              <h1
                className={fashionFraunces.className}
                style={{ fontSize: 32, fontWeight: 600, marginTop: 10 }}
              >
                {product.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span
                  className={fashionFraunces.className}
                  style={{ fontSize: 22, fontWeight: 600 }}
                >
                  ${price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span
                      className="text-sm line-through"
                      style={{ color: colors.boneDim }}
                    >
                      ${product.compareAtPrice!.toFixed(2)}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: colors.brick }}
                    >
                      You save ${savings.toFixed(2)}
                    </span>
                  </>
                )}
                <span
                  className="flex items-center gap-1.5 text-xs font-semibold"
                  style={{
                    color: isSelectionInStock ? colors.brassDim : colors.brick,
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

              {product.description && (
                <ProductSpecSheet
                  description={product.description}
                  hasMounted={hasMounted}
                  colors={colors}
                />
              )}

              {product.colors.length > 0 && (
                <div
                  className="mt-6 border-t pt-5"
                  style={{ borderColor: colors.hairline }}
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <span
                      className="text-xs font-bold uppercase"
                      style={eyebrowStyle}
                    >
                      Colour
                    </span>
                    <span className="text-xs" style={{ color: colors.boneDim }}>
                      {selectedColorLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((color) => {
                      const active = selectedColor === color.value;
                      return (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setSelectedColor(color.value)}
                          aria-label={color.label}
                          aria-pressed={active}
                          className="relative h-8 w-8 rounded-full border"
                          style={{
                            backgroundColor: color.swatchColor ?? "#999999",
                            borderColor: colors.hairline,
                          }}
                        >
                          {active && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span
                                className="flex h-4 w-4 items-center justify-center rounded-full"
                                style={{ backgroundColor: colors.bone }}
                              >
                                <Check
                                  className="h-2.5 w-2.5"
                                  style={{ color: colors.ink }}
                                  strokeWidth={3}
                                />
                              </span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size selector — rectangular, with a diagonal hatch fill
                  and "SOLD OUT" label for unavailable sizes, instead of a
                  separate caption underneath each. */}
              {product.sizes.length > 0 && (
                <div
                  className="mt-6 border-t pt-5"
                  style={{ borderColor: colors.hairline }}
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <span
                      className="text-xs font-bold uppercase"
                      style={eyebrowStyle}
                    >
                      Size
                    </span>
                    <span
                      className="text-xs underline"
                      style={{ color: colors.boneDim }}
                    >
                      Size Guide
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {product.sizes.map((size) => {
                      const active = selectedSize === size.value;
                      const stock =
                        product.colors.length === 0
                          ? product.variants.find((v) => v.size === size.value)
                              ?.stock
                          : product.variants.find(
                              (v) =>
                                v.color === selectedColor &&
                                v.size === size.value,
                            )?.stock;
                      const soldOut = stock != null && stock <= 0;
                      return (
                        <button
                          key={size.value}
                          type="button"
                          onClick={() =>
                            !soldOut && setSelectedSize(size.value)
                          }
                          disabled={soldOut}
                          aria-pressed={active}
                          aria-label={size.label}
                          className="relative flex h-14 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-lg border text-xs font-bold uppercase disabled:cursor-not-allowed"
                          style={{
                            borderColor:
                              !soldOut && active
                                ? colors.brass
                                : colors.hairline,
                            backgroundColor:
                              !soldOut && active
                                ? `${colors.brass}1f`
                                : "transparent",
                          }}
                        >
                          {soldOut && (
                            <span
                              className="pointer-events-none absolute inset-0"
                              style={{
                                backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 4px, ${colors.hairline} 4px, ${colors.hairline} 5px)`,
                              }}
                            />
                          )}
                          <span
                            className="relative"
                            style={{
                              color: soldOut ? colors.boneDim : colors.bone,
                            }}
                          >
                            {size.value.toUpperCase()}
                          </span>
                          {soldOut && (
                            <span
                              className="relative text-[8px] font-semibold"
                              style={{ color: colors.boneDim }}
                            >
                              Sold out
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div
                className="mt-6 flex flex-col gap-3 border-t pt-5"
                style={{ borderColor: colors.hairline }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex flex-none items-center rounded-full border"
                    style={{ borderColor: colors.hairline }}
                  >
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className="flex h-11 w-11 items-center justify-center disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
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
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToBag}
                  disabled={!isSelectionInStock}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: isSelectionInStock
                      ? colors.brass
                      : colors.hairline,
                    color: isSelectionInStock ? colors.ink : colors.boneDim,
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
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!isSelectionInStock}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full border text-sm font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ borderColor: colors.brass, color: colors.brass }}
                >
                  <CreditCard className="h-4 w-4" />
                  Checkout
                </button>
              </div>

              <div
                className="mt-5 flex items-center gap-6 border-t pt-4 text-xs"
                style={{
                  borderColor: colors.hairline,
                  color: colors.boneDim,
                }}
              >
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Free Shipping Over $75
                </span>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Easy 30-Day Returns
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FashionStorefrontLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useProductDetail } from "@/features/storefront/hooks/queries/useProductDetail";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useBuyNow } from "../hooks/useBuyNow";
import { toProductCardProduct } from "../utils/toProductCardProduct";
import { useFashionColorMode } from "../stores/colorMode.store";
import { getFashionColors, fashionFraunces, fashionInter } from "../theme";

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

  return (
    <FashionStorefrontLayout>
      <div
        className={fashionInter.className}
        style={{ backgroundColor: colors.ink }}
      >
        <div
          className="mx-auto max-w-6xl px-6 py-10"
          style={{ color: colors.bone }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-[var(--pdp-bone)]"
            style={
              {
                color: colors.boneDim,
                "--pdp-bone": colors.bone,
              } as React.CSSProperties
            }
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <nav
            className="mb-6 flex items-center gap-2 text-xs"
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

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[380px_1fr]">
            <div className="flex gap-3">
              {product.images.length > 1 && (
                <div className="flex flex-col gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setSelectedImage(i)}
                      aria-label={`View image ${i + 1}`}
                      className="overflow-hidden rounded-lg border-2 transition-colors"
                      style={{
                        borderColor:
                          i === selectedImage ? colors.brass : colors.hairline,
                      }}
                    >
                      <ImagePlaceholder
                        imageUrl={img}
                        label={product.title}
                        aspect="1/1"
                        className="h-20 w-20"
                      />
                    </button>
                  ))}
                </div>
              )}
              <div className="relative flex-1">
                {hasDiscount && (
                  <span
                    className="absolute left-3 top-3 z-10 rounded-md px-2.5 py-1 text-xs font-bold"
                    style={{
                      backgroundColor: colors.brick,
                      color: colors.bone,
                    }}
                  >
                    -{discountPercent}%
                  </span>
                )}
                <ImagePlaceholder
                  imageUrl={activeImage}
                  label={product.title}
                  aspect="3/4"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <div
                className="flex items-center gap-2 text-xs font-bold uppercase"
                style={{ color: colors.brassDim }}
              >
                {product.brand}
                <span
                  className="h-1 w-1 flex-none rounded-full"
                  style={{ backgroundColor: colors.hairline }}
                />
                <span
                  className="normal-case"
                  style={{
                    fontWeight: 500,
                    color: isSelectionInStock ? colors.boneDim : colors.brick,
                  }}
                >
                  {!isSelectionInStock
                    ? "Out of stock"
                    : selectedVariantStock != null
                      ? `${selectedVariantStock} in stock — ships in 1–2 days`
                      : "In stock — ships in 1–2 days"}
                </span>
              </div>

              <h1
                className={fashionFraunces.className}
                style={{ fontSize: 34, fontWeight: 600, marginTop: 6 }}
              >
                {product.title}
              </h1>

              <div className="mt-2 flex items-center gap-2">
                <div
                  className="flex"
                  aria-hidden="true"
                  style={{ color: colors.boneDim }}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5"
                      fill={
                        i < Math.round(product.rating) ? "currentColor" : "none"
                      }
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <span
                  className="text-xs underline"
                  style={{ color: colors.boneDim }}
                >
                  {product.reviewCount > 0
                    ? `(${product.reviewCount})`
                    : "(0 — be the first to review)"}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span
                  className={fashionFraunces.className}
                  style={{ fontSize: 28, fontWeight: 600 }}
                >
                  ${price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span
                      className="text-base line-through"
                      style={{ color: colors.boneDim }}
                    >
                      ${product.compareAtPrice!.toFixed(2)}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: colors.brick }}
                    >
                      You save ${savings.toFixed(2)}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-1 text-xs" style={{ color: colors.boneDim }}>
                Tax included. Shipping calculated at checkout.
              </p>

              {product.description && (
                <p
                  className="mt-5 text-sm leading-relaxed"
                  style={{ color: colors.boneDim }}
                >
                  {product.description}
                </p>
              )}

              {product.colors.length > 0 && (
                <div className="mt-6">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span
                      className="text-xs font-bold uppercase"
                      style={eyebrowStyle}
                    >
                      Color
                    </span>
                    <span className="text-xs" style={{ color: colors.boneDim }}>
                      {selectedColorLabel}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        aria-label={color.label}
                        aria-pressed={selectedColor === color.value}
                        className="h-8 w-8 rounded-full border-2"
                        style={{
                          backgroundColor: color.swatchColor ?? "#999999",
                          borderColor:
                            selectedColor === color.value
                              ? colors.brass
                              : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.sizes.length > 0 && (
                <div className="mt-6">
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
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      const active = selectedSize === size.value;
                      return (
                        <button
                          key={size.value}
                          type="button"
                          onClick={() => setSelectedSize(size.value)}
                          aria-pressed={active}
                          className="h-10 min-w-10 rounded-lg border px-3 text-sm font-semibold"
                          style={{
                            borderColor: active
                              ? colors.brass
                              : colors.hairline,
                            backgroundColor: active
                              ? colors.brass
                              : colors.ink2,
                            color: active ? colors.ink : colors.bone,
                          }}
                        >
                          {size.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-7 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex flex-none items-center rounded-lg border"
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

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddToBag}
                    disabled={!isSelectionInStock}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors hover:bg-[var(--pdp-brass-hover)] disabled:opacity-40"
                    style={
                      {
                        backgroundColor: colors.brass,
                        color: colors.ink,
                        "--pdp-brass-hover": colors.brassHover,
                      } as React.CSSProperties
                    }
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Add to Bag — ${(price * quantity).toFixed(2)}
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={!isSelectionInStock}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-bold transition-colors hover:bg-[var(--pdp-ink2)] disabled:opacity-40"
                    style={
                      {
                        borderColor: colors.brass,
                        color: colors.brass,
                        "--pdp-ink2": colors.ink2,
                      } as React.CSSProperties
                    }
                  >
                    <CreditCard className="h-4 w-4" />
                    Checkout
                  </button>
                </div>
              </div>

              <div
                className="mt-6 flex items-center gap-6 border-t pt-5 text-xs"
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

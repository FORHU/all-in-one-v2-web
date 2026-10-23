"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useProductDetail } from "@/features/storefront/hooks/queries/useProductDetail";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import type { Product } from "@/features/storefront/contracts/products.contract";
import {
  ImagePlaceholder,
  isAllowedImageHost,
} from "@/shared/components/ImagePlaceholder";
import { electronicsConfig } from "../tenant.config";
import { OptionGroup } from "./OptionGroup";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";

/** Upper bound when a product has no per-variant stock number to cap at. */
const MAX_QUANTITY_WITHOUT_STOCK = 99;
/** At or below this, show "Only N left" instead of a plain "In stock". */
const LOW_STOCK_THRESHOLD = 10;

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

/**
 * DigitFriend — the grid cards' "Add" flow: asks for the variant (when the
 * product has options) and the quantity before anything reaches the cart.
 *
 * Loads the product's detail (useProductDetail — same query/cache the PDP
 * uses) because the listing shape has no per-variant price/stock. That also
 * matters for correctness: checkout resolves a cart line to a variant by its
 * color/size, and a line with neither matches an arbitrary variant, so the
 * old one-tap quick-add could buy a different color than the shopper saw.
 * Variant chips, price and the stock cap therefore follow the selected
 * variant exactly like ProductDetailPage.tsx's own picker.
 *
 * Rendered through a portal so the cards' overflow-hidden can't clip it;
 * Escape / backdrop click close it, and page scroll is locked while open.
 */
export function QuickAddDialog({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const router = useRouter();
  const titleId = useId();
  const addItem = useLocalCartStore((s) => s.addItem);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const { data: detail, isLoading } = useProductDetail(
    electronicsConfig.slug,
    product.slug,
  );

  const colors = detail?.colors ?? [];
  const sizes = detail?.sizes ?? [];
  const variants = useMemo(() => detail?.variants ?? [], [detail]);
  const hasOptions = colors.length > 0 || sizes.length > 0;

  const [selectedColor, setSelectedColor] = useState<string>();
  const [selectedSize, setSelectedSize] = useState<string>();
  const [quantity, setQuantity] = useState(1);

  // Pre-select the first in-stock variant once the detail arrives, so the
  // dialog never opens on a struck-through option.
  useEffect(() => {
    if (!detail) return;
    const firstInStock = detail.variants.find((v) => v.stock > 0);
    setSelectedColor(firstInStock?.color ?? detail.colors[0]?.value);
    setSelectedSize(firstInStock?.size ?? detail.sizes[0]?.value);
  }, [detail]);

  const selectedVariant = variants.find(
    (v) =>
      (colors.length === 0 || v.color === selectedColor) &&
      (sizes.length === 0 || v.size === selectedSize),
  );
  const price =
    selectedVariant?.price ??
    detail?.salePrice ??
    detail?.price ??
    product.salePrice ??
    product.price ??
    0;
  const stock = hasOptions ? selectedVariant?.stock : undefined;
  const inStock = stock != null ? stock > 0 : product.inStock;
  const maxQuantity = stock ?? MAX_QUANTITY_WITHOUT_STOCK;

  // Keep the quantity within what the selected variant actually has.
  useEffect(() => {
    if (stock != null && stock > 0) setQuantity((q) => Math.min(q, stock));
  }, [stock]);

  const imageUrl = useMemo(() => {
    const fromDetail = detail?.images.find((url) => isAllowedImageHost(url));
    return fromDetail ?? product.thumbnailUrl;
  }, [detail, product.thumbnailUrl]);

  // Escape closes; lock background scroll; focus the primary action. Reads
  // onClose through a ref so a parent re-render (new callback identity)
  // doesn't re-run this and yank focus back mid-interaction.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const setClampedQuantity = (next: number) =>
    setQuantity(Math.min(Math.max(1, Math.floor(next) || 1), maxQuantity));

  const handleConfirm = () => {
    addItem({
      productId: product.id,
      name: product.title,
      brand: product.brand ?? "",
      price,
      imageLabel: product.title,
      imageUrl,
      color: selectedColor,
      size: selectedSize,
      quantity,
      stock,
    });
    toast.success(`Added ${quantity} × ${product.title} to cart`, {
      action: { label: "View cart", onClick: () => router.push("/cart") },
    });
    onClose();
  };

  const variantLabel = [selectedColor, selectedSize]
    .filter(Boolean)
    .join(" · ");

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      style={{
        backgroundColor: "rgba(15,17,21,0.55)",
        fontFamily: "var(--font-body)",
        color: COLORS.ink,
      }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-t-[24px] sm:max-w-md sm:rounded-[24px]"
        style={{ backgroundColor: COLORS.cardBg }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: COLORS.bg }}
        >
          <X size={18} />
        </button>

        {/* Product */}
        <div
          className="flex gap-4 p-5 pr-14"
          style={{ borderBottom: `1px solid ${COLORS.border}` }}
        >
          <ImagePlaceholder
            imageUrl={imageUrl}
            label={product.title}
            aspect="1/1"
            className="h-20 w-20 flex-none overflow-hidden rounded-2xl text-[10px]"
          />
          <div className="flex min-w-0 flex-col justify-center gap-1">
            <h2
              id={titleId}
              className="m-0 line-clamp-2 text-base font-bold leading-snug"
            >
              {product.title}
            </h2>
            <div className="flex items-baseline gap-2">
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {money(price)}
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: inStock ? COLORS.success : COLORS.muted }}
              >
                {/* CJ stock runs to the thousands — only a low count is
                    worth spelling out. */}
                {inStock
                  ? stock != null && stock <= LOW_STOCK_THRESHOLD
                    ? `Only ${stock} left`
                    : "In stock"
                  : "Out of stock"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Variant */}
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <div
                className="h-3 w-24 animate-pulse rounded"
                style={{ backgroundColor: COLORS.border }}
              />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-20 animate-pulse rounded-full"
                    style={{ backgroundColor: COLORS.border }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              {colors.length > 0 && (
                <OptionGroup
                  label={colors.length > 1 ? "Choose a variant" : "Variant"}
                  options={colors}
                  selected={selectedColor}
                  onSelect={setSelectedColor}
                  isAvailable={(value) =>
                    variants.some((v) => v.color === value && v.stock > 0)
                  }
                />
              )}
              {sizes.length > 0 && (
                <OptionGroup
                  label="Size"
                  options={sizes}
                  selected={selectedSize}
                  onSelect={setSelectedSize}
                  isAvailable={(value) =>
                    variants.some((v) => v.size === value && v.stock > 0)
                  }
                />
              )}
            </>
          )}

          {/* Quantity */}
          <div className="flex flex-col gap-2">
            <span
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: COLORS.muted, fontFamily: "var(--font-mono)" }}
            >
              Quantity
            </span>
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 items-center rounded-xl"
                style={{ border: `1px solid ${COLORS.borderStrong}` }}
              >
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setClampedQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                  className="flex h-12 w-12 items-center justify-center disabled:opacity-30"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={maxQuantity}
                  value={quantity}
                  aria-label="Quantity"
                  onChange={(e) => setClampedQuantity(Number(e.target.value))}
                  className="h-12 w-12 bg-transparent text-center text-base font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setClampedQuantity(quantity + 1)}
                  disabled={quantity >= maxQuantity}
                  className="flex h-12 w-12 items-center justify-center disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>
              {variantLabel && (
                <span
                  className="min-w-0 truncate text-sm"
                  style={{ color: COLORS.muted }}
                >
                  {variantLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          className="mt-auto flex flex-col gap-2 p-5 pt-0"
          style={{ backgroundColor: COLORS.cardBg }}
        >
          <button
            ref={confirmRef}
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || !inStock}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: COLORS.ink }}
          >
            <ShoppingCart size={18} />
            {inStock
              ? `Add to cart · ${money(price * quantity)}`
              : "Out of stock"}
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="py-1 text-center text-sm font-semibold underline"
            style={{ color: COLORS.muted }}
          >
            View full details
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}

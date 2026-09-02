"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { fashionCategories } from "../data/categories";
import { useFashionColorMode } from "../stores/colorMode.store";
import { getFashionWardrobePanelBackgroundImage } from "../theme";

/**
 * Fashion — full category listing page.
 * Same static data as components/CategoryGrid.tsx (see
 * tenants/fashion/data/categories.ts) until useCategories() is real.
 */
export function FashionCategoriesPage() {
  const colorMode = useFashionColorMode((s) => s.mode);
  // useFashionColorMode persists to localStorage, unavailable during SSR —
  // gate behind a mount flag so the server-rendered first paint doesn't
  // depend on it (same pattern as CheckoutPage.tsx/HeroBanner.tsx).
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  const mode = hasMounted ? colorMode : "dark";

  return (
    <FashionStorefrontLayout>
      {/* Same pinstripe wardrobe-panel texture the homepage's "Get the
          Look"/"Shop by Season" sections use (see theme.ts), so this page
          reads as part of the same design rather than a plainer, untextured
          page underneath. */}
      <section
        className="mx-auto max-w-7xl px-6 py-16"
        style={{
          color: "var(--brand-primary)",
          backgroundImage: getFashionWardrobePanelBackgroundImage(mode),
        }}
      >
        <h1
          className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          All Categories
        </h1>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {fashionCategories.map(({ slug, label, count }) => (
            <Link
              key={slug}
              href={`/categories/${slug}`}
              className="group flex flex-col gap-3.5"
            >
              <ImagePlaceholder
                label={`Category: ${label}`}
                aspect="3/4"
                className="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
              />
              <div>
                <div className="text-[15px] font-bold">{label}</div>
                <div className="mt-0.5 text-xs opacity-60">{count} items</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </FashionStorefrontLayout>
  );
}

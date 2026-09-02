"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useCollections } from "@/features/storefront/hooks/queries/useCollections";
import { type Look } from "../data/looks";
import { toLook } from "../utils/toLook";
import { OutfitLookRail } from "./OutfitLookRail";
import { useFashionColorMode } from "../stores/colorMode.store";
import {
  fashionDidone,
  fashionInter,
  fashionScript,
  getFashionMoodColors,
  getFashionWardrobePanelBackgroundImage,
} from "../theme";

/**
 * Fashion — "Get the Look" moodboard content: bold headline + script accent,
 * tracked subtitle, then the outfit rail (see components/OutfitLookRail.tsx
 * for the tile strip + "Complete the Look" detail overlay), closing with an
 * italic tagline band. Backed by the same GET /v2/collections data (via
 * useCollections + toLook) as TrendingLookbook, scoped to type=OUTFIT — the
 * endpoint already excludes isDeleted rows (unconditionally, see
 * collection.repository.ts's findAllRoot), but returns every active
 * CollectionType (OUTFIT/BUNDLE/LOOKBOOK) when type is omitted, and a BUNDLE
 * like "Comfort" isn't an outfit a customer can wear, so it doesn't belong
 * on this page. Only "bare" outfits show here — a non-null metadata (e.g.
 * { season: "SUMMER" }) marks a collection as a seasonal pick, which
 * belongs on the homepage's Shop by Season rail (components/ShopBySeason.tsx)
 * instead, not duplicated here.
 *
 * Shared, not duplicated, between pages/GetTheLookPage.tsx (the standalone
 * /get-the-look route) and components/HeroBanner.tsx (the homepage section)
 * — both surfaces show the exact same content.
 *
 * Requires a real collection-level `imageUrl` (a composed outfit photo).
 * Without one, toLook() falls back to the first item's own product photo —
 * a single garment, not an outfit — which is indistinguishable from "just a
 * top" once rendered, so such a collection is excluded rather than shown
 * mislabeled as a full look.
 */
export function FashionGetTheLookMoodboard({
  tenantSlug,
}: {
  tenantSlug: string;
}) {
  const colorMode = useFashionColorMode((s) => s.mode);
  // useFashionColorMode persists to localStorage, unavailable during SSR —
  // gate behind a mount flag so the server-rendered first paint doesn't
  // depend on it (same pattern as CheckoutPage.tsx/HeroBanner.tsx).
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  const mode = hasMounted ? colorMode : "dark";
  const colors = getFashionMoodColors(mode);

  // limit=100 (the backend's max) — this page needs every OUTFIT collection
  // to filter client-side by metadata; the default page size (20) would
  // silently drop rows past the first page, whether or not they're bare.
  const { data: collections, isLoading } = useCollections(
    tenantSlug,
    "OUTFIT",
    undefined,
    100,
  );
  const looks: Look[] = (collections ?? [])
    .filter(
      (collection) =>
        collection.items.length > 0 &&
        collection.metadata === null &&
        collection.imageUrl !== null,
    )
    .map(toLook);

  // Still loading — nothing to show yet either way, so stay hidden rather
  // than flash an empty state before the real data (or lack of it) arrives.
  if (isLoading) {
    return null;
  }

  return (
    <section
      className="pb-6 pt-4 sm:pb-10 sm:pt-6"
      style={{
        backgroundColor: colors.cream,
        backgroundImage: getFashionWardrobePanelBackgroundImage(mode),
      }}
    >
      {/* Deliberately wider than the max-w-7xl rail directly below (was
          matched 1:1 before) — the outfit hero images need the extra width
          to read as "bigger", so this section no longer edge-aligns with
          the rail underneath it. */}
      <div
        className={`mx-auto max-w-[86rem] rounded-[28px] px-4 ${fashionDidone.variable} ${fashionInter.variable} ${fashionScript.variable}`}
      >
        {/* Header — stacked serif headline + script accent underneath (not
            side by side), both in the same dark ink rather than an accent
            color, then a soft neutral band subtitle with hairline rules —
            monochrome editorial, not a green accent moment. */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex flex-col items-center gap-1">
            <span
              className="text-4xl uppercase tracking-[0.15em] sm:text-6xl"
              style={{
                color: colors.ink,
                fontWeight: 400,
                fontFamily: fashionDidone.style.fontFamily,
              }}
            >
              Minimal
            </span>
            <span
              className="flex items-center gap-2 text-4xl sm:text-6xl"
              style={{
                color: colors.ink,
                fontFamily: fashionScript.style.fontFamily,
              }}
            >
              Wardrobe Inspo
              <Heart
                className="h-6 w-6 sm:h-8 sm:w-8"
                style={{ color: colors.ink }}
              />
            </span>
          </div>
          {/* Flanking hairlines instead of a filled band — reads as a
              slim editorial rule under the headline rather than a boxed
              banner competing with it. */}
          <div className="flex w-full max-w-xl items-center gap-4 sm:gap-6">
            <span
              className="h-px flex-1"
              style={{ backgroundColor: colors.border }}
            />
            <p
              className="flex-none text-center text-xs font-normal uppercase tracking-[0.15em] sm:whitespace-nowrap sm:tracking-[0.3em] sm:text-sm"
              style={{ color: colors.textMuted }}
            >
              Simple. Timeless. Always Stylish.
            </p>
            <span
              className="h-px flex-1"
              style={{ backgroundColor: colors.border }}
            />
          </div>
        </div>

        {looks.length === 0 ? (
          <p
            className="py-10 text-center text-sm"
            style={{ color: colors.textMuted }}
          >
            No product available
          </p>
        ) : (
          <>
            <div className="mt-6">
              <OutfitLookRail
                looks={looks}
                colors={colors}
                desktopColumns={8}
                naturalImages
              />
            </div>

            <div
              className="mt-14 w-full py-3"
              style={{ backgroundColor: colors.band }}
            >
              <p
                className="text-center text-xs font-semibold italic tracking-wide sm:text-sm"
                style={{ color: colors.ink }}
              >
                &ldquo;Less clutter, more style.&rdquo; &#9825;
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

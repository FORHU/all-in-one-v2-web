"use client";

import { useEffect, useState } from "react";
import { useCollections } from "@/features/storefront/hooks/queries/useCollections";
import { type Look } from "../data/looks";
import { toLook } from "../utils/toLook";
import { OutfitLookRail } from "./OutfitLookRail";
import { useFashionColorMode } from "../stores/colorMode.store";
import {
  fashionInter,
  getFashionMoodColors,
  getFashionWardrobePanelBackgroundImage,
} from "../theme";

const SEASONS = [
  { key: "SPRING", label: "Spring" },
  { key: "SUMMER", label: "Summer" },
  { key: "FALL", label: "Fall" },
  { key: "WINTER", label: "Winter" },
] as const;

function seasonOf(metadata: Record<string, unknown> | null): string | null {
  const raw = metadata?.season;
  return typeof raw === "string" ? raw.toUpperCase() : null;
}

/**
 * Fashion — homepage "Shop by Season" rail, replacing the old
 * Trending/New Arrivals sections. Shows the actual OUTFIT collections
 * tagged with each season (CatalogCollection.metadata.season) as curated
 * looks — not a single representative product per season — grouped into
 * one labeled row per season. Reuses OutfitLookRail (see
 * components/OutfitLookRail.tsx), the same tile strip + "Complete the
 * Look" detail overlay as the standalone "Get the Look" page, one
 * instance per season so each row's prev/next cycles only through that
 * season's own outfits. Adopts OutfitLookRail's cream/sage editorial
 * palette (rather than the site's var(--brand-primary) system) since
 * that's the palette its tiles/overlay are built against — but resolved
 * via getFashionMoodColors(mode) against the site's light/dark toggle, not
 * a fixed cream regardless of mode. A season with no tagged outfits
 * doesn't render a row at all.
 *
 * Requires a real collection-level `imageUrl` (a composed outfit photo) —
 * same reasoning as GetTheLookMoodboard: without one, toLook() falls back
 * to a single item's own product photo, which reads as "just a top", not
 * an outfit.
 */
export function ShopBySeason({ tenantSlug }: { tenantSlug: string }) {
  const colorMode = useFashionColorMode((s) => s.mode);
  // useFashionColorMode persists to localStorage, unavailable during SSR —
  // gate behind a mount flag so the server-rendered first paint doesn't
  // depend on it (same pattern as CheckoutPage.tsx/HeroBanner.tsx).
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  const mode = hasMounted ? colorMode : "dark";
  const colors = getFashionMoodColors(mode);

  // limit=100 (the backend's max) — every season group is derived from the
  // full OUTFIT set client-side; the default page size (20) would silently
  // drop rows past the first page before they ever reach this filter.
  const { data: collections, isLoading } = useCollections(
    tenantSlug,
    "OUTFIT",
    undefined,
    100,
  );

  if (isLoading) return null;

  const seasonGroups = SEASONS.map(({ key, label }) => ({
    key,
    label,
    looks: (collections ?? [])
      .filter(
        (collection) =>
          collection.items.length > 0 &&
          collection.imageUrl !== null &&
          seasonOf(collection.metadata) === key,
      )
      .map(toLook) as Look[],
  })).filter((group) => group.looks.length > 0);

  if (seasonGroups.length === 0) return null;

  return (
    <section
      style={{
        backgroundColor: colors.cream,
        backgroundImage: getFashionWardrobePanelBackgroundImage(mode),
      }}
    >
      <div className={`mx-auto max-w-7xl px-6 py-16 ${fashionInter.variable}`}>
        <div className="mb-10">
          <h2
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{
              color: colors.ink,
              fontFamily: fashionInter.style.fontFamily,
            }}
          >
            Shop by Season
          </h2>
          <div
            className="mt-3 h-0.5 w-10"
            style={{ backgroundColor: colors.sageDark }}
          />
        </div>

        <div className="flex flex-col gap-12">
          {seasonGroups.map(({ key, label, looks }) => (
            <div key={key}>
              <h3
                className="mb-4 text-sm font-bold uppercase tracking-[0.2em]"
                style={{
                  color: colors.sageDark,
                  fontFamily: fashionInter.style.fontFamily,
                }}
              >
                {label}
              </h3>
              <OutfitLookRail looks={looks} colors={colors} naturalImages />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

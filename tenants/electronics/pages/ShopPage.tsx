"use client";

import { useSearchParams } from "next/navigation";
import { ElectronicsStorefrontLayout } from "../layouts/StorefrontLayout";
import { ShopSection } from "../components/ShopSection";
import { TrustBadges } from "../components/TrustBadges";

/**
 * DigitFriend — /shop, the header's "Shop" link. The same filterable
 * ShopSection the home page opens on, minus the newsletter, with the
 * category pre-selected from ?category=<slug> (the footer's category links)
 * and the header search's full results from ?q=<text>.
 */
export function ElectronicsShopPage({ tenantSlug }: { tenantSlug: string }) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "all";
  const q = searchParams.get("q") ?? "";

  return (
    <ElectronicsStorefrontLayout>
      {/* keyed so a new search or footer category link re-seeds the filters */}
      <ShopSection
        key={`${category}|${q}`}
        tenantSlug={tenantSlug}
        initialCategory={category}
        searchQuery={q}
      />
      <TrustBadges />
    </ElectronicsStorefrontLayout>
  );
}

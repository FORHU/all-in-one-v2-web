import { ElectronicsStorefrontLayout } from "../layouts/StorefrontLayout";
import { ShopSection } from "../components/ShopSection";
import { TrustBadges } from "../components/TrustBadges";
import { Newsletter } from "../components/Newsletter";

/**
 * DigitFriend — storefront home page, matching the "digitfriend ui.html"
 * design reference: no separate hero — the page opens directly on the
 * filterable shop grid, followed by value props and a newsletter signup.
 * Replaces the earlier hero + CategoryGrid + bento FeaturedProducts
 * composition (components/HeroBanner.tsx, CategoryGrid.tsx,
 * FeaturedProducts.tsx — now deleted, superseded by ShopSection.tsx).
 */
export function ElectronicsHomePage({ tenantSlug }: { tenantSlug: string }) {
  return (
    <ElectronicsStorefrontLayout>
      <ShopSection tenantSlug={tenantSlug} />
      <TrustBadges />
      <Newsletter />
    </ElectronicsStorefrontLayout>
  );
}

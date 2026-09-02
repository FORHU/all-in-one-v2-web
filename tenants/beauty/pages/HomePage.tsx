import { BeautyStorefrontLayout } from "../layouts/StorefrontLayout";
import { MirrorShelfHero } from "../components/MirrorShelfHero";

/**
 * Beauty — storefront home page presentation ("Mirror Shelf" design).
 * Rendered by src/app/page.tsx once tenant routing resolves this slug —
 * needs `tenantSlug` since MirrorShelfHero fetches real category data,
 * same reason fashion's home page is special-cased there.
 * components/CategoryGrid.tsx, components/FeaturedProducts.tsx, and
 * components/TrustBadges.tsx are earlier, unused scaffolding superseded by
 * MirrorShelfHero — left in place rather than deleted, in case any of
 * their static content is useful reference later.
 */
export function BeautyHomePage({ tenantSlug }: { tenantSlug: string }) {
  return (
    <BeautyStorefrontLayout>
      <MirrorShelfHero tenantSlug={tenantSlug} />
    </BeautyStorefrontLayout>
  );
}

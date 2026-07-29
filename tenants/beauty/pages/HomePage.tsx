import { BeautyStorefrontLayout } from "../layouts/StorefrontLayout";
import { HeroBanner } from "../components/HeroBanner";

/**
 * Beauty — storefront home page presentation.
 * Rendered by src/app/page.tsx once tenant routing resolves this slug.
 * Consumes shared hooks (features/storefront, features/cms) — no
 * data-fetching or business logic of its own.
 * Kept intentionally minimal (hero only) for now — components/CategoryGrid.tsx,
 * components/FeaturedProducts.tsx, and components/TrustBadges.tsx exist and
 * are ready to compose back in once the storefront moves past this initial
 * landing page.
 */
export function BeautyHomePage() {
  return (
    <BeautyStorefrontLayout>
      <HeroBanner />
    </BeautyStorefrontLayout>
  );
}

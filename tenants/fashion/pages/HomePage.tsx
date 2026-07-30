import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { HeroBanner } from "../components/HeroBanner";
import { CategoryGrid } from "../components/CategoryGrid";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { TrendingCollection } from "../components/TrendingCollection";
import { BestSellers } from "../components/BestSellers";
import { BrandMarquee } from "../components/BrandMarquee";

/**
 * Fashion — storefront home page presentation.
 * Rendered by src/app/page.tsx once tenant routing resolves this slug.
 * Consumes shared hooks (features/storefront, features/cms) — no
 * data-fetching or business logic of its own.
 *
 * Built from the design reference at tenants/fashion/Homepage.dc.html.
 * Sections intentionally NOT included yet, pending backend/content
 * decisions (see components/ for none of these exist as stubs — they were
 * never scaffolded, unlike the sections above):
 *  - Flash Sale countdown — no promotion end-date field exists on the
 *    backend (PricingRule doesn't cover this); needs a real data source
 *    before a countdown can be trustworthy.
 *  - Testimonials — schema has ProductReview, but the design's curated
 *    3-quote format reads more like CMS content (features/cms, currently
 *    stubbed) than a raw review feed. Needs a decision on which.
 *  - Instagram Gallery — no Instagram Graph API integration anywhere in
 *    the stack; needs either a real integration or a CMS-managed image set.
 *  - Newsletter signup — no email-capture endpoint exists on the API yet.
 * TrustBadges.tsx also exists but is still unused pending placement.
 */
export function FashionHomePage() {
  return (
    <FashionStorefrontLayout>
      <HeroBanner />
      <CategoryGrid />
      <FeaturedProducts />
      <TrendingCollection />
      <BestSellers />
      <BrandMarquee />
    </FashionStorefrontLayout>
  );
}

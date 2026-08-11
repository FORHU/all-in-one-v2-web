import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { HeroBanner } from "../components/HeroBanner";
import { CategoryGrid } from "../components/CategoryGrid";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { TrendingCollection } from "../components/TrendingCollection";
import { BestSellers } from "../components/BestSellers";
import { BrandMarquee } from "../components/BrandMarquee";

export function FashionHomePage({ tenantSlug }: { tenantSlug: string }) {
  return (
    <FashionStorefrontLayout>
      <HeroBanner tenantSlug={tenantSlug} />
      <CategoryGrid />
      <FeaturedProducts />
      <TrendingCollection />
      <BestSellers />
      <BrandMarquee />
    </FashionStorefrontLayout>
  );
}

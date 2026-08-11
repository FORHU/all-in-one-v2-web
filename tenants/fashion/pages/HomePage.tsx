import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { HeroBanner } from "../components/HeroBanner";
import { Trending } from "../components/Trending";
import { FeaturedProducts } from "../components/FeaturedProducts";

export function FashionHomePage({ tenantSlug }: { tenantSlug: string }) {
  return (
    <FashionStorefrontLayout>
      <HeroBanner tenantSlug={tenantSlug} />
      <Trending tenantSlug={tenantSlug} />
      <FeaturedProducts tenantSlug={tenantSlug} />
    </FashionStorefrontLayout>
  );
}

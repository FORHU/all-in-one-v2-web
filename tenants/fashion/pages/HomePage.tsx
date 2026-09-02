import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { HeroBanner } from "../components/HeroBanner";
import { ShopBySeason } from "../components/ShopBySeason";

export function FashionHomePage({ tenantSlug }: { tenantSlug: string }) {
  return (
    <FashionStorefrontLayout>
      <HeroBanner tenantSlug={tenantSlug} />
      <ShopBySeason tenantSlug={tenantSlug} />
    </FashionStorefrontLayout>
  );
}

import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { FashionGetTheLookMoodboard } from "../components/GetTheLookMoodboard";

/**
 * Fashion — "Get the Look" landing page (/get-the-look). Thin route wrapper
 * around components/GetTheLookMoodboard.tsx, which is the actual content —
 * shared verbatim with the homepage's "Get the Look" section
 * (components/HeroBanner.tsx) so both surfaces show the same moodboard
 * rather than a full page vs. a condensed teaser of it.
 */
export function FashionGetTheLookPage({ tenantSlug }: { tenantSlug: string }) {
  return (
    <FashionStorefrontLayout>
      <FashionGetTheLookMoodboard tenantSlug={tenantSlug} />
    </FashionStorefrontLayout>
  );
}

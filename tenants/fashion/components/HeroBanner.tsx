import { FashionGetTheLookMoodboard } from "./GetTheLookMoodboard";

/**
 * Fashion — homepage hero: the full "Get the Look" moodboard. Renders the
 * exact same content as pages/GetTheLookPage.tsx's standalone /get-the-look
 * route (see components/GetTheLookMoodboard.tsx) — the homepage isn't a
 * condensed teaser of it, it's the same moodboard shown in place.
 */
export function HeroBanner({ tenantSlug }: { tenantSlug: string }) {
  return <FashionGetTheLookMoodboard tenantSlug={tenantSlug} />;
}

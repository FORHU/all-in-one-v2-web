import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { FashionWishlistPage } from "@/tenants/fashion/pages/WishlistPage";

const wishlistPagesBySlug = {
  fashion: FashionWishlistPage,
} as const;

/**
 * Route entry point only — no business logic here.
 * TODO: extend wishlistPagesBySlug as other tenants get their own
 * WishlistPage.
 */
export default async function WishlistPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  const TenantWishlistPage =
    wishlistPagesBySlug[slug as keyof typeof wishlistPagesBySlug];

  if (!tenant || !TenantWishlistPage) return null;

  return <TenantWishlistPage />;
}

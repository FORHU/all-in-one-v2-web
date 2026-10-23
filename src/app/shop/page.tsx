import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { ElectronicsShopPage } from "@/tenants/electronics/pages/ShopPage";

const shopPagesBySlug = {
  electronics: ElectronicsShopPage,
} as const;

/**
 * Route entry point only — no business logic here.
 * TODO: extend shopPagesBySlug as other tenants get their own ShopPage.
 */
export default async function ShopPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  const TenantShopPage = shopPagesBySlug[slug as keyof typeof shopPagesBySlug];

  if (!tenant || !TenantShopPage) return null;

  return <TenantShopPage tenantSlug={slug} />;
}

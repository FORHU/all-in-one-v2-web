import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { FashionAccountPage } from "@/tenants/fashion/pages/AccountPage";
import { BeautyAccountPage } from "@/tenants/beauty/pages/AccountPage";

const accountPagesBySlug = {
  fashion: FashionAccountPage,
  beauty: BeautyAccountPage,
} as const;

/**
 * Route entry point only — no business logic here.
 * TODO: extend accountPagesBySlug as other tenants get their own
 * AccountPage.
 */
export default async function AccountPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  const TenantAccountPage =
    accountPagesBySlug[slug as keyof typeof accountPagesBySlug];

  if (!tenant || !TenantAccountPage) return null;

  return <TenantAccountPage tenantSlug={slug} />;
}

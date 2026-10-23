import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { ElectronicsNewArrivalsPage } from "@/tenants/electronics/pages/NewArrivalsPage";

const newArrivalsPagesBySlug = {
  electronics: ElectronicsNewArrivalsPage,
} as const;

/**
 * Route entry point only — no business logic here.
 * TODO: extend newArrivalsPagesBySlug as other tenants get their own
 * NewArrivalsPage.
 */
export default async function NewArrivalsPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  const TenantNewArrivalsPage =
    newArrivalsPagesBySlug[slug as keyof typeof newArrivalsPagesBySlug];

  if (!tenant || !TenantNewArrivalsPage) return null;

  return <TenantNewArrivalsPage tenantSlug={slug} />;
}

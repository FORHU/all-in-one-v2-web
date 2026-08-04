import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { FashionReturnsPage } from "@/tenants/fashion/pages/ReturnsPage";

const returnsPagesBySlug = {
  fashion: FashionReturnsPage,
} as const;

/**
 * Route entry point only — no business logic here.
 * TODO: extend returnsPagesBySlug as other tenants get their own
 * ReturnsPage.
 */
export default async function ReturnsPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  const TenantReturnsPage =
    returnsPagesBySlug[slug as keyof typeof returnsPagesBySlug];

  if (!tenant || !TenantReturnsPage) return null;

  return <TenantReturnsPage />;
}

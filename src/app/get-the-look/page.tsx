import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { FashionGetTheLookPage } from "@/tenants/fashion/pages/GetTheLookPage";

const getTheLookPagesBySlug = {
  fashion: FashionGetTheLookPage,
} as const;

/**
 * Route entry point only — no business logic here.
 * TODO: extend getTheLookPagesBySlug as other tenants get their own Get the Look page.
 */
export default async function GetTheLookPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  const TenantGetTheLookPage =
    getTheLookPagesBySlug[slug as keyof typeof getTheLookPagesBySlug];

  if (!tenant || !TenantGetTheLookPage) return null;

  return <TenantGetTheLookPage tenantSlug={slug} />;
}

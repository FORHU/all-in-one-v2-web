import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { ElectronicsSupportPage } from "@/tenants/electronics/pages/SupportPage";

const supportPagesBySlug = {
  electronics: ElectronicsSupportPage,
} as const;

/**
 * Route entry point only — no business logic here.
 * TODO: extend supportPagesBySlug as other tenants get their own
 * SupportPage.
 */
export default async function SupportPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  const TenantSupportPage =
    supportPagesBySlug[slug as keyof typeof supportPagesBySlug];

  if (!tenant || !TenantSupportPage) return null;

  return <TenantSupportPage />;
}

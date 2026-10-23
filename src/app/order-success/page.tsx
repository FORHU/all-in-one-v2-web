import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { FashionOrderSuccessPage } from "@/tenants/fashion/pages/OrderSuccessPage";
import { BeautyOrderSuccessPage } from "@/tenants/beauty/pages/OrderSuccessPage";
import { ElectronicsOrderSuccessPage } from "@/tenants/electronics/pages/OrderSuccessPage";

const orderSuccessPagesBySlug = {
  fashion: FashionOrderSuccessPage,
  beauty: BeautyOrderSuccessPage,
  electronics: ElectronicsOrderSuccessPage,
} as const;

/**
 * Route entry point only — no business logic here.
 * TODO: extend orderSuccessPagesBySlug as other tenants get their own
 * OrderSuccessPage.
 */
export default async function OrderSuccessPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  const TenantOrderSuccessPage =
    orderSuccessPagesBySlug[slug as keyof typeof orderSuccessPagesBySlug];

  if (!tenant || !TenantOrderSuccessPage) return null;

  return <TenantOrderSuccessPage />;
}

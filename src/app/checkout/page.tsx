import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { FashionCheckoutPage } from "@/tenants/fashion/pages/CheckoutPage";

const checkoutPagesBySlug = {
  fashion: FashionCheckoutPage,
} as const;

/**
 * Route entry point only — no business logic here.
 * TODO: extend checkoutPagesBySlug as other tenants get their own
 * CheckoutPage.
 */
export default async function CheckoutPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  const TenantCheckoutPage =
    checkoutPagesBySlug[slug as keyof typeof checkoutPagesBySlug];

  if (!tenant || !TenantCheckoutPage) return null;

  return <TenantCheckoutPage tenantSlug={slug} />;
}

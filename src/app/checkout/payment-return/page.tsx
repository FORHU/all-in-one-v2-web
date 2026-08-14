import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { FashionPaymentReturnPage } from "@/tenants/fashion/pages/PaymentReturnPage";

const paymentReturnPagesBySlug = {
  fashion: FashionPaymentReturnPage,
} as const;

/**
 * Route entry point only — no business logic here. Same pattern as
 * checkout/page.tsx: extend paymentReturnPagesBySlug as other tenants get
 * their own checkout/payment flow.
 */
export default async function PaymentReturnPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  const TenantPaymentReturnPage =
    paymentReturnPagesBySlug[slug as keyof typeof paymentReturnPagesBySlug];

  if (!tenant || !TenantPaymentReturnPage) return null;

  return <TenantPaymentReturnPage tenantSlug={slug} />;
}

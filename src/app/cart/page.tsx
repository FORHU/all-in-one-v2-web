import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { FashionCartPage } from "@/tenants/fashion/pages/CartPage";

const cartPagesBySlug = {
  fashion: FashionCartPage,
} as const;

/**
 * Route entry point only — no business logic here.
 * TODO: extend cartPagesBySlug as other tenants get their own CartPage.
 */
export default async function CartPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  const TenantCartPage = cartPagesBySlug[slug as keyof typeof cartPagesBySlug];

  if (!tenant || !TenantCartPage) return null;

  return <TenantCartPage />;
}

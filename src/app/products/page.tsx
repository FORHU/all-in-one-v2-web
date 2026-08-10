import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { FashionProductsPage } from "@/tenants/fashion/pages/ProductsPage";

const productsPagesBySlug = {
  fashion: FashionProductsPage,
} as const;

/**
 * Route entry point only — no business logic here.
 * TODO: extend productsPagesBySlug as other tenants get their own
 * ProductsPage.
 */
export default async function ProductsPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  const TenantProductsPage =
    productsPagesBySlug[slug as keyof typeof productsPagesBySlug];

  if (!tenant || !TenantProductsPage) return null;

  return <TenantProductsPage tenantSlug={slug} />;
}

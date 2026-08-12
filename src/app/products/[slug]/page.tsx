import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { FashionProductDetailPage } from "@/tenants/fashion/pages/ProductDetailPage";

const productDetailPagesBySlug = {
  fashion: FashionProductDetailPage,
} as const;

/**
 * Route entry point only — no business logic here.
 * TODO: extend productDetailPagesBySlug as other tenants get their own
 * ProductDetailPage.
 */
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenantSlug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(tenantSlug);
  const TenantProductDetailPage =
    productDetailPagesBySlug[
      tenantSlug as keyof typeof productDetailPagesBySlug
    ];

  if (!tenant || !TenantProductDetailPage) return null;

  return <TenantProductDetailPage tenantSlug={tenantSlug} slug={slug} />;
}

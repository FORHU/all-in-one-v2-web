import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { FashionCategoryDetailPage } from "@/tenants/fashion/pages/CategoryDetailPage";
import { BeautyCategoryDetailPage } from "@/tenants/beauty/pages/CategoryDetailPage";

const categoryDetailPagesBySlug = {
  fashion: FashionCategoryDetailPage,
  beauty: BeautyCategoryDetailPage,
} as const;

/**
 * Route entry point only — no business logic here.
 * TODO: extend categoryDetailPagesBySlug as other tenants get their own
 * CategoryDetailPage.
 */
export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenantSlug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(tenantSlug);
  const TenantCategoryDetailPage =
    categoryDetailPagesBySlug[
      tenantSlug as keyof typeof categoryDetailPagesBySlug
    ];

  if (!tenant || !TenantCategoryDetailPage) return null;

  return <TenantCategoryDetailPage slug={slug} tenantSlug={tenantSlug} />;
}

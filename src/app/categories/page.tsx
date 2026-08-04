import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { FashionCategoriesPage } from "@/tenants/fashion/pages/CategoriesPage";

const categoriesPagesBySlug = {
  fashion: FashionCategoriesPage,
} as const;

/**
 * Route entry point only — no business logic here.
 * TODO: extend categoriesPagesBySlug as other tenants get their own
 * CategoriesPage.
 */
export default async function CategoriesPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  const TenantCategoriesPage =
    categoriesPagesBySlug[slug as keyof typeof categoriesPagesBySlug];

  if (!tenant || !TenantCategoriesPage) return null;

  return <TenantCategoriesPage />;
}

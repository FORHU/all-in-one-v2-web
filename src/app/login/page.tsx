import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { FashionLoginPage } from "@/tenants/fashion/pages/LoginPage";

const loginPagesBySlug = {
  fashion: FashionLoginPage,
} as const;

/**
 * Route entry point only — no business logic here.
 * TODO: extend loginPagesBySlug as other tenants get their own LoginPage.
 */
export default async function LoginPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  const TenantLoginPage =
    loginPagesBySlug[slug as keyof typeof loginPagesBySlug];

  if (!tenant || !TenantLoginPage) return null;

  return <TenantLoginPage />;
}

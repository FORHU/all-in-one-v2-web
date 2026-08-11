import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { FashionHomePage } from "@/tenants/fashion/pages/HomePage";
import { BeautyHomePage } from "@/tenants/beauty/pages/HomePage";
import { ElectronicsHomePage } from "@/tenants/electronics/pages/HomePage";
import { LivingHomePage } from "@/tenants/living/pages/HomePage";
import { OutdoorHomePage } from "@/tenants/outdoor/pages/HomePage";

const homePagesBySlug = {
  beauty: BeautyHomePage,
  electronics: ElectronicsHomePage,
  living: LivingHomePage,
  outdoor: OutdoorHomePage,
} as const;

export default async function RootPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  if (!tenant) return null;

  // Fashion is special-cased since it's the only home page that needs
  // tenantSlug (its hero fetches real "Get the Look" data) — the other
  // tenant home pages are still static, matching /products' single-tenant
  // pattern until they get real data too.
  if (slug === "fashion") return <FashionHomePage tenantSlug={slug} />;

  const HomePage = homePagesBySlug[slug as keyof typeof homePagesBySlug];
  if (!HomePage) return null;

  return <HomePage />;
}

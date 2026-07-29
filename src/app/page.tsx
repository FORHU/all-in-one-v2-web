import { headers } from "next/headers";
import { getTenantConfig } from "@/tenants/registry";
import { FashionHomePage } from "@/tenants/fashion/pages/HomePage";
import { BeautyHomePage } from "@/tenants/beauty/pages/HomePage";
import { ElectronicsHomePage } from "@/tenants/electronics/pages/HomePage";
import { LivingHomePage } from "@/tenants/living/pages/HomePage";
import { OutdoorHomePage } from "@/tenants/outdoor/pages/HomePage";

const homePagesBySlug = {
  fashion: FashionHomePage,
  beauty: BeautyHomePage,
  electronics: ElectronicsHomePage,
  living: LivingHomePage,
  outdoor: OutdoorHomePage,
} as const;

export default async function RootPage() {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);
  const HomePage = homePagesBySlug[slug as keyof typeof homePagesBySlug];

  if (!tenant || !HomePage) return null;

  return <HomePage />;
}

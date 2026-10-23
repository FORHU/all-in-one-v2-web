import type { TenantConfig } from "./types";
import { fashionConfig } from "./fashion/tenant.config";
import { beautyConfig } from "./beauty/tenant.config";
import { electronicsConfig } from "./electronics/tenant.config";
import { livingConfig } from "./living/tenant.config";
import { outdoorConfig } from "./outdoor/tenant.config";

/**
 * Slug -> config lookup for all 5 storefronts. Consumed by src/app/layout.tsx
 * (via the slug resolved in root middleware.ts) to inject theme tokens and
 * provide tenant context — never imported by feature business logic.
 */
export const tenantRegistry: Record<string, TenantConfig> = {
  fashion: fashionConfig,
  beauty: beautyConfig,
  electronics: electronicsConfig,
  living: livingConfig,
  outdoor: outdoorConfig,
};

export function getTenantConfig(slug: string): TenantConfig | undefined {
  return tenantRegistry[slug];
}

/**
 * The tenant whose domain is `hostname` or a parent of it — so
 * addictstyle.com, www.addictstyle.com, dev.addictstyle.com,
 * staging.addictstyle.com and any future preview host all resolve to
 * fashion with no per-environment list to maintain; the same build serves
 * every environment. Matching is on whole labels: "notaddictstyle.com" is
 * not a match for "addictstyle.com".
 */
export function getTenantSlugByDomain(hostname: string): string | undefined {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  const entry = Object.values(tenantRegistry).find((tenant) => {
    const domain = tenant.domain?.toLowerCase();
    return !!domain && (host === domain || host.endsWith(`.${domain}`));
  });
  return entry?.slug;
}

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

export function getTenantSlugByDomain(hostname: string): string | undefined {
  const normalizedHost = hostname.toLowerCase().replace(/^www\./, "");
  const entry = Object.values(tenantRegistry).find(
    (tenant) => tenant.domain?.toLowerCase() === normalizedHost,
  );
  return entry?.slug;
}

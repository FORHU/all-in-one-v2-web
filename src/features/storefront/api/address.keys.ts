export const addressKeys = {
  all: ["storefront", "addresses"] as const,
  latest: (tenantSlug: string) =>
    [...addressKeys.all, "latest", tenantSlug] as const,
} as const;

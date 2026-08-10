export const collectionsKeys = {
  all: ["storefront", "collections"] as const,
  list: (tenantSlug: string, type?: string, categorySlug?: string) =>
    [...collectionsKeys.all, "list", tenantSlug, type, categorySlug] as const,
} as const;

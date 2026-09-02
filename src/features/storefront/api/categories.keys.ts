export const categoriesKeys = {
  all: ["storefront", "categories"] as const,
  list: (tenantSlug: string) =>
    [...categoriesKeys.all, "list", tenantSlug] as const,
} as const;

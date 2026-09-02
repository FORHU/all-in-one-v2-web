export const collectionsKeys = {
  all: ["storefront", "collections"] as const,
  list: (
    tenantSlug: string,
    type?: string,
    categorySlug?: string,
    limit?: number,
  ) =>
    [
      ...collectionsKeys.all,
      "list",
      tenantSlug,
      type,
      categorySlug,
      limit,
    ] as const,
} as const;

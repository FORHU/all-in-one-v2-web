export const categoriesKeys = {
  all: ["storefront", "categories"] as const,
  list: () => [...categoriesKeys.all, "list"] as const,
  detail: (slug: string) => [...categoriesKeys.all, "detail", slug] as const,
} as const;

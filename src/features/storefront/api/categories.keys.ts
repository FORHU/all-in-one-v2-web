export const categoriesKeys = {
  all: ["storefront", "categories"] as const,
  list: () => [...categoriesKeys.all, "list"] as const,
} as const;

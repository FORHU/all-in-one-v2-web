export const productsKeys = {
  all: ["storefront", "products"] as const,
  list: () => [...productsKeys.all, "list"] as const,
  detail: (slug: string) => [...productsKeys.all, "detail", slug] as const,
} as const;

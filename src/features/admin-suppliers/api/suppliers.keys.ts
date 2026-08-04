export const suppliersKeys = {
  all: ["admin-suppliers"] as const,
  list: () => [...suppliersKeys.all, "list"] as const,
} as const;

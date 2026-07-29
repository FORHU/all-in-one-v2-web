export const catalogKeys = {
  all: ["admin-catalog"] as const,
  list: () => [...catalogKeys.all, "list"] as const,
} as const;

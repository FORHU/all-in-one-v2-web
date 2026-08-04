import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getCart, cartKeys } from "@/features/storefront/api";

/**
 * Reads the tenant-scoped active cart.
 *
 * suppressErrorToast: getCart() always throws until /v2/cart exists, and
 * this hook is called from the header on every page — without this the
 * global QueryCache handler (see shared/lib/providers/query-provider.tsx)
 * fires an "Unexpected error occurred" toast on every single page load.
 * Consumers (header badge, CartPage) already render their own
 * loading/empty/error states from isPending/isError.
 */
export function useCart() {
  return useSafeQuery({
    queryKey: cartKeys.current(),
    queryFn: getCart,
    meta: { suppressErrorToast: true },
  });
}

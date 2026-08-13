import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { saveAddress, addressKeys } from "@/features/storefront/api";
import type { SaveAddressInput } from "@/features/storefront/contracts/address.contract";

/**
 * Saves a new shipping address for the signed-in customer (insert-only —
 * see address.controller.ts's doc comment) and refreshes the "latest
 * address" query so pages/CheckoutPage.tsx immediately reflects it.
 */
export function useSaveAddress(tenantSlug: string) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: SaveAddressInput) => saveAddress(tenantSlug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: addressKeys.latest(tenantSlug),
      });
    },
  });
}

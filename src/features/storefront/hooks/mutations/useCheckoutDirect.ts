import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { checkoutDirect, ordersKeys } from "@/features/storefront/api";
import type { CheckoutDirectInput } from "@/features/storefront/contracts/order.contract";

/**
 * Places a real order for the signed-in customer without a persisted
 * backend cart (see orders.client.ts's checkoutDirect doc comment).
 * Invalidates the "my orders" query so pages/AccountPage.tsx's Orders
 * section immediately reflects the new order.
 */
export function useCheckoutDirect(tenantSlug: string) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: CheckoutDirectInput) =>
      checkoutDirect(tenantSlug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.all });
    },
  });
}

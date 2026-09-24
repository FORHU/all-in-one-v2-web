import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { cancelOrder, ordersKeys } from "@/features/storefront/api";

/**
 * Cancels one of the signed-in customer's own orders — only possible while
 * it's still PENDING (see orders.client.ts's cancelOrder doc comment).
 * Invalidates "my orders" so AccountPage's list reflects CANCELLED
 * immediately, same pattern as useCheckoutDirect.
 */
export function useCancelOrder(tenantSlug: string) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (orderId: string) => cancelOrder(tenantSlug, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.all });
    },
  });
}

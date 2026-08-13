import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  markNotificationRead,
  notificationsKeys,
} from "@/features/storefront/api";

/** Marks a single notification read and refreshes the notifications list. */
export function useMarkNotificationRead(tenantSlug: string) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (id: string) => markNotificationRead(tenantSlug, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.my(tenantSlug),
      });
    },
  });
}

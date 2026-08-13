import { fetcher } from "@/shared/lib/http";
import {
  NotificationsApiEnvelopeSchema,
  MarkNotificationReadApiEnvelopeSchema,
  type Notification,
} from "../contracts/notification.contract";

/**
 * Storefront — Notification API client. Tenant-scoped via `x-tenant-slug`,
 * same convention as orders.client.ts; both endpoints are signed-in-only.
 */
export const getMyNotifications = async (
  tenantSlug: string,
): Promise<Notification[]> => {
  const raw = await fetcher<unknown>("/api/v2/notifications/my", {
    headers: { "x-tenant-slug": tenantSlug },
  });
  return NotificationsApiEnvelopeSchema.parse(raw).data;
};

export const markNotificationRead = async (
  tenantSlug: string,
  id: string,
): Promise<Notification> => {
  const raw = await fetcher<unknown>(`/api/v2/notifications/${id}/read`, {
    method: "PATCH",
    headers: { "x-tenant-slug": tenantSlug },
  });
  return MarkNotificationReadApiEnvelopeSchema.parse(raw).data;
};

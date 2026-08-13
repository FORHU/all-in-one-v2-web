import { z } from "zod";

/**
 * FAOS v5 — Storefront Notification Contracts.
 * Authoritative shape for GET /v2/notifications/my and
 * PATCH /v2/notifications/:id/read.
 */

export const NotificationTypeSchema = z.enum([
  "ORDER_STATUS",
  "PAYMENT_CONFIRMED",
  "SHIPMENT_TRACKING",
  "SYSTEM_ALERT",
  "PROMOTION",
]);

export const NotificationSchema = z.object({
  id: z.string(),
  type: NotificationTypeSchema,
  title: z.string(),
  message: z.string(),
  isRead: z.boolean(),
  readAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});

export const NotificationsApiEnvelopeSchema = z.object({
  data: z.array(NotificationSchema),
});

export const MarkNotificationReadApiEnvelopeSchema = z.object({
  data: NotificationSchema,
});

export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type Notification = z.infer<typeof NotificationSchema>;

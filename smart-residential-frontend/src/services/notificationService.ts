import { api } from "./api";
import type { NotificationResponse } from "@/types";

export interface CreateNotificationRequest {
  userId: number;
  message: string;
  type: string;
}

export const notificationApi = {
  // 1. POST /api/notifications
  create: (request: CreateNotificationRequest) =>
    api.post<NotificationResponse>(`/api/notifications`, request).then((r) => r.data),

  // 2. GET /api/notifications
  getAll: () =>
    api.get<NotificationResponse[]>(`/api/notifications`).then((r) => r.data),

  // 3. GET /api/notifications/user/{userId}
  forUser: (userId: number) =>
    api.get<NotificationResponse[]>(`/api/notifications/user/${userId}`).then((r) => r.data),

  // 4. GET /api/notifications/user/{userId}/unread
  unread: (userId: number) =>
    api.get<NotificationResponse[]>(`/api/notifications/user/${userId}/unread`).then((r) => r.data),

  // 5. PATCH /api/notifications/{id}/read
  markRead: (id: number) => 
    api.patch(`/api/notifications/${id}/read`),

  // 6. PATCH /api/notifications/user/{userId}/read-all
  markAllRead: (userId: number) => 
    api.patch(`/api/notifications/user/${userId}/read-all`),
};
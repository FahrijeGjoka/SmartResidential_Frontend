import { api } from "./api";
import type { NotificationResponse } from "@/types";

export const notificationApi = {
  forUser: (userId: number) =>
    api.get<NotificationResponse[]>(`/api/notifications/user/${userId}`).then((r) => r.data),
  unread: (userId: number) =>
    api.get<NotificationResponse[]>(`/api/notifications/user/${userId}/unread`).then((r) => r.data),
  markRead: (id: number) => api.patch(`/api/notifications/${id}/read`),
  markAllRead: (userId: number) => api.patch(`/api/notifications/user/${userId}/read-all`),
};

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  Megaphone,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { notificationApi } from "@/services/notificationService";
import { useAuth } from "@/context/AuthContext";
import type { NotificationResponse } from "@/types";

const typeStyles: Record<string, { icon: typeof Bell; tone: "default" | "primary" | "accent" | "success" | "warning" | "danger" }> = {
  ANNOUNCEMENT: { icon: Megaphone, tone: "primary" },
  INFO: { icon: Info, tone: "accent" },
  ISSUE: { icon: Wrench, tone: "warning" },
  MAINTENANCE: { icon: Wrench, tone: "warning" },
  WARNING: { icon: AlertTriangle, tone: "warning" },
  ALERT: { icon: ShieldAlert, tone: "danger" },
  SUCCESS: { icon: CheckCircle2, tone: "success" },
};

function notificationMeta(type: string) {
  return typeStyles[type.toUpperCase()] ?? { icon: Bell, tone: "default" as const };
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function sortNotifications(notifications: NotificationResponse[]) {
  return [...notifications].sort((a, b) => {
    const unread = Number(a.isRead) - Number(b.isRead);
    if (unread !== 0) return unread;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export default function NotificationsPage() {
  const { userId, token } = useAuth();
  const queryClient = useQueryClient();

  const userIdError = token && !userId ? "We could not find your user id in the saved session. Please sign in again." : null;

  const notificationsQ = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => notificationApi.forUser(userId!),
    enabled: Boolean(userId),
  });

  const markReadM = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
        queryClient.invalidateQueries({ queryKey: ["notifications", "unread", userId] }),
      ]);
    },
  });

  const markAllReadM = useMutation({
    mutationFn: () => notificationApi.markAllRead(userId!),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
        queryClient.invalidateQueries({ queryKey: ["notifications", "unread", userId] }),
      ]);
    },
  });

  const notifications = useMemo(
    () => sortNotifications(notificationsQ.data ?? []),
    [notificationsQ.data]
  );
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const isLoading = notificationsQ.isLoading || notificationsQ.isFetching;
  const hasNotifications = notifications.length > 0;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Recent updates and alerts"
        action={
          <Button
            variant="secondary"
            type="button"
            onClick={() => markAllReadM.mutate()}
            loading={markAllReadM.isPending}
            disabled={!userId || unreadCount === 0}
          >
            Mark all as read
          </Button>
        }
      />

      {userIdError ? (
        <Card className="border-red-100 bg-red-50/80 text-sm text-red-800">
          {userIdError}
        </Card>
      ) : null}

      {notificationsQ.isError ? (
        <Card className="border-red-100 bg-red-50/80 text-sm text-red-800">
          We could not load your notifications. Please try again.
        </Card>
      ) : null}

      {isLoading ? (
        <Card className="flex justify-center py-16">
          <Spinner />
        </Card>
      ) : !notificationsQ.isError && !userIdError && !hasNotifications ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <Bell className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-medium text-secondary">No notifications yet.</p>
        </Card>
      ) : !notificationsQ.isError && !userIdError ? (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const meta = notificationMeta(notification.type);
            const Icon = meta.icon;

            return (
              <Card
                key={notification.id}
                className={!notification.isRead ? "border-primary/20 bg-blue-50/40" : undefined}
                padding="p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-slate-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={meta.tone}>{notification.type}</Badge>
                        {!notification.isRead ? <Badge tone="primary">Unread</Badge> : <Badge>Read</Badge>}
                      </div>
                      <p className="mt-2 text-sm font-medium leading-6 text-secondary">{notification.message}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDateTime(notification.createdAt)}</p>
                    </div>
                  </div>

                  {!notification.isRead ? (
                    <Button
                      variant="ghost"
                      type="button"
                      className="shrink-0"
                      onClick={() => markReadM.mutate(notification.id)}
                      loading={markReadM.isPending && markReadM.variables === notification.id}
                    >
                      Mark as read
                    </Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

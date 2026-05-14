import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { notificationApi } from "@/services/notificationService";
import { useAuth } from "@/context/AuthContext";

export default function NotificationsPage() {
  const { userId } = useAuth();
  const qc = useQueryClient();

  const listQ = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => notificationApi.forUser(userId!),
    enabled: Boolean(userId),
  });

  const readM = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
  });

  const readAllM = useMutation({
    mutationFn: () => notificationApi.markAllRead(userId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
  });

  return (
    <div>
      <PageHeader
        title="Mesazhet"
        description="Njoftime për ju: shënoni si të lexuara kur t’i keni parë."
        action={
          userId ? (
            <Button variant="secondary" type="button" onClick={() => readAllM.mutate()} loading={readAllM.isPending}>
              Shëno të gjitha si të lexuara
            </Button>
          ) : null
        }
      />
      <Card padding="p-0" className="overflow-hidden">
        {listQ.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {(listQ.data ?? []).map((n) => (
              <li key={n.id} className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={n.isRead ? "default" : "primary"}>{n.isRead ? "E lexuar" : "E re"}</Badge>
                    <span className="text-xs text-slate-400">{n.type}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-800">{n.message}</p>
                  <p className="text-xs text-slate-500">{n.createdAt}</p>
                </div>
                {!n.isRead ? (
                  <Button variant="ghost" type="button" className="shrink-0" onClick={() => readM.mutate(n.id)}>
                    Shëno si të lexuar
                  </Button>
                ) : null}
              </li>
            ))}
            {!listQ.data?.length ? (
              <li className="px-6 py-12 text-center text-sm text-slate-500">No notifications yet.</li>
            ) : null}
          </ul>
        )}
      </Card>
    </div>
  );
}

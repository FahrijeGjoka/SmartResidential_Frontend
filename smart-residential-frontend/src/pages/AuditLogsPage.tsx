import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { auditLogApi } from "@/services/auditLogService";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, Activity } from "lucide-react";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getActionTone(action: string) {
  const act = action.toUpperCase();
  if (act.includes("CREATE") || act.includes("ACTIVATE")) return "success";
  if (act.includes("DELETE") || act.includes("DEACTIVATE")) return "danger";
  if (act.includes("UPDATE") || act.includes("PATCH") || act.includes("PUT")) return "warning";
  return "default";
}

export default function AuditLogsPage() {
  const { role } = useAuth();

  const auditLogsQ = useQuery({
    queryKey: ["auditLogs"],
    queryFn: auditLogApi.getAll,
    enabled: role === "ROLE_ADMIN",
  });

  if (role !== "ROLE_ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-slate-900">Qasje e Ndaluar</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Kjo faqe përmban ditarët e auditimit të sigurisë dhe mund të shikohet vetëm nga administratorët e sistemit.
        </p>
      </div>
    );
  }

  const logs = auditLogsQ.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historiku i Auditimit (Audit Logs)"
        description="Lista kronologjike e të gjitha aksioneve kritike të kryera në sistem (Kush, Çfarë, Kur)."
      />

      {auditLogsQ.isError && (
        <Card className="border-red-100 bg-red-50/80 p-4 text-sm text-red-800">
          Dështoi ngarkimi i historikut të auditimit nga Serveri. Ju lutem provoni përsëri.
        </Card>
      )}

      <Card padding="p-0" className="overflow-hidden">
        {auditLogsQ.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
              <Activity className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">
              Nuk u gjet asnjë log i regjistruar në sistem.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Log ID</th>
                  <th className="px-6 py-3">User ID</th>
                  <th className="px-6 py-3">Aksioni</th>
                  <th className="px-6 py-3">Moduli (Entity Type)</th>
                  <th className="px-6 py-3">ID e Objektit</th>
                  <th className="px-6 py-3">Koha e Ndodhjes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{log.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      Përdoruesi #{log.userId}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={getActionTone(log.action)}>{log.action}</Badge>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {log.entityType}
                    </td>
                    <td className="px-6 py-4 text-slate-500">#{log.entityId}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { technicianApi } from "@/services/technicianService";

export default function TechniciansPage() {
  const listQ = useQuery({ queryKey: ["technicians"], queryFn: technicianApi.list });

  return (
    <div>
      <PageHeader
        title="Teknikët"
        description="Lista e teknikëve të regjistruar për caktim në kërkesa."
      />
      <Card padding="p-0" className="overflow-hidden">
        {listQ.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Profile</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Specialization</th>
                  <th className="px-6 py-3">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(listQ.data ?? []).map((t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#{t.id}</td>
                    <td className="px-6 py-4 text-slate-800">User #{t.userId}</td>
                    <td className="px-6 py-4 text-slate-600">{t.specialization}</td>
                    <td className="px-6 py-4">
                      <Badge tone={t.isAvailable ? "success" : "warning"}>
                        {t.isAvailable ? "Available" : "Busy"}
                      </Badge>
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

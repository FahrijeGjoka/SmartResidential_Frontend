import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { maintenanceApi } from "@/services/maintenanceService";
import { issueApi } from "@/services/issueService";
import { useAuth } from "@/context/AuthContext";
import { isStaffOrAdmin, isResident, isTechnician } from "@/utils/roles";

const schema = z.object({
  issueId: z.coerce.number().positive(),
  description: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export default function MaintenancePage() {
  const qc = useQueryClient();
  const { userId, role } = useAuth();
  const staff = isStaffOrAdmin(role);
  const resident = isResident(role);
  const technician = isTechnician(role);
  const [open, setOpen] = useState(false);

  const listQ = useQuery({ queryKey: ["maintenance"], queryFn: maintenanceApi.list });

  const issuesQ = useQuery({
    queryKey: ["issues", staff ? "all" : "mine", userId],
    queryFn: () =>
      staff ? issueApi.list() : issueApi.list({ createdById: userId! }),
    enabled: Boolean(userId) && (staff || resident) && !technician,
  });

  const form = useForm<Form>({ resolver: zodResolver(schema) });

  const createM = useMutation({
    mutationFn: maintenanceApi.create,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Kërkesa u regjistrua");
      setOpen(false);
      form.reset();
    },
  });

  const onSubmit = (values: Form) => {
    if (!userId) return;
    createM.mutate({
      issueId: values.issueId,
      requestedById: userId,
      description: values.description,
    });
  };

  return (
    <div>
      <PageHeader
        title="Mirëmbajtja"
        description="Regjistroni kërkesa formale të lidhura me një çështje ekzistuese."
        action={
          !technician ? (
            <Button
              onClick={() => {
                const first = issuesQ.data?.[0]?.id;
                if (first) form.setValue("issueId", first);
                setOpen(true);
              }}
            >
              New request
            </Button>
          ) : undefined
        }
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
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Issue</th>
                  <th className="px-6 py-3">Requested by</th>
                  <th className="px-6 py-3">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(listQ.data ?? []).map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{m.id}</td>
                    <td className="px-6 py-4 font-medium text-secondary">#{m.issueId}</td>
                    <td className="px-6 py-4 text-slate-600">User #{m.requestedById}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {m.requestedAt ? new Date(m.requestedAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Create maintenance request">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Issue</label>
            <select className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" {...form.register("issueId")}>
              {(issuesQ.data ?? []).map((i) => (
                <option key={i.id} value={i.id}>
                  #{i.id} — {i.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Notes</label>
            <Input {...form.register("description")} />
          </div>
          <Button type="submit" className="w-full" loading={createM.isPending}>
            Submit
          </Button>
        </form>
      </Modal>
    </div>
  );
}

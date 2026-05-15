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
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { userApi } from "@/services/userService";
import { roleApi } from "@/services/roleService";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/types";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roleId: z.coerce.number().positive(),
});

type Form = z.infer<typeof schema>;

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const { tenantId } = useAuth();
  const [open, setOpen] = useState(false);

  const usersQ = useQuery({ queryKey: ["users"], queryFn: userApi.list });
  const rolesQ = useQuery({ queryKey: ["roles"], queryFn: roleApi.list });

  const form = useForm<Form>({ resolver: zodResolver(schema) });

  const createM = useMutation({
    mutationFn: userApi.create,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Përdoruesi u krijua");
      setOpen(false);
      form.reset();
    },
  });

  const deactivateM = useMutation({
    mutationFn: userApi.deactivate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const activateM = useMutation({
    mutationFn: userApi.activate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const staffM = useMutation({
    mutationFn: userApi.makeStaff,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const techM = useMutation({
    mutationFn: userApi.makeTechnician,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const roleName = (id: number) => rolesQ.data?.find((r) => r.id === id)?.name ?? `role:${id}`;

  const onSubmit = (values: Form) => {
    if (!tenantId) {
      toast.error("Mungon identifikuesi i organizatës në sesion — dilni dhe hyni përsëri.");
      return;
    }
    createM.mutate({ ...values, tenantId });
  };

  return (
    <div>
      <PageHeader
        title="Përdoruesit"
        description="Menaxhoni llogaritë dhe rolet (vetëm për administratorët)."
        action={
          <Button
            onClick={() => {
              form.reset({ roleId: rolesQ.data?.[0]?.id ?? 1, email: "", password: "", firstName: "", lastName: "" });
              setOpen(true);
            }}
          >
            Invite user
          </Button>
        }
      />
      <Card padding="p-0" className="overflow-hidden">
        {usersQ.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(usersQ.data ?? []).map((u: User) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-secondary">{u.email}</div>
                      <div className="text-xs text-slate-500">
                        {u.firstName} {u.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{roleName(u.roleId)}</td>
                    <td className="px-6 py-4">
                      <Badge tone={u.isActive ? "success" : "warning"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="space-x-1 px-6 py-4 text-right">
                      {u.isActive ? (
                        <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => deactivateM.mutate(u.id)}>
                          Deactivate
                        </Button>
                      ) : (
                        <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => activateM.mutate(u.id)}>
                          Activate
                        </Button>
                      )}
                      <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => staffM.mutate(u.id)}>
                        Make staff
                      </Button>
                      <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => techM.mutate(u.id)}>
                        Make technician
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Create user (admin)">
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
            <Input type="email" {...form.register("email")} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Temporary password</label>
            <Input type="password" {...form.register("password")} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">First name</label>
              <Input {...form.register("firstName")} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Last name</label>
              <Input {...form.register("lastName")} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Role</label>
            <select className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" {...form.register("roleId")}>
              {(rolesQ.data ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full" loading={createM.isPending}>
            Create
          </Button>
        </form>
      </Modal>
    </div>
  );
}

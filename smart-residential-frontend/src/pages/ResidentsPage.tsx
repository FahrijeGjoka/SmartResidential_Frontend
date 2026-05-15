import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { residentApi } from "@/services/residentService";
import { userApi } from "@/services/userService";
import { apartmentApi } from "@/services/apartmentService";
import type { ResidentProfileResponse } from "@/types";

const schema = z.object({
  userId: z.coerce.number().positive(),
  apartmentId: z.coerce.number().positive(),
  movedInAt: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export default function ResidentsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<ResidentProfileResponse | null>(null);

  const residentsQ = useQuery({ queryKey: ["residents"], queryFn: residentApi.list });
  const usersQ = useQuery({ queryKey: ["users"], queryFn: userApi.listActive });
  const apartmentsQ = useQuery({ queryKey: ["apartments"], queryFn: apartmentApi.list });

  const form = useForm<Form>({ resolver: zodResolver(schema) });

  const createM = useMutation({
    mutationFn: residentApi.create,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["residents"] });
      toast.success("Banori u lidh me apartamentin");
      setModal(null);
      form.reset();
    },
  });

  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Form }) =>
      residentApi.update(id, {
        userId: body.userId,
        apartmentId: body.apartmentId,
        movedInAt: body.movedInAt || undefined,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["residents"] });
      toast.success("Të dhënat u përditësuan");
      setModal(null);
      setSelected(null);
    },
  });

  const deleteM = useMutation({
    mutationFn: residentApi.remove,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["residents"] });
      toast.success("Lidhja u hoq");
    },
  });

  const userLabel = (id: number) => {
    const u = usersQ.data?.find((x) => x.id === id);
    return u ? `${u.firstName ?? ""} ${u.lastName ?? ""} (${u.email})`.trim() : `User #${id}`;
  };

  const aptLabel = (id: number) => {
    const a = apartmentsQ.data?.find((x) => x.id === id);
    return a ? `Unit ${a.unitNumber}` : `Apartment #${id}`;
  };

  const openEdit = (r: ResidentProfileResponse) => {
    setSelected(r);
    form.reset({
      userId: r.userId,
      apartmentId: r.apartmentId,
      movedInAt: r.movedInAt?.slice(0, 16),
    });
    setModal("edit");
  };

  const onSubmit = (values: Form) => {
    const movedInAt = values.movedInAt ? new Date(values.movedInAt).toISOString() : undefined;
    if (modal === "create")
      createM.mutate({
        userId: values.userId,
        apartmentId: values.apartmentId,
        movedInAt,
      });
    else if (modal === "edit" && selected)
      updateM.mutate({
        id: selected.id,
        body: { ...values, movedInAt: values.movedInAt },
      });
  };

  return (
    <div>
      <PageHeader
        title="Banorët"
        description="Lidhni përdoruesit me apartamentet dhe datën e hyrjes."
        action={
          <Button
            className="gap-2"
            onClick={() => {
              form.reset({
                userId: usersQ.data?.[0]?.id ?? 0,
                apartmentId: apartmentsQ.data?.[0]?.id ?? 0,
                movedInAt: "",
              });
              setModal("create");
            }}
          >
            <Plus className="h-4 w-4" /> Link resident
          </Button>
        }
      />
      <Card padding="p-0" className="overflow-hidden">
        {residentsQ.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Resident</th>
                  <th className="px-6 py-3">Apartment</th>
                  <th className="px-6 py-3">Move-in</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(residentsQ.data ?? []).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-medium text-secondary">{userLabel(r.userId)}</td>
                    <td className="px-6 py-4 text-slate-600">{aptLabel(r.apartmentId)}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {r.movedInAt ? new Date(r.movedInAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="mr-2 inline-flex rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary"
                        onClick={() => openEdit(r)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          if (confirm("Remove resident profile?")) deleteM.mutate(r.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modal !== null}
        onClose={() => {
          setModal(null);
          setSelected(null);
        }}
        title={modal === "create" ? "Link resident" : "Edit resident profile"}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">User</label>
            <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" {...form.register("userId")}>
              {(usersQ.data ?? []).map((u) => (
                <option key={u.id} value={u.id}>
                  {userLabel(u.id)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Apartment</label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
              {...form.register("apartmentId")}
            >
              {(apartmentsQ.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {aptLabel(a.id)} (building {a.buildingId})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Move-in (optional)</label>
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
              {...form.register("movedInAt")}
            />
          </div>
          <Button type="submit" className="w-full" loading={createM.isPending || updateM.isPending}>
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}

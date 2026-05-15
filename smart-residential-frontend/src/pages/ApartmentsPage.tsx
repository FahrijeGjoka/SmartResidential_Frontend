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
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { apartmentApi } from "@/services/apartmentService";
import { buildingApi } from "@/services/buildingService";
import type { ApartmentResponse } from "@/types";

const schema = z.object({
  buildingId: z.coerce.number().positive(),
  unitNumber: z.string().min(1),
  floor: z.coerce.number().int(),
});

type Form = z.infer<typeof schema>;

export default function ApartmentsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<ApartmentResponse | null>(null);

  const buildingsQ = useQuery({ queryKey: ["buildings"], queryFn: buildingApi.list });
  const apartmentsQ = useQuery({ queryKey: ["apartments"], queryFn: apartmentApi.list });

  const form = useForm<Form>({ resolver: zodResolver(schema) });

  const createM = useMutation({
    mutationFn: apartmentApi.create,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["apartments"] });
      toast.success("Apartamenti u krijua");
      setModal(null);
      form.reset();
    },
  });

  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Form }) => apartmentApi.update(id, body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["apartments"] });
      toast.success("Apartamenti u përditësua");
      setModal(null);
      setSelected(null);
    },
  });

  const deleteM = useMutation({
    mutationFn: apartmentApi.remove,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["apartments"] });
      toast.success("Apartamenti u fshi");
    },
  });

  const buildingName = (id: number) => buildingsQ.data?.find((b) => b.id === id)?.name ?? `Building #${id}`;

  const openEdit = (a: ApartmentResponse) => {
    setSelected(a);
    form.reset({
      buildingId: a.buildingId,
      unitNumber: a.unitNumber,
      floor: a.floor,
    });
    setModal("edit");
  };

  const onSubmit = (values: Form) => {
    if (modal === "create") createM.mutate(values);
    else if (modal === "edit" && selected) updateM.mutate({ id: selected.id, body: values });
  };

  return (
    <div>
      <PageHeader
        title="Apartamentet"
        description="Njësitë e banimit të lidhura me ndërtesat."
        action={
          <Button
            className="gap-2"
            onClick={() => {
              form.reset({
                buildingId: buildingsQ.data?.[0]?.id ?? 0,
                unitNumber: "",
                floor: 0,
              });
              setModal("create");
            }}
          >
            <Plus className="h-4 w-4" /> New apartment
          </Button>
        }
      />
      <Card padding="p-0" className="overflow-hidden">
        {apartmentsQ.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Unit</th>
                  <th className="px-6 py-3">Floor</th>
                  <th className="px-6 py-3">Building</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(apartmentsQ.data ?? []).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-medium text-secondary">{a.unitNumber}</td>
                    <td className="px-6 py-4 text-slate-600">{a.floor}</td>
                    <td className="px-6 py-4 text-slate-600">{buildingName(a.buildingId)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="mr-2 inline-flex rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary"
                        onClick={() => openEdit(a)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          if (confirm("Delete apartment?")) deleteM.mutate(a.id);
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
        title={modal === "create" ? "New apartment" : "Edit apartment"}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Building</label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
              {...form.register("buildingId", { valueAsNumber: true })}
            >
              {(buildingsQ.data ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Unit number</label>
            <Input {...form.register("unitNumber")} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Floor</label>
            <Input type="number" {...form.register("floor", { valueAsNumber: true })} />
          </div>
          <Button type="submit" className="w-full" loading={createM.isPending || updateM.isPending}>
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}

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
import { buildingApi } from "@/services/buildingService";
import type { BuildingResponse } from "@/types";

const schema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
});

type Form = z.infer<typeof schema>;

export default function BuildingsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<BuildingResponse | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["buildings"], queryFn: buildingApi.list });

  const form = useForm<Form>({ resolver: zodResolver(schema) });

  const createM = useMutation({
    mutationFn: buildingApi.create,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["buildings"] });
      toast.success("Building created");
      setModal(null);
      form.reset();
    },
  });

  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Form }) => buildingApi.update(id, body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["buildings"] });
      toast.success("Building updated");
      setModal(null);
      setSelected(null);
    },
  });

  const deleteM = useMutation({
    mutationFn: buildingApi.remove,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["buildings"] });
      toast.success("Building deleted");
    },
  });

  const openEdit = (b: BuildingResponse) => {
    setSelected(b);
    form.reset({ name: b.name, address: b.address });
    setModal("edit");
  };

  const onSubmit = (values: Form) => {
    if (modal === "create") createM.mutate(values);
    else if (modal === "edit" && selected) updateM.mutate({ id: selected.id, body: values });
  };

  return (
    <div>
      <PageHeader
        title="Buildings"
        description="Add and update buildings in your portfolio."
        action={
          <Button
            className="gap-2"
            onClick={() => {
              form.reset({ name: "", address: "" });
              setModal("create");
            }}
          >
            <Plus className="h-4 w-4" /> New building
          </Button>
        }
      />
      <Card padding="p-0" className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Address</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(data ?? []).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-medium text-secondary">{b.name}</td>
                    <td className="px-6 py-4 text-slate-600">{b.address}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(b.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="mr-2 inline-flex rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary"
                        onClick={() => openEdit(b)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          if (confirm("Delete this building?")) deleteM.mutate(b.id);
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
        title={modal === "create" ? "New building" : "Edit building"}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Name</label>
            <Input {...form.register("name")} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Address</label>
            <Input {...form.register("address")} />
          </div>
          <Button type="submit" className="w-full" loading={createM.isPending || updateM.isPending}>
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}

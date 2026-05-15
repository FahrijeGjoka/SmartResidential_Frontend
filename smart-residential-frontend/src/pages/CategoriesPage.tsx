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
import { issueCategoryApi } from "@/services/issueCategoryService";
import type { IssueCategoryResponse } from "@/types";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<IssueCategoryResponse | null>(null);

  const listQ = useQuery({ queryKey: ["issue-categories"], queryFn: issueCategoryApi.list });
  const form = useForm<Form>({ resolver: zodResolver(schema) });

  const createM = useMutation({
    mutationFn: issueCategoryApi.create,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["issue-categories"] });
      toast.success("Kategoria u krijua");
      setModal(null);
      form.reset();
    },
  });

  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Form }) => issueCategoryApi.update(id, body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["issue-categories"] });
      toast.success("Kategoria u përditësua");
      setModal(null);
      setSelected(null);
    },
  });

  const deleteM = useMutation({
    mutationFn: issueCategoryApi.remove,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["issue-categories"] });
      toast.success("Kategoria u fshi");
    },
  });

  const openEdit = (c: IssueCategoryResponse) => {
    setSelected(c);
    form.reset({ name: c.name, description: c.description ?? "" });
    setModal("edit");
  };

  return (
    <div>
      <PageHeader
        title="Kategoritë e kërkesave"
        description="Gruponi llojet e defektit (ujë, elektricitet, etj.) për raportime më të qarta."
        action={
          <Button className="gap-2" onClick={() => { form.reset({ name: "", description: "" }); setModal("create"); }}>
            <Plus className="h-4 w-4" /> New category
          </Button>
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
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(listQ.data ?? []).map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 font-medium text-secondary">{c.name}</td>
                    <td className="px-6 py-4 text-slate-600">{c.description || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <button type="button" className="mr-2 p-2 text-slate-500 hover:text-primary" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-slate-500 hover:text-red-600"
                        onClick={() => {
                          if (confirm("Delete category?")) deleteM.mutate(c.id);
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

      <Modal open={modal !== null} onClose={() => { setModal(null); setSelected(null); }} title={modal === "create" ? "New category" : "Edit category"}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            if (modal === "create") createM.mutate(values);
            else if (selected) updateM.mutate({ id: selected.id, body: values });
          })}
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Name</label>
            <Input {...form.register("name")} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
            <Input {...form.register("description")} />
          </div>
          <Button type="submit" className="w-full" loading={createM.isPending || updateM.isPending}>
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}

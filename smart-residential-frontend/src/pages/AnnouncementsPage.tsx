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
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { announcementApi } from "@/services/announcementService";
import { buildingApi } from "@/services/buildingService";
import { useAuth } from "@/context/AuthContext";
import type { BuildingAnnouncementResponse, CreateBuildingAnnouncementRequest } from "@/types";

const schema = z.object({
  buildingId: z.coerce.number().positive(),
  title: z.string().min(2),
  message: z.string().min(4),
});

type Form = z.infer<typeof schema>;

export default function AnnouncementsPage() {
  const qc = useQueryClient();
  const { userId } = useAuth();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<BuildingAnnouncementResponse | null>(null);

  const listQ = useQuery({ queryKey: ["announcements"], queryFn: announcementApi.list });
  const buildingsQ = useQuery({ queryKey: ["buildings"], queryFn: buildingApi.list });

  const form = useForm<Form>({ resolver: zodResolver(schema) });

  const createM = useMutation({
    mutationFn: (body: CreateBuildingAnnouncementRequest) => announcementApi.create(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Njoftimi u publikua");
      setModal(null);
      form.reset();
    },
  });

  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { title: string; message: string } }) =>
      announcementApi.update(id, body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Njoftimi u përditësua");
      setModal(null);
      setSelected(null);
    },
  });

  const deleteM = useMutation({
    mutationFn: announcementApi.remove,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Njoftimi u hoq");
    },
  });

  const openEdit = (a: BuildingAnnouncementResponse) => {
    setSelected(a);
    form.reset({ buildingId: a.buildingId, title: a.title, message: a.message });
    setModal("edit");
  };

  return (
    <div>
      <PageHeader
        title="Njoftimet"
        description="Njoftime për banorët, sipas ndërtesës."
        action={
          <Button
            className="gap-2"
            onClick={() => {
              form.reset({
                buildingId: buildingsQ.data?.[0]?.id ?? 0,
                title: "",
                message: "",
              });
              setModal("create");
            }}
          >
            <Plus className="h-4 w-4" /> New announcement
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {listQ.isLoading ? (
          <div className="flex justify-center py-20 md:col-span-2">
            <Spinner />
          </div>
        ) : (
          (listQ.data ?? []).map((a) => (
            <Card key={a.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Building #{a.buildingId}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-secondary">{a.title}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    onClick={() => openEdit(a)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => {
                      if (confirm("Delete announcement?")) deleteM.mutate(a.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 flex-1 whitespace-pre-wrap text-sm text-slate-600">{a.message}</p>
              <p className="mt-4 text-xs text-slate-400">
                {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""} · by user #{a.createdBy}
              </p>
            </Card>
          ))
        )}
      </div>

      <Modal
        open={modal !== null}
        onClose={() => {
          setModal(null);
          setSelected(null);
        }}
        title={modal === "create" ? "New announcement" : "Edit announcement"}
      >
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            if (!userId) return;
            if (modal === "create")
              createM.mutate({
                buildingId: values.buildingId,
                title: values.title,
                message: values.message,
                createdBy: userId,
              });
            else if (modal === "edit" && selected)
              updateM.mutate({ id: selected.id, body: { title: values.title, message: values.message } });
          })}
        >
          {modal === "create" ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Building</label>
              <select className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" {...form.register("buildingId")}>
                {(buildingsQ.data ?? []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Title</label>
            <Input {...form.register("title")} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Message</label>
            <Textarea {...form.register("message")} />
          </div>
          <Button type="submit" className="w-full" loading={createM.isPending || updateM.isPending}>
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}

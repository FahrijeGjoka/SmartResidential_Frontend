import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { issueApi } from "@/services/issueService";
import { apartmentApi } from "@/services/apartmentService";
import { issueCategoryApi } from "@/services/issueCategoryService";
import { useAuth } from "@/context/AuthContext";
import { isResident, isStaffOrAdmin, isTechnician } from "@/utils/roles";

const createSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  apartmentId: z.coerce.number().positive(),
  categoryId: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

export default function IssuesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { role, userId } = useAuth();
  const staff = isStaffOrAdmin(role);
  const resident = isResident(role);
  const technician = isTechnician(role);
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [lookup, setLookup] = useState("");

  const listQ = useQuery({
    queryKey: ["issues", staff ? "all" : "mine", statusFilter, userId],
    queryFn: () =>
      staff
        ? issueApi.list(statusFilter ? { status: statusFilter } : {})
        : issueApi.list({ createdById: userId! }),
    enabled: (staff || resident) && Boolean(userId),
  });

  const apartmentsQ = useQuery({ queryKey: ["apartments"], queryFn: apartmentApi.list });
  const categoriesQ = useQuery({ queryKey: ["issue-categories"], queryFn: issueCategoryApi.list });

  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { priority: "MEDIUM", apartmentId: 1, categoryId: "" },
  });

  const createM = useMutation({
    mutationFn: issueApi.create,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["issues"] });
      toast.success("Issue created");
      setModal(false);
      form.reset({ title: "", description: "", priority: "MEDIUM", apartmentId: 0, categoryId: "" });
    },
  });

  const onCreate = (values: CreateForm) => {
    createM.mutate({
      title: values.title,
      description: values.description,
      priority: values.priority,
      apartmentId: values.apartmentId,
      categoryId: values.categoryId ? Number(values.categoryId) : undefined,
    });
  };

  const priorityTone = (p: string) => {
    if (p === "HIGH" || p === "URGENT") return "danger" as const;
    if (p === "MEDIUM") return "warning" as const;
    return "default" as const;
  };

  if (technician) {
    return (
      <div>
        <PageHeader
          title="Issues"
          description="Enter an issue ID, then open it."
        />
        <Card className="max-w-md border-indigo-100/80 bg-gradient-to-br from-white to-indigo-50/40">
          <label className="mb-1 block text-xs font-medium text-slate-600">Issue ID</label>
          <div className="flex gap-2">
            <Input value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="e.g. 12" />
            <Button type="button" className="gap-2 shadow-md" onClick={() => navigate(`/app/issues/${lookup.trim()}`)}>
              <Search className="h-4 w-4" /> Open
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Issues"
        description={
          staff
            ? "View all portfolio issues and filter by status."
            : "Only issues you opened as a resident are shown here."
        }
        action={
          <Button
            className="gap-2 shadow-md"
            onClick={() => {
              const first = apartmentsQ.data?.[0]?.id;
              if (first) form.setValue("apartmentId", first);
              setModal(true);
            }}
          >
            <Plus className="h-4 w-4" /> New issue
          </Button>
        }
      />
      {staff ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {["", "OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
            <button
              key={s || "ALL"}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                statusFilter === s
                  ? "bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-primary/30"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      ) : null}
      <Card padding="p-0" className="overflow-hidden border-indigo-100/60 shadow-card">
        {listQ.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(listQ.data ?? []).map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <Link className="font-medium text-primary hover:underline" to={`/app/issues/${issue.id}`}>
                        {issue.title}
                      </Link>
                      <div className="text-xs text-slate-500">#{issue.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone="accent">{issue.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={priorityTone(issue.priority)}>{issue.priority}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {issue.updatedAt ? new Date(issue.updatedAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="New issue">
        <form className="space-y-4" onSubmit={form.handleSubmit(onCreate)}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Title</label>
            <Input {...form.register("title")} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
            <Input {...form.register("description")} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Priority</label>
            <select className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" {...form.register("priority")}>
              {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Apartment</label>
            <select className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" {...form.register("apartmentId")}>
              {(apartmentsQ.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  Unit {a.unitNumber} - building {a.buildingId}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Category (optional)</label>
            <select className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" {...form.register("categoryId")}>
              <option value="">-</option>
              {(categoriesQ.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full" loading={createM.isPending}>
            Submit issue
          </Button>
        </form>
      </Modal>
    </div>
  );
}

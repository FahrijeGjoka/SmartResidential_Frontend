import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { issueApi } from "@/services/issueService";
import { commentApi } from "@/services/commentService";
import { technicianApi } from "@/services/technicianService";
import { useAuth } from "@/context/AuthContext";
import {
  canAssignTechnician,
  canChangeIssueStatus,
  canDeleteIssue,
} from "@/utils/roles";

const STATUSES = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function IssueDetailPage() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const qc = useQueryClient();
  const { role, userId } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [assignTechUserId, setAssignTechUserId] = useState<number | "">("");
  const [comment, setComment] = useState("");

  const validId = Number.isFinite(id) && id > 0;

  const issueQ = useQuery({
    queryKey: ["issue", id],
    queryFn: () => issueApi.get(id),
    enabled: validId,
  });

  const commentsQ = useQuery({
    queryKey: ["comments", id],
    queryFn: () => commentApi.list(id),
    enabled: validId,
  });

  const techQ = useQuery({
    queryKey: ["technicians", "available"],
    queryFn: technicianApi.available,
    enabled: validId && canAssignTechnician(role),
  });

  const statusM = useMutation({
    mutationFn: (next: string) => issueApi.changeStatus(id, next),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["issue", id] });
      await qc.invalidateQueries({ queryKey: ["issues"] });
      toast.success("Statusi u përditësua");
    },
  });

  const assignM = useMutation({
    mutationFn: () => issueApi.assign(id, Number(assignTechUserId)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["issue", id] });
      await qc.invalidateQueries({ queryKey: ["issues"] });
      toast.success("Tekniku u caktua");
    },
  });

  const deleteM = useMutation({
    mutationFn: () => issueApi.remove(id),
    onSuccess: async () => {
      toast.success("Kërkesa u fshi");
      window.location.href = "/app/issues";
    },
  });

  const commentM = useMutation({
    mutationFn: () => commentApi.create(id, { userId: userId!, content: comment }),
    onSuccess: async () => {
      setComment("");
      await qc.invalidateQueries({ queryKey: ["comments", id] });
      toast.success("Komenti u shtua");
    },
  });

  const issue = issueQ.data;

  const statusControls = useMemo(() => canChangeIssueStatus(role), [role]);
  const assignControls = useMemo(() => canAssignTechnician(role), [role]);
  const deleteControls = useMemo(() => canDeleteIssue(role), [role]);

  if (!validId) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Invalid issue id.</p>
        <Link className="mt-4 inline-block text-primary" to="/app/issues">
          Back
        </Link>
      </Card>
    );
  }

  if (issueQ.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (issueQ.isError || !issue) {
    return (
      <Card>
        <p className="text-sm text-red-600">
          Nuk mund të hapet kjo kërkesë: ose numri është i gabuar, ose nuk keni leje (p.sh. si banor mund të shihni vetëm kërkesat tuaja). Nëse shfaqet shpesh «403», pyesni administratorin për rolin ose të dhënat në sistem.
        </p>
        <Link className="mt-4 inline-flex items-center gap-2 text-primary" to="/app/issues">
          <ArrowLeft className="h-4 w-4" /> Back to issues
        </Link>
      </Card>
    );
  }

  return (
    <div>
      <Link
        to="/app/issues"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> All issues
      </Link>
      <PageHeader
        title={issue.title}
        description={`Issue #${issue.id} · Apartment ${issue.apartmentId}`}
        action={
          deleteControls ? (
            <Button
              variant="danger"
              type="button"
              onClick={() => {
                if (confirm("Delete issue?")) deleteM.mutate();
              }}
            >
              Delete
            </Button>
          ) : null
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h3 className="text-sm font-semibold text-secondary">Description</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{issue.description || "—"}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="accent">{issue.status}</Badge>
              <Badge tone="primary">{issue.priority}</Badge>
              {issue.categoryId ? <Badge>Category #{issue.categoryId}</Badge> : null}
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-secondary">Comments</h3>
            <div className="mt-4 space-y-3">
              {(commentsQ.data ?? []).map((c) => (
                <div key={c.id} className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm">
                  <div className="text-xs text-slate-500">
                    User #{c.userId} · {new Date(c.timestamp).toLocaleString()}
                  </div>
                  <p className="mt-1 text-slate-800">{c.content}</p>
                </div>
              ))}
              {!commentsQ.data?.length ? <p className="text-sm text-slate-500">No comments yet.</p> : null}
            </div>
            {userId ? (
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="Write an update…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button type="button" onClick={() => comment.trim() && commentM.mutate()} loading={commentM.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </Card>
        </div>
        <div className="space-y-6">
          {statusControls ? (
            <Card>
              <h3 className="text-sm font-semibold text-secondary">Ndrysho statusin</h3>
              <div className="mt-3 flex flex-col gap-2">
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={status ?? issue.status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="secondary"
                  loading={statusM.isPending}
                  onClick={() => statusM.mutate(status ?? issue.status)}
                >
                  Apliko
                </Button>
              </div>
            </Card>
          ) : null}
          {assignControls ? (
            <Card>
              <h3 className="text-sm font-semibold text-secondary">Cakto teknikun</h3>
              <div className="mt-3 flex flex-col gap-2">
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={assignTechUserId}
                  onChange={(e) => setAssignTechUserId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">Select technician user</option>
                  {(techQ.data ?? []).map((t) => (
                    <option key={t.id} value={t.userId}>
                      User #{t.userId} · {t.specialization}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  loading={assignM.isPending}
                  disabled={assignTechUserId === ""}
                  onClick={() => assignTechUserId !== "" && assignM.mutate()}
                >
                  Cakto
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

import { useMutation, useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { sessionApi } from "@/services/sessionService";
import { decodeJwtPayload } from "@/utils/jwt";

export default function ProfilePage() {
  const { email, role, tenantIdentifier, token, logout } = useAuth();
  const claims = token ? decodeJwtPayload(token) : null;

  const sessionsQ = useQuery({
    queryKey: ["sessions", "me"],
    queryFn: sessionApi.me,
  });

  const logoutAllM = useMutation({
    mutationFn: sessionApi.logoutAll,
    onSuccess: async () => {
      await logout();
      window.location.href = "/login";
    },
  });

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Your account details and signed-in devices."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-indigo-100/60 bg-gradient-to-br from-white to-indigo-50/30">
          <h3 className="text-sm font-semibold text-secondary">Account</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Role</dt>
              <dd>
                <Badge tone="primary">{role}</Badge>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Organization</dt>
              <dd className="font-mono text-xs text-slate-800">{tenantIdentifier}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">User ID</dt>
              <dd className="font-mono text-xs">{claims?.userId ?? "-"}</dd>
            </div>
          </dl>
        </Card>
        <Card className="border-teal-100/60 bg-gradient-to-br from-white to-teal-50/30">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-secondary">Sessions</h3>
            <Button variant="ghost" className="!px-3 !py-1 text-xs" type="button" onClick={() => logoutAllM.mutate()}>
              Sign out all devices
            </Button>
          </div>
          {sessionsQ.isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {(sessionsQ.data ?? []).map((s) => (
                <li key={s.id} className="rounded-xl border border-slate-100 px-3 py-2">
                  <div className="text-xs text-slate-500">Session #{s.id}</div>
                  <div className="text-xs text-slate-500">Expires {new Date(s.expiresAt).toLocaleString()}</div>
                </li>
              ))}
              {!sessionsQ.data?.length ? <li className="text-slate-500">No sessions listed.</li> : null}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

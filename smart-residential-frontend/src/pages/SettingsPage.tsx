import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function SettingsPage() {
  const { tenantIdentifier, setTenantIdentifier } = useAuth();
  const [localTenant, setLocalTenant] = useState(tenantIdentifier ?? "");

  useEffect(() => {
    setLocalTenant(tenantIdentifier ?? "");
  }, [tenantIdentifier]);

  const save = () => {
    setTenantIdentifier(localTenant.trim());
    toast.success("Organization code saved on this device.");
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="The organization code must match the one you use at sign-in so your data maps to the right company."
      />
      <Card className="max-w-lg border-indigo-100/80 bg-gradient-to-br from-white to-indigo-50/40 shadow-card">
        <label className="mb-1 block text-xs font-medium text-slate-600">Organization code</label>
        <Input value={localTenant} onChange={(e) => setLocalTenant(e.target.value)} />
        <Button className="mt-4" type="button" onClick={save}>
          Ruaj ndryshimet
        </Button>
      </Card>
    </div>
  );
}

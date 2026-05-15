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
    toast.success("Kodi i organizatës u ruajt në këtë pajisje.");
  };

  return (
    <div>
      <PageHeader
        title="Cilësimet"
        description="Kodi i organizatës duhet të jetë i njëjtë me atë që përdorni në hyrje, që të përputhen të dhënat me kompaninë tuaj."
      />
      <Card className="max-w-lg border-indigo-100/80 bg-gradient-to-br from-white to-indigo-50/40 shadow-card">
        <label className="mb-1 block text-xs font-medium text-slate-600">Kodi i organizatës</label>
        <Input value={localTenant} onChange={(e) => setLocalTenant(e.target.value)} />
        <Button className="mt-4" type="button" onClick={save}>
          Ruaj ndryshimet
        </Button>
      </Card>
    </div>
  );
}

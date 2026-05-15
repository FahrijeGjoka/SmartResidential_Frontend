import { useQuery } from "@tanstack/react-query";
import { Building2, Layers, Megaphone, Wrench } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { isResident, isStaffOrAdmin, isTechnician } from "@/utils/roles";
import { buildingApi } from "@/services/buildingService";
import { apartmentApi } from "@/services/apartmentService";
import { issueApi } from "@/services/issueService";
import { announcementApi } from "@/services/announcementService";

function Stat({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: typeof Building2;
  hint?: string;
}) {
  return (
    <Card className="flex flex-col justify-between !p-5 ring-1 ring-slate-100/80 transition hover:ring-primary/20 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-secondary">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <div className="rounded-xl bg-gradient-to-br from-primary/15 via-indigo-500/10 to-accent/20 p-2.5 text-primary shadow-inner">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { role, userId } = useAuth();
  const staff = isStaffOrAdmin(role);
  const resident = isResident(role);
  const technician = isTechnician(role);

  const buildingsQ = useQuery({
    queryKey: ["buildings"],
    queryFn: buildingApi.list,
    enabled: staff,
  });
  const apartmentsQ = useQuery({
    queryKey: ["apartments"],
    queryFn: apartmentApi.list,
    enabled: staff,
  });
  const issuesStaffQ = useQuery({
    queryKey: ["issues", "all"],
    queryFn: () => issueApi.list(),
    enabled: staff,
  });
  const issuesMineQ = useQuery({
    queryKey: ["issues", "mine", userId],
    queryFn: () => issueApi.list({ createdById: userId! }),
    enabled: Boolean(userId) && resident,
  });
  const announcementsQ = useQuery({
    queryKey: ["announcements"],
    queryFn: announcementApi.list,
  });

  const loading =
    announcementsQ.isLoading ||
    (staff && (buildingsQ.isLoading || apartmentsQ.isLoading || issuesStaffQ.isLoading)) ||
    (resident && issuesMineQ.isLoading);

  const buildings = buildingsQ.data?.length ?? (staff ? undefined : 0);
  const apartments = apartmentsQ.data?.length ?? (staff ? undefined : 0);
  const issuesCount = staff
    ? issuesStaffQ.data?.length
    : resident
      ? issuesMineQ.data?.length
      : undefined;
  const announcements = announcementsQ.data?.length ?? 0;

  return (
    <div>
      <PageHeader
        title="Pulti kryesor"
        description="Përmbledhje e shpejtë: ndërtesa, apartamente, kërkesat dhe njoftimet — sipas rolit tuaj në sistem."
      />
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <>
          {technician ? (
            <Card className="mb-6 border-teal-200/80 bg-gradient-to-r from-teal-50 via-white to-indigo-50 !p-4 text-sm text-teal-950 shadow-sm">
              Si teknik, punoni mbi çështje specifike: hapni një kërkesë me numrin e saj nga faqja «Kërkesat e shërbimit».
            </Card>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {staff ? (
              <>
                <Stat label="Ndërtesa" value={buildings ?? "—"} icon={Building2} />
                <Stat label="Apartamentet" value={apartments ?? "—"} icon={Layers} />
                <Stat label="Kërkesat" value={issuesCount ?? "—"} icon={Wrench} />
                <Stat label="Njoftimet" value={announcements} icon={Megaphone} />
              </>
            ) : resident ? (
              <>
                <Stat
                  label="Kërkesat e mia"
                  value={issuesCount ?? "—"}
                  icon={Wrench}
                  hint="Listohen vetëm kërkesat që keni hapur ju."
                />
                <Stat label="Njoftimet" value={announcements} icon={Megaphone} />
              </>
            ) : (
              <>
                <Stat
                  label="Hapësira e teknikut"
                  value="Sipas kërkesës"
                  icon={Wrench}
                  hint="Përdorni kërkimin me ID në faqen e kërkesave."
                />
                <Stat label="Njoftimet" value={announcements} icon={Megaphone} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

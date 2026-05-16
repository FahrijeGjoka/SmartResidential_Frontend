import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { tenantApi } from "@/services/tenantService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  name: z.string().min(2),
  identifier: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/i, "Letters, numbers, and hyphens are allowed"),
  schemaName: z
    .string()
    .min(2)
    .regex(/^[a-z_][a-z0-9_]*$/i, "Letters, numbers, and underscores are allowed (e.g. tenant_name)"),
});

type Form = z.infer<typeof schema>;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setTenantIdentifier } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      localStorage.removeItem("sr_tenant_identifier");
      const res = await tenantApi.create({
        name: data.name,
        identifier: data.identifier,
        schemaName: data.schemaName,
      });
      setTenantIdentifier(res.identifier);
      toast.success("Organization created. Save the code. You will need it for sign-in and resident registration.");
      navigate("/register", { replace: true });
    } catch {
      /* axios */
    }
  };

  return (
    <div className="relative mx-auto max-w-xl px-4 py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-100/80 to-transparent" />
      <div className="relative">
      <PageHeader
        title="Create organization"
        description="The first step for your company: name, public code, and database name. Save the code after it is created."
      />
      <Card className="border-indigo-100/80 bg-gradient-to-br from-white to-indigo-50/50 shadow-card">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Company name</label>
            <Input {...register("name")} />
            {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Kodi publik (slug)</label>
            <Input placeholder="e.g. skyline-towers" {...register("identifier")} />
            {errors.identifier ? (
              <p className="mt-1 text-xs text-red-600">{errors.identifier.message}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Database name</label>
            <Input placeholder="e.g. tenant_skyline" {...register("schemaName")} />
            {errors.schemaName ? (
              <p className="mt-1 text-xs text-red-600">{errors.schemaName.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full shadow-md" loading={isSubmitting}>
            Create organization
          </Button>
        </form>
      </Card>
      </div>
    </div>
  );
}

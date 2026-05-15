import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  tenantIdentifier: z.string().min(1, "Shkruani kodin e organizatës"),
  email: z.string().email("Email jo i vlefshëm"),
  password: z.string().min(1, "Shkruani fjalëkalimin"),
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, setTenantIdentifier } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      setTenantIdentifier(data.tenantIdentifier);
      await login({
        email: data.email,
        password: data.password,
        tenantIdentifier: data.tenantIdentifier,
      });
      toast.success("Mirë se vini!");
      navigate("/app/dashboard", { replace: true });
    } catch {
      /* toast from axios */
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-teal-100 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.15),transparent_45%)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-accent text-white shadow-lg ring-4 ring-white/60">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 bg-gradient-to-r from-secondary via-indigo-800 to-primary bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            SmartResidential
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
            Shkruani kodin e organizatës që ju dha administratori, pastaj emailin dhe fjalëkalimin.
          </p>
        </div>
        <Card className="border-indigo-100/80 bg-white/90 shadow-xl backdrop-blur-sm">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Kodi i organizatës</label>
              <Input placeholder="p.sh. skyline-towers" {...register("tenantIdentifier")} />
              {errors.tenantIdentifier ? (
                <p className="mt-1 text-xs text-red-600">{errors.tenantIdentifier.message}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
              <Input type="email" autoComplete="email" {...register("email")} />
              {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Password</label>
              <Input type="password" autoComplete="current-password" {...register("password")} />
              {errors.password ? (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full shadow-md" loading={isSubmitting}>
              Hyr
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            Banor i ri?{" "}
            <Link className="font-medium text-primary hover:underline" to="/register">
              Krijo llogari
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-600">
            Organizatë e re?{" "}
            <Link className="font-medium text-accent hover:underline" to="/onboarding">
              Regjistro kompaninë
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

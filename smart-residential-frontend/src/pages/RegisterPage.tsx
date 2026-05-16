import { Link } from "react-router-dom";
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
  tenantIdentifier: z.string().min(1, "Organization code is required"),
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: signup, setTenantIdentifier } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      setTenantIdentifier(data.tenantIdentifier);
      await signup({
        tenantIdentifier: data.tenantIdentifier,
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      toast.success("Registration received. Check your email to verify the account before signing in.");
    } catch {
      /* axios */
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-teal-100 via-white to-indigo-100 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(20,184,166,0.18),transparent_40%),radial-gradient(ellipse_at_80%_60%,rgba(99,102,241,0.14),transparent_45%)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent via-teal-600 to-primary text-white shadow-lg ring-4 ring-white/60">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-secondary sm:text-3xl">Create resident account</h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
            Use the same organization code provided by your building operator or company.
          </p>
        </div>
        <Card className="border-teal-100/80 bg-white/90 shadow-xl backdrop-blur-sm">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Organization code</label>
              <Input placeholder="e.g. skyline-towers" {...register("tenantIdentifier")} />
              {errors.tenantIdentifier ? (
                <p className="mt-1 text-xs text-red-600">{errors.tenantIdentifier.message}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Full name</label>
              <Input {...register("fullName")} />
              {errors.fullName ? <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
              <Input type="email" {...register("email")} />
              {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Password</label>
              <Input type="password" {...register("password")} />
              {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
            </div>
            <Button type="submit" className="w-full shadow-md" loading={isSubmitting}>
              Submit registration
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            Already verified your email?{" "}
            <Link className="font-medium text-primary hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { ArrowRight, Building2, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-soft">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-secondary">SmartResidential</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/onboarding">
              <Button variant="ghost" className="hidden sm:inline-flex">
                New organization
              </Button>
            </Link>
            <Link to="/login">
              <Button>Sign in</Button>
            </Link>
          </div>
        </div>
      </header>
      <main>
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 md:px-8 md:pt-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Premium residential operations
            </div>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-secondary md:text-5xl">
              Operate buildings, residents, and maintenance in one calm workspace.
            </h1>
            <p className="mt-5 text-lg text-slate-600">
              SmartResidential pairs a multi-tenant Spring Boot API with a modern dashboard for
              staff, technicians, and residents - tuned for real apartment portfolios.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/onboarding">
                <Button className="gap-2">
                  Create your workspace <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="ghost">Resident registration</Button>
              </Link>
            </div>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Portfolio clarity",
                body: "Buildings, units, and resident profiles stay structured for leasing and operations teams.",
                icon: Building2,
              },
              {
                title: "Issues",
                body: "Residents open issues; staff triage, assign technicians, and track status through resolution.",
                icon: Shield,
              },
              {
                title: "Announcements",
                body: "Broadcast building updates with a polished, timestamped feed across your organization.",
                icon: Sparkles,
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <c.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold text-secondary">{c.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{c.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

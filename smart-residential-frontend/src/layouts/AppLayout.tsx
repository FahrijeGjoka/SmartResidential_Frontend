import { Link, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";

export function AppLayout() {
  const { email, role, tenantIdentifier, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-transparent">
      <div className={cn("fixed inset-0 z-40 bg-slate-900/40 md:hidden", open ? "block" : "hidden")} onClick={() => setOpen(false)} />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-indigo-100/50 bg-gradient-to-b from-white via-slate-50/90 to-teal-50/30 shadow-lg transition md:static md:translate-x-0 md:shadow-none",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        )}
      >
        <Sidebar onNavigate={() => setOpen(false)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-indigo-100/60 bg-gradient-to-r from-white/95 via-blue-50/50 to-teal-50/40 px-4 py-3 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-slate-200 p-2 text-slate-700 md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden min-w-0 sm:block">
              <div className="truncate text-sm font-medium text-secondary">{email}</div>
              <div className="truncate text-xs text-slate-500">
                {role?.replace("ROLE_", "")} · Organizata:{" "}
                <span className="font-medium text-indigo-700">{tenantIdentifier}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden text-sm font-medium text-indigo-700 hover:text-primary sm:inline">
              Faqja kryesore
            </Link>
            <Button type="button" variant="ghost" className="!px-3" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Dil</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

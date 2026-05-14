import { NavLink } from "react-router-dom";
import {
  Building2,
  Home,
  Layers,
  Users,
  Wrench,
  Megaphone,
  Bell,
  CreditCard,
  UserCircle,
  Settings,
  Shield,
  Tags,
  Users2,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/context/AuthContext";
import { isStaffOrAdmin, isAdmin } from "@/utils/roles";

const linkBase =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white/80 hover:text-indigo-900";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { role } = useAuth();
  const staff = isStaffOrAdmin(role);
  const admin = isAdmin(role);

  const Item = ({ to, icon: Icon, label }: { to: string; icon: typeof Home; label: string }) => (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(linkBase, isActive && "bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md hover:text-white")
      }
    >
      <Icon className="h-5 w-5 shrink-0 opacity-80" />
      {label}
    </NavLink>
  );

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-indigo-100/40 bg-transparent">
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-indigo-600 to-accent text-white shadow-lg ring-2 ring-white/50">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-secondary">SmartResidential</div>
          <div className="text-xs text-slate-500">Resident suite</div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-6">
        <Item to="/app/dashboard" icon={Home} label="Dashboard" />
        {staff ? <Item to="/app/buildings" icon={Building2} label="Buildings" /> : null}
        {staff ? <Item to="/app/apartments" icon={Layers} label="Apartments" /> : null}
        {staff ? <Item to="/app/residents" icon={Users} label="Residents" /> : null}
        <Item to="/app/issues" icon={Wrench} label="Service issues" />
        <Item to="/app/maintenance" icon={ClipboardList} label="Maintenance requests" />
        <Item to="/app/announcements" icon={Megaphone} label="Announcements" />
        <Item to="/app/notifications" icon={Bell} label="Notifications" />
        {staff ? <Item to="/app/technicians" icon={Users2} label="Technicians" /> : null}
        {staff ? <Item to="/app/categories" icon={Tags} label="Issue categories" /> : null}
        {admin ? <Item to="/app/admin/users" icon={Shield} label="Admin · Users" /> : null}
        <Item to="/app/billing" icon={CreditCard} label="Billing" />
        <Item to="/app/profile" icon={UserCircle} label="Profile" />
        <Item to="/app/settings" icon={Settings} label="Settings" />
      </nav>
    </aside>
  );
}

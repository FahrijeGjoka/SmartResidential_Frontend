import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isAdmin, isStaffOrAdmin } from "@/utils/roles";

export function StaffRoute({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  return isStaffOrAdmin(role) ? <>{children}</> : <Navigate to="/app/dashboard" replace />;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  return isAdmin(role) ? <>{children}</> : <Navigate to="/app/dashboard" replace />;
}

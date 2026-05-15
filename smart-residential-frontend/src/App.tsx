import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute, StaffRoute } from "@/components/auth/RoleRoutes";
import { AppLayout } from "@/layouts/AppLayout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import OnboardingPage from "@/pages/OnboardingPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import DashboardPage from "@/pages/DashboardPage";
import BuildingsPage from "@/pages/BuildingsPage";
import ApartmentsPage from "@/pages/ApartmentsPage";
import ResidentsPage from "@/pages/ResidentsPage";
import IssuesPage from "@/pages/IssuesPage";
import IssueDetailPage from "@/pages/IssueDetailPage";
import MaintenancePage from "@/pages/MaintenancePage";
import AnnouncementsPage from "@/pages/AnnouncementsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import CategoriesPage from "@/pages/CategoriesPage";
import TechniciansPage from "@/pages/TechniciansPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import BillingPage from "@/pages/BillingPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="buildings"
          element={
            <StaffRoute>
              <BuildingsPage />
            </StaffRoute>
          }
        />
        <Route
          path="apartments"
          element={
            <StaffRoute>
              <ApartmentsPage />
            </StaffRoute>
          }
        />
        <Route
          path="residents"
          element={
            <StaffRoute>
              <ResidentsPage />
            </StaffRoute>
          }
        />
        <Route path="issues" element={<IssuesPage />} />
        <Route path="issues/:id" element={<IssueDetailPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route
          path="technicians"
          element={
            <StaffRoute>
              <TechniciansPage />
            </StaffRoute>
          }
        />
        <Route
          path="categories"
          element={
            <StaffRoute>
              <CategoriesPage />
            </StaffRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route path="billing" element={<BillingPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

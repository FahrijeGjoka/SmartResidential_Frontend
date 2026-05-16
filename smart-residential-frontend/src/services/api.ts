import axios, { type AxiosError } from "axios";
import { toast } from "sonner";
import { userFacingHttpMessage } from "@/utils/httpErrors";

const TOKEN_KEY = "sr_access_token";
const TENANT_KEY = "sr_tenant_identifier";
const EMAIL_KEY = "sr_email";
const ROLE_KEY = "sr_role";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredTenantIdentifier() {
  return localStorage.getItem(TENANT_KEY);
}

export function persistSession(params: {
  token: string;
  tenantIdentifier: string;
  email: string;
  role: string;
}) {
  localStorage.setItem(TOKEN_KEY, params.token);
  localStorage.setItem(TENANT_KEY, params.tenantIdentifier);
  localStorage.setItem(EMAIL_KEY, params.email);
  localStorage.setItem(ROLE_KEY, params.role);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TENANT_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function getStoredEmail() {
  return localStorage.getItem(EMAIL_KEY);
}

export function getStoredRole() {
  return localStorage.getItem(ROLE_KEY);
}

const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  (import.meta.env.DEV ? "" : "http://localhost:8080");

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  const tenant = getStoredTenantIdentifier();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (tenant) {
    config.headers["X-Tenant-Identifier"] = tenant;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const serverRaw =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "";
    const status = error.response?.status;
    if (status === 401) {
      const onAuthPage =
        window.location.pathname.startsWith("/login") ||
        window.location.pathname.startsWith("/register");
      if (!onAuthPage) {
        clearSession();
        toast.error("Your session expired. Please sign in again.");
        window.location.assign("/login");
      }
    } else if (status && status >= 400) {
      toast.error(userFacingHttpMessage(status, serverRaw));
    }
    return Promise.reject(error);
  }
);

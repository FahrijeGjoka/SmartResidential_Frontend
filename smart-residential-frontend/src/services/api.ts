import axios from "axios";
import { toast } from "sonner";
import { getErrorMessages } from "@/utils/apiErrors";

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
  (error) => {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;

    if (status === 401) {
      const onAuthPage =
        window.location.pathname.startsWith("/login") ||
        window.location.pathname.startsWith("/register");

      if (!onAuthPage) {
        clearSession();
        toast.error("Session expired. Please sign in again.");
        window.location.assign("/login");
      } else {
        toastErrorMessages(error);
      }
    } else if ((status && status >= 400) || !status) {
      toastErrorMessages(error);
    }

    return Promise.reject(error);
  }
);

function toastErrorMessages(error: unknown) {
  const messages = getErrorMessages(error);

  if (messages.length === 1) {
    toast.error(messages[0]);
    return;
  }

  toast.error("Please fix the following errors:", {
    description: messages.join("\n"),
  });
}

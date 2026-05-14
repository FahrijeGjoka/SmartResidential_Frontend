import { api } from "./api";
import type { SessionEntity } from "@/types";

export const sessionApi = {
  me: () => api.get<SessionEntity[]>("/api/sessions/me").then((r) => r.data),
  validate: () => api.get<boolean>("/api/sessions/validate").then((r) => r.data),
  logout: () => api.post("/api/sessions/logout"),
  logoutAll: () => api.delete("/api/sessions/logout-all"),
};

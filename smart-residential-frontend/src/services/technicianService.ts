import { api } from "./api";
import type { TechnicianProfileResponse } from "@/types";

export const technicianApi = {
  list: () => api.get<TechnicianProfileResponse[]>("/api/technicians").then((r) => r.data),
  available: () =>
    api.get<TechnicianProfileResponse[]>("/api/technicians/available").then((r) => r.data),
  byUser: (userId: number) =>
    api.get<TechnicianProfileResponse>(`/api/technicians/user/${userId}`).then((r) => r.data),
};

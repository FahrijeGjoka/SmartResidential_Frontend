import { api } from "./api";
import type {
  CreateMaintenanceRequestRequest,
  MaintenanceRequestResponse,
} from "@/types";

export const maintenanceApi = {
  list: () =>
    api.get<MaintenanceRequestResponse[]>("/api/maintenance-requests").then((r) => r.data),
  get: (id: number) =>
    api.get<MaintenanceRequestResponse>(`/api/maintenance-requests/${id}`).then((r) => r.data),
  create: (body: CreateMaintenanceRequestRequest) =>
    api.post<MaintenanceRequestResponse>("/api/maintenance-requests", body).then((r) => r.data),
  existsForIssue: (issueId: number) =>
    api.get<boolean>(`/api/maintenance-requests/exists/${issueId}`).then((r) => r.data),
};

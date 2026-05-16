import { api } from "./api";
import type { AuditLogResponseDTO } from "@/types";

export interface CreateAuditLogRequest {
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
}

export const auditLogApi = {
  log: (request: CreateAuditLogRequest) =>
    api.post<void>("/api/audit-logs", request),

  getAll: () =>
    api.get<AuditLogResponseDTO[]>("/api/audit-logs").then((r) => r.data),

  getByUser: (userId: number) =>
    api.get<AuditLogResponseDTO[]>(`/api/audit-logs/user/${userId}`).then((r) => r.data),

  getByEntity: (entityId: number) =>
    api.get<AuditLogResponseDTO[]>(`/api/audit-logs/entity/${entityId}`).then((r) => r.data),
};
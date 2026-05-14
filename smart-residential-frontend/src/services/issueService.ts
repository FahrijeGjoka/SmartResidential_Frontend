import { api } from "./api";
import type {
  CreateIssueRequest,
  IssueResponse,
  UpdateIssueRequest,
} from "@/types";

export type IssueListParams = {
  status?: string;
  priority?: string;
  categoryId?: number;
  apartmentId?: number;
  createdById?: number;
  title?: string;
};

export const issueApi = {
  list: (params?: IssueListParams) =>
    api.get<IssueResponse[]>("/api/issues", { params }).then((r) => r.data),
  get: (id: number) => api.get<IssueResponse>(`/api/issues/${id}`).then((r) => r.data),
  create: (body: CreateIssueRequest) =>
    api.post<IssueResponse>("/api/issues", body).then((r) => r.data),
  update: (id: number, body: UpdateIssueRequest) =>
    api.put<IssueResponse>(`/api/issues/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/api/issues/${id}`),
  changeStatus: (id: number, newStatus: string) =>
    api.patch<IssueResponse>(`/api/issues/${id}/status`, { newStatus }).then((r) => r.data),
  assign: (id: number, technicianId: number) =>
    api.post<IssueResponse>(`/api/issues/${id}/assign`, { technicianId }).then((r) => r.data),
};

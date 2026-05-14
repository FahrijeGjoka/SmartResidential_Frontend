import { api } from "./api";
import type {
  CreateIssueCategoryRequest,
  IssueCategoryResponse,
  UpdateIssueCategoryRequest,
} from "@/types";

export const issueCategoryApi = {
  list: () => api.get<IssueCategoryResponse[]>("/api/issue-categories").then((r) => r.data),
  get: (id: number) =>
    api.get<IssueCategoryResponse>(`/api/issue-categories/${id}`).then((r) => r.data),
  create: (body: CreateIssueCategoryRequest) =>
    api.post<IssueCategoryResponse>("/api/issue-categories", body).then((r) => r.data),
  update: (id: number, body: UpdateIssueCategoryRequest) =>
    api.put<IssueCategoryResponse>(`/api/issue-categories/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/api/issue-categories/${id}`),
};

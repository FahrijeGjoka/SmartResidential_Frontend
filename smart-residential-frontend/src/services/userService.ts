import { api } from "./api";
import type { CreateUserRequest, User } from "@/types";

export const userApi = {
  list: () => api.get<User[]>("/api/users").then((r) => r.data),
  listActive: () => api.get<User[]>("/api/users/active").then((r) => r.data),
  get: (id: number) => api.get<User>(`/api/users/${id}`).then((r) => r.data),
  byRole: (roleId: number) => api.get<User[]>(`/api/users/role/${roleId}`).then((r) => r.data),
  create: (body: CreateUserRequest) => api.post<User>("/api/users", body).then((r) => r.data),
  update: (id: number, body: CreateUserRequest) => api.put<User>(`/api/users/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/api/users/${id}`),
  deactivate: (id: number) => api.patch<User>(`/api/users/${id}/deactivate`).then((r) => r.data),
  activate: (id: number) => api.patch<User>(`/api/users/${id}/activate`).then((r) => r.data),
  makeStaff: (id: number) => api.patch<User>(`/api/users/${id}/make-staff`).then((r) => r.data),
  makeTechnician: (id: number) =>
    api.patch<User>(`/api/users/${id}/make-technician`).then((r) => r.data),
};

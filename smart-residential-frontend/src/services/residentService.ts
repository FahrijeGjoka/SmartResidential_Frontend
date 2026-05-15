import { api } from "./api";
import type {
  CreateResidentProfileRequest,
  ResidentProfileResponse,
  UpdateResidentProfileRequest,
} from "@/types";

export const residentApi = {
  list: () => api.get<ResidentProfileResponse[]>("/api/resident-profiles").then((r) => r.data),
  byBuilding: (buildingId: number) =>
    api
      .get<ResidentProfileResponse[]>(`/api/resident-profiles/building/${buildingId}`)
      .then((r) => r.data),
  get: (id: number) =>
    api.get<ResidentProfileResponse>(`/api/resident-profiles/${id}`).then((r) => r.data),
  create: (body: CreateResidentProfileRequest) =>
    api.post<ResidentProfileResponse>("/api/resident-profiles", body).then((r) => r.data),
  update: (id: number, body: UpdateResidentProfileRequest) =>
    api.put<ResidentProfileResponse>(`/api/resident-profiles/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/api/resident-profiles/${id}`),
};

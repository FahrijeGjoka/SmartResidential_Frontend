import { api } from "./api";
import type {
  BuildingResponse,
  CreateBuildingRequest,
  UpdateBuildingRequest,
} from "@/types";

export const buildingApi = {
  list: () => api.get<BuildingResponse[]>("/api/buildings").then((r) => r.data),
  get: (id: number) => api.get<BuildingResponse>(`/api/buildings/${id}`).then((r) => r.data),
  create: (body: CreateBuildingRequest) =>
    api.post<BuildingResponse>("/api/buildings", body).then((r) => r.data),
  update: (id: number, body: UpdateBuildingRequest) =>
    api.put<BuildingResponse>(`/api/buildings/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/api/buildings/${id}`),
};

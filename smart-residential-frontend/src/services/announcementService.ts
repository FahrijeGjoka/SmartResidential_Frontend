import { api } from "./api";
import type {
  BuildingAnnouncementResponse,
  CreateBuildingAnnouncementRequest,
  UpdateBuildingAnnouncementRequest,
} from "@/types";

export const announcementApi = {
  list: () =>
    api.get<BuildingAnnouncementResponse[]>("/api/announcements").then((r) => r.data),
  byBuilding: (buildingId: number) =>
    api
      .get<BuildingAnnouncementResponse[]>(`/api/announcements/building/${buildingId}`)
      .then((r) => r.data),
  get: (id: number) =>
    api.get<BuildingAnnouncementResponse>(`/api/announcements/${id}`).then((r) => r.data),
  create: (body: CreateBuildingAnnouncementRequest) =>
    api.post<BuildingAnnouncementResponse>("/api/announcements", body).then((r) => r.data),
  update: (id: number, body: UpdateBuildingAnnouncementRequest) =>
    api.put<BuildingAnnouncementResponse>(`/api/announcements/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/api/announcements/${id}`),
};

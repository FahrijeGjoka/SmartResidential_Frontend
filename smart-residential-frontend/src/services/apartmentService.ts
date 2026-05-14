import { api } from "./api";
import type {
  ApartmentResponse,
  CreateApartmentRequest,
  UpdateApartmentRequest,
} from "@/types";

export const apartmentApi = {
  list: () => api.get<ApartmentResponse[]>("/api/apartments").then((r) => r.data),
  byBuilding: (buildingId: number) =>
    api.get<ApartmentResponse[]>(`/api/apartments/building/${buildingId}`).then((r) => r.data),
  get: (id: number) => api.get<ApartmentResponse>(`/api/apartments/${id}`).then((r) => r.data),
  create: (body: CreateApartmentRequest) =>
    api.post<ApartmentResponse>("/api/apartments", body).then((r) => r.data),
  update: (id: number, body: UpdateApartmentRequest) =>
    api.put<ApartmentResponse>(`/api/apartments/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/api/apartments/${id}`),
};

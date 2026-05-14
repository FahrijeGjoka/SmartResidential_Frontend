import { api } from "./api";
import type { Role } from "@/types";

export const roleApi = {
  list: () => api.get<Role[]>("/api/roles").then((r) => r.data),
};

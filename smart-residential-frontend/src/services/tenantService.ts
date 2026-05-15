import { api } from "./api";
import type { CreateTenantRequest, CreateTenantResponse } from "@/types";

export const tenantApi = {
  create(body: CreateTenantRequest) {
    return api.post<CreateTenantResponse>("/api/tenants", body).then((r) => r.data);
  },
};

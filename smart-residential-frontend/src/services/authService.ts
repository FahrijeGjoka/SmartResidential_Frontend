import { api } from "./api";
import type { LoginRequest, LoginResponse, RegisterRequest } from "@/types";

export const authApi = {
  login(body: LoginRequest) {
    return api.post<LoginResponse>("/api/auth/login", body).then((r) => r.data);
  },
  signup(body: RegisterRequest) {
    return api.post<string>("/api/auth/signup", body).then((r) => r.data);
  },
};

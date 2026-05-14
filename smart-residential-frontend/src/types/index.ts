/** DTOs aligned with Spring Boot backend (SmartResidential). */

export type LoginRequest = { email: string; password: string };
export type LoginResponse = { token: string; email: string; role: string };
export type RegisterRequest = { fullName: string; email: string; password: string };

export type CreateTenantRequest = { name: string; schemaName: string; identifier: string };
export type CreateTenantResponse = {
  id: number;
  name: string;
  schemaName: string;
  identifier: string;
  isActive: boolean;
};

export type BuildingResponse = {
  id: number;
  name: string;
  address: string;
  createdAt: string;
};
export type CreateBuildingRequest = { name: string; address: string };
export type UpdateBuildingRequest = { name?: string; address?: string };

export type ApartmentResponse = {
  id: number;
  buildingId: number;
  unitNumber: string;
  floor: number;
  createdAt: string;
};
export type CreateApartmentRequest = { buildingId: number; unitNumber: string; floor: number };
export type UpdateApartmentRequest = {
  buildingId?: number;
  unitNumber?: string;
  floor?: number;
};

export type ResidentProfileResponse = {
  id: number;
  userId: number;
  apartmentId: number;
  movedInAt: string;
};
export type CreateResidentProfileRequest = {
  userId: number;
  apartmentId: number;
  movedInAt?: string;
};
export type UpdateResidentProfileRequest = {
  userId?: number;
  apartmentId?: number;
  movedInAt?: string;
};

export type IssueResponse = {
  id: number;
  createdById: number;
  apartmentId: number;
  categoryId: number | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
};
export type CreateIssueRequest = {
  title: string;
  description?: string;
  priority: string;
  apartmentId: number;
  categoryId?: number | null;
};
export type UpdateIssueRequest = Partial<{
  apartmentId: number;
  categoryId: number;
  title: string;
  description: string;
  status: string;
  priority: string;
}>;

export type IssueCategoryResponse = { id: number; name: string; description: string | null };
export type CreateIssueCategoryRequest = { name: string; description?: string };
export type UpdateIssueCategoryRequest = { name?: string; description?: string };

export type MaintenanceRequestResponse = {
  id: number;
  issueId: number;
  requestedById: number;
  description: string | null;
  requestedAt: string;
};
export type CreateMaintenanceRequestRequest = {
  issueId: number;
  requestedById: number;
  description?: string;
};

export type BuildingAnnouncementResponse = {
  id: number;
  buildingId: number;
  title: string;
  message: string;
  createdBy: number;
  createdAt: string;
};
export type CreateBuildingAnnouncementRequest = {
  buildingId: number;
  title: string;
  message: string;
  createdBy: number;
};
export type UpdateBuildingAnnouncementRequest = {
  title?: string;
  message?: string;
  buildingId?: number;
  createdBy?: number;
};

export type User = {
  id: number;
  email: string;
  passwordHash: string;
  firstName: string | null;
  lastName: string | null;
  roleId: number;
  isActive: boolean;
  createdAt?: string;
};
export type CreateUserRequest = {
  email: string;
  password: string;
  roleId: number;
  tenantId: number;
  firstName: string;
  lastName: string;
};

export type Role = { id: number; name: string };

export type NotificationResponse = {
  id: number;
  userId: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export type TechnicianProfileResponse = {
  id: number;
  userId: number;
  specialization: string;
  isAvailable: boolean;
};

export type CommentResponse = {
  id: number;
  userId: number;
  content: string;
  timestamp: string;
};
export type CommentRequest = { userId: number; content: string };

export type SessionEntity = {
  id: number;
  token: string;
  expiresAt: string;
  createdAt: string;
  user?: User;
};

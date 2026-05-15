export function normalizeRole(role: string | null | undefined): string {
  return (role || "").trim();
}

export function isAdmin(role: string | null | undefined) {
  return normalizeRole(role) === "ROLE_ADMIN";
}

export function isStaff(role: string | null | undefined) {
  return normalizeRole(role) === "ROLE_STAFF";
}

export function isTechnician(role: string | null | undefined) {
  return normalizeRole(role) === "ROLE_TECHNICIAN";
}

export function isResident(role: string | null | undefined) {
  return normalizeRole(role) === "ROLE_RESIDENT";
}

/** Staff operations: buildings, apartments, full issue list, announcements CRUD, etc. */
export function isStaffOrAdmin(role: string | null | undefined) {
  return isAdmin(role) || isStaff(role);
}

export function canManageIssuesBoard(role: string | null | undefined) {
  return isStaffOrAdmin(role);
}

export function canChangeIssueStatus(role: string | null | undefined) {
  return isAdmin(role) || isStaff(role) || isTechnician(role);
}

export function canAssignTechnician(role: string | null | undefined) {
  return isAdmin(role) || isStaff(role);
}

export function canDeleteIssue(role: string | null | undefined) {
  return isAdmin(role);
}

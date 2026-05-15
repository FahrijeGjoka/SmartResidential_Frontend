export type JwtClaims = {
  sub?: string;
  userId?: number | string;
  id?: number | string;
  user_id?: number | string;
  tenantId?: number | string;
  tenant_id?: number | string;
  identifier?: string;
  schemaName?: string;
  roleName?: number | string;
  exp?: number;
  [claim: string]: unknown;
};

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((segment.length + 3) % 4);
  return decodeURIComponent(
    atob(padded)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

/** Decode JWT payload for UI claims only — authorization is always enforced by the API. */
export function decodeJwtPayload(token: string): JwtClaims | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

export function numericJwtClaim(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

/** User-friendly messages without leaking low-level API details. */

export function userFacingHttpMessage(status: number | undefined, serverText: string): string {
  const raw = (serverText || "").trim();
  const lower = raw.toLowerCase();

  if (status === 403) {
    return "You do not have access (403). Your role may not allow this action, or required system data may be missing.";
  }

  if (status === 400) {
    if (lower.includes("tenant") && lower.includes("jwt")) {
      return "The organization on this device does not match your session. Sign out and sign in again with the same organization code.";
    }
    if (lower.includes("invalid tenant") || lower.includes("tenant identifier")) {
      return "The organization code is not correct. Check it with your administrator or in Settings.";
    }
  }

  if (status === 404) {
    return "No data was found.";
  }

  if (status === 401) {
    if (
      lower.includes("invalid") ||
      lower.includes("password") ||
      lower.includes("email") ||
      lower.includes("credentials")
    ) {
      return "The email or password is incorrect, or the account has not been activated yet.";
    }
    return raw || "Please sign in again.";
  }

  if (/^(get|post|put|patch|delete)\s+\//i.test(raw) || raw.includes("/api/")) {
    return "A server connection error occurred. Try again or contact support.";
  }

  return raw || "Something went wrong. Please try again.";
}

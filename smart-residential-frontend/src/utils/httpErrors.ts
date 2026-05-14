/** Mesazhe të lexueshme për përdoruesin — pa detaje teknike të API-së. */

export function userFacingHttpMessage(status: number | undefined, serverText: string): string {
  const raw = (serverText || "").trim();
  const lower = raw.toLowerCase();

  if (status === 403) {
    return "Nuk keni akses (403). Zakonisht: roli juaj nuk lejon këtë veprim, ose në sistem ende nuk ka të dhëna të nevojshme (p.sh. lista e plotë vetëm për staf).";
  }

  if (status === 400) {
    if (lower.includes("tenant") && lower.includes("jwt")) {
      return "Organizata në pajisjen tuaj nuk përputhet me sesionin. Dilni dhe hy përsëri me të njëjtin kod organizate.";
    }
    if (lower.includes("invalid tenant") || lower.includes("tenant identifier")) {
      return "Kodi i organizatës nuk është i saktë. Kontrollojeni te administratori ose te Cilësimet.";
    }
  }

  if (status === 404) {
    return "Nuk u gjetën të dhëna.";
  }

  if (status === 401) {
    if (
      lower.includes("invalid") ||
      lower.includes("password") ||
      lower.includes("email") ||
      lower.includes("credentials")
    ) {
      return "Email ose fjalëkalim i pasaktë, ose llogaria nuk është aktivizuar ende.";
    }
    return raw || "Ju lutem hyni përsëri.";
  }

  if (/^(get|post|put|patch|delete)\s+\//i.test(raw) || raw.includes("/api/")) {
    return "Ndodhi një gabim gjatë lidhjes me serverin. Provoni përsëri ose kontaktoni mbështetjen.";
  }

  return raw || "Ndodhi një gabim. Provoni përsëri.";
}

/**
 * Pulls the token out of an `Authorization: Bearer <token>` header.
 * Returns null for a missing, empty, or non-bearer header.
 */
export function parseBearerToken(header: string | null | undefined): string | null {
  if (!header) return null;
  const match = /^Bearer\s+(\S+)\s*$/i.exec(header.trim());
  return match?.[1] ?? null;
}

import "server-only";
import { parseBearerToken } from "@fortyeight/core";
import type { DbClient } from "@fortyeight/db";
import { createSupabaseClientForToken, createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthContext {
  userId: string;
  email: string | null;
  /** How the request proved who it is. */
  method: "cookie" | "bearer";
  /** Client that acts as this user. RLS applies. */
  db: DbClient;
}

/**
 * Works out who is calling an API route.
 *
 * - `Authorization: Bearer <supabase_jwt>` (mobile and other native clients)
 * - Supabase session cookie (web)
 *
 * A bearer header that fails verification returns null. It never falls back
 * to the cookie, so a bad token can't ride on someone's browser session.
 * Returns null when signed out or when Supabase is not configured yet.
 */
export async function getAuthContext(request: Request): Promise<AuthContext | null> {
  const header = request.headers.get("authorization");
  if (header !== null) {
    const token = parseBearerToken(header);
    if (!token) return null;
    const db = createSupabaseClientForToken(token);
    if (!db) return null;
    const { data, error } = await db.auth.getClaims(token);
    if (error || !data?.claims.sub) return null;
    return {
      userId: data.claims.sub,
      email: typeof data.claims.email === "string" ? data.claims.email : null,
      method: "bearer",
      db,
    };
  }

  const db = await createSupabaseServerClient();
  if (!db) return null;
  const { data, error } = await db.auth.getClaims();
  if (error || !data?.claims.sub) return null;
  return {
    userId: data.claims.sub,
    email: typeof data.claims.email === "string" ? data.claims.email : null,
    method: "cookie",
    db,
  };
}

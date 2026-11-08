import "server-only";
import type { Database } from "@fortyeight/db";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/env";

/**
 * Supabase client for server components and route handlers, using the
 * signed-in user's cookies. Returns null until Supabase env vars are set.
 */
export async function createSupabaseServerClient() {
  const env = getSupabasePublicEnv();
  if (!env) return null;
  const cookieStore = await cookies();
  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a server component, where cookies are read-only.
          // The proxy refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}

/**
 * Supabase client that acts as the user behind a bearer token (mobile app).
 * RLS applies exactly as it does for cookie sessions.
 */
export function createSupabaseClientForToken(accessToken: string) {
  const env = getSupabasePublicEnv();
  if (!env) return null;
  return createClient<Database>(env.url, env.anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

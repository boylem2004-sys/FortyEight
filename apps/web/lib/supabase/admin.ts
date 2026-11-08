import "server-only";
import type { Database } from "@fortyeight/db";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";

/**
 * Service-role client. Bypasses RLS. Only for server work that must write
 * rows users cannot (plans for anonymous users, plan_items, entitlements,
 * usage counters, provider cache). Never import this into client code.
 */
export function createSupabaseAdminClient() {
  const env = getSupabasePublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env || !serviceRoleKey) return null;
  return createClient<Database>(env.url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

"use client";

import type { Database } from "@fortyeight/db";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/env";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Browser Supabase client (anon key + cookie session). Null until configured. */
export function getSupabaseBrowserClient() {
  if (client) return client;
  const env = getSupabasePublicEnv();
  if (!env) return null;
  client = createBrowserClient<Database>(env.url, env.anonKey);
  return client;
}

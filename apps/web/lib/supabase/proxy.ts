import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/env";

/**
 * Refreshes the Supabase auth cookie on each request so server code always
 * sees a fresh session. No-op until Supabase env vars are set.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = getSupabasePublicEnv();
  if (!env) return response;

  // Bearer-token requests (mobile) carry their own auth. Nothing to refresh.
  if (request.headers.get("authorization")) return response;

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
      },
    },
  });

  // Do not put code between client creation and this call. It refreshes the token.
  await supabase.auth.getClaims();
  return response;
}

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Where the emailed sign-in link lands. Swaps the one-time code for a session
 * cookie, then sends the person to pick dates. Their saved answers sync from
 * there (see `AccountSync`).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const db = await createSupabaseServerClient();

  if (db && code) {
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/plan?welcome=1", url.origin));
  }
  // Expired or reused link, or accounts are not set up. Planning still works signed out.
  return NextResponse.redirect(new URL("/plan?signin=failed", url.origin));
}

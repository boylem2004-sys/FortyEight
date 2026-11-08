import {
  getPreferencesResponseSchema,
  putPreferencesRequestSchema,
  putPreferencesResponseSchema,
} from "@fortyeight/core";
import { getPreferences, upsertPreferences } from "@fortyeight/db";
import { isSupabaseConfigured } from "@/lib/env";
import { getAuthContext } from "@/lib/server/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/server/http";

/**
 * Saved preferences for the signed-in user (cookie or bearer token).
 * Anonymous users keep preferences on their device until they sign in.
 */

async function requireUser(request: Request) {
  if (!isSupabaseConfigured()) {
    return { response: jsonError("not_configured", "Accounts are not set up yet.") } as const;
  }
  const auth = await getAuthContext(request);
  if (!auth)
    return { response: jsonError("unauthorized", "Sign in to use saved preferences.") } as const;
  return { auth } as const;
}

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { auth } = result;
  try {
    const preferences = await getPreferences(auth.db, auth.userId);
    return jsonOk(getPreferencesResponseSchema, { preferences });
  } catch (error) {
    console.error("Reading preferences failed", error);
    return jsonError("internal", "We couldn't load your preferences.");
  }
}

export async function PUT(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { auth } = result;

  const parsed = await parseJsonBody(request, putPreferencesRequestSchema, "preferences");
  if (!parsed.ok) return parsed.response;

  try {
    const preferences = await upsertPreferences(auth.db, auth.userId, parsed.data);
    return jsonOk(putPreferencesResponseSchema, { preferences });
  } catch (error) {
    console.error("Saving preferences failed", error);
    return jsonError("internal", "We couldn't save your preferences.");
  }
}

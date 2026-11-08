import { preferencesSchema, type Preferences } from "@fortyeight/core";
import type { DbClient } from "./client";
import type { Tables, TablesInsert } from "./database.types";

export type PreferencesRow = Tables<"preferences">;
export type PreferencesInsert = TablesInsert<"preferences">;

/**
 * Row -> Preferences. Returns null when the stored row is incomplete or no
 * longer matches the current schema (for example an old interest slug), so
 * callers can send the user back through onboarding instead of crashing.
 */
export function preferencesFromRow(row: PreferencesRow): Preferences | null {
  const parsed = preferencesSchema.safeParse({
    location: { label: row.location_label ?? "", lat: row.lat, lng: row.lng },
    radiusMiles: row.radius_miles,
    interests: row.interests,
    interestsFreeform: row.interests_freeform ?? "",
    eventTypes: row.event_types,
    groupSize: row.group_size,
    budget: { minCents: row.budget_min_cents, maxCents: row.budget_max_cents },
  });
  return parsed.success ? parsed.data : null;
}

export function preferencesToRow(userId: string, prefs: Preferences): PreferencesInsert {
  return {
    user_id: userId,
    location_label: prefs.location.label,
    lat: prefs.location.lat,
    lng: prefs.location.lng,
    radius_miles: prefs.radiusMiles,
    interests: prefs.interests,
    interests_freeform: prefs.interestsFreeform || null,
    event_types: prefs.eventTypes,
    group_size: prefs.groupSize,
    budget_min_cents: prefs.budget.minCents,
    budget_max_cents: prefs.budget.maxCents,
  };
}

/** Reads the user's saved preferences. RLS limits this to the caller's own row. */
export async function getPreferences(db: DbClient, userId: string): Promise<Preferences | null> {
  const { data, error } = await db
    .from("preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? preferencesFromRow(data) : null;
}

export async function upsertPreferences(
  db: DbClient,
  userId: string,
  prefs: Preferences,
): Promise<Preferences> {
  const { data, error } = await db
    .from("preferences")
    .upsert(preferencesToRow(userId, prefs), { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) throw error;
  const saved = preferencesFromRow(data);
  if (!saved) throw new Error("Saved preferences did not round-trip");
  return saved;
}

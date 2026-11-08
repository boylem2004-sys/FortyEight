import type { Preferences } from "@fortyeight/core";
import { describe, expect, it } from "vitest";
import { preferencesFromRow, preferencesToRow, type PreferencesRow } from "./preferences";

const prefs: Preferences = {
  location: { label: "Blue Bell, PA", lat: 40.1523, lng: -75.2663 },
  radiusMiles: 25,
  interests: ["live_music", "outdoors"],
  interestsFreeform: "",
  eventTypes: ["concerts", "outdoor_activities"],
  groupSize: 4,
  budget: { minCents: 0, maxCents: 5000 },
};

const USER = "11111111-1111-1111-1111-111111111111";

function toFullRow(p: Preferences): PreferencesRow {
  const insert = preferencesToRow(USER, p);
  return {
    user_id: insert.user_id,
    location_label: insert.location_label ?? null,
    lat: insert.lat ?? null,
    lng: insert.lng ?? null,
    radius_miles: insert.radius_miles ?? 25,
    interests: insert.interests ?? [],
    interests_freeform: insert.interests_freeform ?? null,
    event_types: insert.event_types ?? [],
    group_size: insert.group_size ?? 1,
    budget_min_cents: insert.budget_min_cents ?? 0,
    budget_max_cents: insert.budget_max_cents ?? null,
    updated_at: "2026-11-08T00:00:00Z",
  };
}

describe("preferences row mapping", () => {
  it("round-trips preferences through a row", () => {
    expect(preferencesFromRow(toFullRow(prefs))).toEqual(prefs);
  });

  it("stores empty free text as null", () => {
    expect(preferencesToRow(USER, prefs).interests_freeform).toBeNull();
    const withText = { ...prefs, interestsFreeform: "escape rooms" };
    expect(preferencesFromRow(toFullRow(withText))?.interestsFreeform).toBe("escape rooms");
  });

  it("keeps an open-ended budget", () => {
    const open = { ...prefs, budget: { minCents: 10000, maxCents: null } };
    expect(preferencesFromRow(toFullRow(open))?.budget).toEqual({
      minCents: 10000,
      maxCents: null,
    });
  });

  it("returns null for incomplete or outdated rows", () => {
    expect(preferencesFromRow({ ...toFullRow(prefs), location_label: null })).toBeNull();
    expect(preferencesFromRow({ ...toFullRow(prefs), interests: ["retired_interest"] })).toBeNull();
    expect(preferencesFromRow({ ...toFullRow(prefs), event_types: [] })).toBeNull();
  });
});

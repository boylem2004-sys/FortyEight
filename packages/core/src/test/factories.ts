import type { PlanRequest } from "../schemas/plan";
import type { Preferences } from "../schemas/preferences";
import type { Suggestion } from "../schemas/suggestion";

export function makeSuggestion(overrides: Partial<Suggestion> = {}): Suggestion {
  const sourceId = overrides.sourceId ?? "item-1";
  const source = overrides.source ?? "ticketmaster";
  return {
    id: `${source}:${sourceId}`,
    source,
    sourceId,
    title: "Sample Show",
    category: "concert",
    startsAt: "2026-11-14T00:30:00.000Z",
    venueName: "Union Hall",
    lat: 40.15,
    lng: -75.26,
    distanceMiles: 3,
    priceMinCents: 2000,
    priceMaxCents: 4000,
    priceKnown: true,
    priceEstimated: false,
    url: "https://example.com/item-1",
    imageUrl: null,
    fitScore: null,
    fitReason: null,
    verified: true,
    ...overrides,
  };
}

export function makePreferences(overrides: Partial<Preferences> = {}): Preferences {
  return {
    location: { label: "Blue Bell, PA", lat: 40.1523, lng: -75.2663 },
    radiusMiles: 25,
    interests: ["live_music", "food_drink"],
    interestsFreeform: "",
    eventTypes: ["concerts", "bars_breweries", "restaurants"],
    groupSize: 4,
    budget: { minCents: 0, maxCents: 5000 },
    ...overrides,
  };
}

/** Fri Nov 13 to Sun Nov 15, 2026, in New York. */
export function makePlanRequest(overrides: Partial<PlanRequest> = {}): PlanRequest {
  return {
    preferences: makePreferences(),
    dateRange: { start: "2026-11-13", end: "2026-11-15" },
    timezone: "America/New_York",
    ...overrides,
  };
}

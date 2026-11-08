import { describe, expect, it } from "vitest";
import { haversineMiles } from "../../geo";
import { suggestionSchema } from "../../schemas/suggestion";
import { CATEGORIES } from "../../schemas/enums";
import type { ProviderSearchInput } from "../types";
import { AI_WEB_FIXTURES, normalizeAiWebResult, stubAiWebProvider } from "./ai-web";
import { fixtureGeocoder } from "./geocoder";
import {
  GOOGLE_PLACES_FIXTURES,
  googlePlaceCategory,
  normalizeGooglePlace,
  stubGooglePlacesProvider,
} from "./google-places";
import {
  normalizeTicketmasterEvent,
  stubTicketmasterProvider,
  ticketmasterCategory,
  TICKETMASTER_FIXTURES,
} from "./ticketmaster";

const input: ProviderSearchInput = {
  center: { lat: 40.1523, lng: -75.2663 },
  radiusMiles: 25,
  dateRange: { start: "2026-11-13", end: "2026-11-15" },
  timezone: "America/New_York",
  categories: [...CATEGORIES],
  interests: [],
  interestsFreeform: "",
};

describe("stub providers", () => {
  it.each([
    ["ticketmaster", stubTicketmasterProvider, TICKETMASTER_FIXTURES.length],
    ["google_places", stubGooglePlacesProvider, GOOGLE_PLACES_FIXTURES.length],
    ["ai_web", stubAiWebProvider, AI_WEB_FIXTURES.length],
  ] as const)("%s returns schema-valid suggestions", async (_name, provider, count) => {
    const raw = await provider.search(input);
    expect(raw).toHaveLength(count);
    for (const item of raw) {
      const s = (provider.normalize as (r: unknown) => unknown)(item);
      expect(suggestionSchema.safeParse(s).success).toBe(true);
    }
  });

  it("only returns the categories asked for", async () => {
    const raw = await stubTicketmasterProvider.search({ ...input, categories: ["comedy"] });
    expect(raw.length).toBeGreaterThan(0);
    for (const e of raw) expect(ticketmasterCategory(e)).toBe("comedy");
  });

  it("places fixtures around the search center", async () => {
    const raw = await stubGooglePlacesProvider.search(input);
    const s = normalizeGooglePlace(raw[0]!);
    const d = haversineMiles(input.center, { lat: s.lat!, lng: s.lng! });
    expect(d).toBeLessThan(10);
  });

  it("declares which categories it supports", () => {
    expect(stubTicketmasterProvider.supports("concert")).toBe(true);
    expect(stubTicketmasterProvider.supports("restaurant")).toBe(false);
    expect(stubGooglePlacesProvider.supports("restaurant")).toBe(true);
    expect(stubAiWebProvider.supports("movie")).toBe(true);
  });
});

describe("normalizeTicketmasterEvent", () => {
  it("maps price ranges to cents and keeps coordinates", () => {
    const s = normalizeTicketmasterEvent({
      id: "x",
      name: "Show",
      dates: { start: { dateTime: "2026-11-14T00:30:00Z" } },
      classifications: [{ segment: { name: "Music" } }],
      priceRanges: [
        { currency: "USD", min: 25.5, max: 40 },
        { currency: "USD", min: 20, max: 60 },
      ],
      _embedded: { venues: [{ name: "Hall", location: { latitude: "40.1", longitude: "-75.2" } }] },
    });
    expect(s).toMatchObject({
      id: "ticketmaster:x",
      category: "concert",
      priceMinCents: 2000,
      priceMaxCents: 6000,
      priceKnown: true,
      lat: 40.1,
      lng: -75.2,
      verified: true,
    });
  });

  it("flags missing price and location without failing", () => {
    const s = normalizeTicketmasterEvent({ id: "y", name: "Mystery", dates: { start: {} } });
    expect(s).toMatchObject({
      priceKnown: false,
      priceMinCents: null,
      lat: null,
      startsAt: null,
      category: "other",
    });
  });

  it("splits comedy from theater", () => {
    const base = { id: "z", name: "n", dates: { start: {} } };
    expect(
      ticketmasterCategory({
        ...base,
        classifications: [{ segment: { name: "Arts & Theatre" }, genre: { name: "Comedy" } }],
      }),
    ).toBe("comedy");
    expect(
      ticketmasterCategory({
        ...base,
        classifications: [{ segment: { name: "Arts & Theatre" }, genre: { name: "Theatre" } }],
      }),
    ).toBe("theater");
  });
});

describe("normalizeGooglePlace", () => {
  const place = {
    id: "p",
    displayName: { text: "Spot" },
    location: { latitude: 40, longitude: -75 },
  };

  it("prefers an explicit price range", () => {
    const s = normalizeGooglePlace({
      ...place,
      priceLevel: "PRICE_LEVEL_EXPENSIVE",
      priceRange: {
        startPrice: { currencyCode: "USD", units: "20" },
        endPrice: { currencyCode: "USD", units: "30" },
      },
    });
    expect(s).toMatchObject({
      priceMinCents: 2000,
      priceMaxCents: 3000,
      priceKnown: true,
      priceEstimated: false,
    });
  });

  it("estimates from price level when there is no range", () => {
    const s = normalizeGooglePlace({ ...place, priceLevel: "PRICE_LEVEL_MODERATE" });
    expect(s).toMatchObject({ priceMinCents: 1500, priceMaxCents: 3000, priceEstimated: true });
  });

  it("treats the free price level as a real price", () => {
    const s = normalizeGooglePlace({ ...place, priceLevel: "PRICE_LEVEL_FREE" });
    expect(s).toMatchObject({ priceMinCents: 0, priceKnown: true, priceEstimated: false });
  });

  it("maps place types to categories", () => {
    expect(googlePlaceCategory({ ...place, primaryType: "thai_restaurant" })).toBe("restaurant");
    expect(googlePlaceCategory({ ...place, primaryType: "night_club" })).toBe("nightlife");
    expect(googlePlaceCategory({ ...place, primaryType: "car_wash" })).toBe("other");
  });
});

describe("normalizeAiWebResult", () => {
  it("is never verified and keeps the source url", () => {
    const s = normalizeAiWebResult({
      id: "w",
      title: "Pop-up",
      category: "market",
      startsAt: null,
      venueName: null,
      lat: null,
      lng: null,
      priceMinCents: null,
      priceMaxCents: null,
      sourceUrl: "https://example.com/source",
    });
    expect(s).toMatchObject({
      verified: false,
      url: "https://example.com/source",
      priceKnown: false,
    });
  });
});

describe("fixtureGeocoder", () => {
  it("finds known places by name or ZIP", async () => {
    expect(await fixtureGeocoder.geocode("Blue Bell, PA")).toMatchObject({
      label: "Blue Bell, PA",
      approximate: false,
    });
    expect(await fixtureGeocoder.geocode("19406")).toMatchObject({ label: "King of Prussia, PA" });
  });

  it("matches short aliases only as whole words", async () => {
    expect(await fixtureGeocoder.geocode("Washington DC")).toMatchObject({
      label: "Washington, DC",
    });
    expect(await fixtureGeocoder.geocode("Lancaster")).toMatchObject({ approximate: true });
  });

  it("falls back to an approximate location", async () => {
    expect(await fixtureGeocoder.geocode("Scranton")).toMatchObject({
      label: "Philadelphia, PA",
      approximate: true,
    });
  });

  it("returns null for an empty query", async () => {
    expect(await fixtureGeocoder.geocode("  ")).toBeNull();
  });
});

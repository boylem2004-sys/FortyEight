import { describe, expect, it } from "vitest";
import { makeSuggestion } from "../test/factories";
import {
  applyHardFilters,
  categoriesIn,
  checkHardFilters,
  EMPTY_RESULT_FILTERS,
  filterResults,
  withDistance,
  type HardFilterInput,
} from "./filters";

const TZ = "America/New_York";
const hard: HardFilterInput = {
  dateRange: { start: "2026-11-13", end: "2026-11-15" },
  timezone: TZ,
  radiusMiles: 10,
  budgetMaxCents: 5000,
};

describe("withDistance", () => {
  it("computes distance from the center", () => {
    const s = withDistance(makeSuggestion({ lat: 40.1523, lng: -75.2663, distanceMiles: null }), {
      lat: 40.1523,
      lng: -75.2663,
    });
    expect(s.distanceMiles).toBe(0);
  });

  it("leaves distance empty without coordinates", () => {
    expect(
      withDistance(makeSuggestion({ lat: null, lng: null }), { lat: 0, lng: 0 }).distanceMiles,
    ).toBeNull();
  });
});

describe("checkHardFilters", () => {
  it("passes an item that fits", () => {
    expect(checkHardFilters(makeSuggestion(), hard)).toBe("ok");
  });

  it("uses the local date, not the UTC date", () => {
    // 7:30 PM Sunday in New York is Monday in UTC. It should still count as Sunday.
    expect(checkHardFilters(makeSuggestion({ startsAt: "2026-11-16T00:30:00.000Z" }), hard)).toBe(
      "ok",
    );
    expect(checkHardFilters(makeSuggestion({ startsAt: "2026-11-16T15:00:00.000Z" }), hard)).toBe(
      "outside_dates",
    );
    expect(checkHardFilters(makeSuggestion({ startsAt: "2026-11-12T23:00:00.000Z" }), hard)).toBe(
      "outside_dates",
    );
  });

  it("drops items outside the radius", () => {
    expect(checkHardFilters(makeSuggestion({ distanceMiles: 10.5 }), hard)).toBe("too_far");
  });

  it("drops items whose cheapest price is over budget", () => {
    expect(
      checkHardFilters(makeSuggestion({ priceMinCents: 6000, priceMaxCents: 9000 }), hard),
    ).toBe("over_budget");
    expect(
      checkHardFilters(makeSuggestion({ priceMinCents: 4000, priceMaxCents: 9000 }), hard),
    ).toBe("ok");
  });

  it("keeps items with missing data instead of hiding them", () => {
    const unknown = makeSuggestion({
      startsAt: null,
      distanceMiles: null,
      priceMinCents: null,
      priceMaxCents: null,
      priceKnown: false,
    });
    expect(checkHardFilters(unknown, hard)).toBe("ok");
  });

  it("allows any price with no budget max", () => {
    expect(
      checkHardFilters(makeSuggestion({ priceMinCents: 50000 }), { ...hard, budgetMaxCents: null }),
    ).toBe("ok");
  });

  it("filters a list", () => {
    const items = [
      makeSuggestion({ sourceId: "a" }),
      makeSuggestion({ sourceId: "b", distanceMiles: 99 }),
    ];
    expect(applyHardFilters(items, hard).map((i) => i.sourceId)).toEqual(["a"]);
  });
});

describe("filterResults", () => {
  const items = [
    makeSuggestion({
      sourceId: "concert",
      category: "concert",
      startsAt: "2026-11-14T00:30:00.000Z",
    }), // Fri night local
    makeSuggestion({
      sourceId: "bar",
      category: "bar",
      startsAt: null,
      priceMinCents: 1500,
      distanceMiles: 8,
    }),
    makeSuggestion({
      sourceId: "pricey",
      category: "restaurant",
      startsAt: null,
      priceMinCents: 9000,
    }),
    makeSuggestion({
      sourceId: "mystery",
      category: "festival",
      startsAt: "2026-11-15T17:00:00.000Z",
      priceMinCents: null,
      priceKnown: false,
    }),
  ];
  const ids = (list: typeof items) => list.map((i) => i.sourceId);

  it("returns everything with empty filters", () => {
    expect(filterResults(items, EMPTY_RESULT_FILTERS, TZ)).toHaveLength(4);
  });

  it("filters by category", () => {
    expect(ids(filterResults(items, { ...EMPTY_RESULT_FILTERS, category: "bar" }, TZ))).toEqual([
      "bar",
    ]);
  });

  it("filters by max price but keeps unknown prices", () => {
    expect(ids(filterResults(items, { ...EMPTY_RESULT_FILTERS, maxPriceCents: 2500 }, TZ))).toEqual(
      ["concert", "bar", "mystery"],
    );
  });

  it("filters by distance", () => {
    expect(ids(filterResults(items, { ...EMPTY_RESULT_FILTERS, maxDistanceMiles: 5 }, TZ))).toEqual(
      ["concert", "pricey", "mystery"],
    );
  });

  it("filters by local day and keeps items open all weekend", () => {
    expect(ids(filterResults(items, { ...EMPTY_RESULT_FILTERS, day: "2026-11-13" }, TZ))).toEqual([
      "concert",
      "bar",
      "pricey",
    ]);
  });

  it("lists categories present", () => {
    expect(categoriesIn(items)).toEqual(["concert", "bar", "restaurant", "festival"]);
  });
});

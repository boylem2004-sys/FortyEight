import { describe, expect, it } from "vitest";
import {
  EVENT_TYPE_CATEGORIES,
  eventTypesMatchingCategory,
  INTEREST_CATEGORIES,
  interestsMatchingCategory,
  targetCategories,
} from "./categories";
import { CATEGORIES, EVENT_TYPES, INTERESTS } from "./schemas/enums";

describe("categories", () => {
  it("maps every event type and interest to at least one category", () => {
    for (const t of EVENT_TYPES) expect(EVENT_TYPE_CATEGORIES[t].length).toBeGreaterThan(0);
    for (const i of INTERESTS) expect(INTEREST_CATEGORIES[i].length).toBeGreaterThan(0);
  });

  it("builds target categories from event types, without repeats", () => {
    expect(targetCategories(["concerts", "bars_breweries"])).toEqual([
      "concert",
      "bar",
      "nightlife",
    ]);
    expect(targetCategories(["festivals"])).toEqual(["festival", "market"]);
  });

  it("searches everything when no event types are picked", () => {
    expect(targetCategories([])).toEqual([...CATEGORIES]);
  });

  it("finds interests and event types that match a category", () => {
    expect(interestsMatchingCategory(["live_music", "outdoors"], "concert")).toEqual([
      "live_music",
    ]);
    expect(eventTypesMatchingCategory(["restaurants", "concerts"], "restaurant")).toEqual([
      "restaurants",
    ]);
    expect(interestsMatchingCategory(["comedy"], "sports")).toEqual([]);
  });
});

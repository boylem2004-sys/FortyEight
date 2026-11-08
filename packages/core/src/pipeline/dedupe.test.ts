import { describe, expect, it } from "vitest";
import { makeSuggestion } from "../test/factories";
import { dedupeSuggestions, isDuplicate, titleSimilarity, titleTokens } from "./dedupe";

const TZ = "America/New_York";

describe("title matching", () => {
  it("ignores case, punctuation, stopwords, and years", () => {
    expect([...titleTokens("The Harvest Lights Festival 2026!")]).toEqual([
      "harvest",
      "lights",
      "festival",
    ]);
  });

  it("scores similar titles high and different titles low", () => {
    expect(titleSimilarity("Harvest Lights Festival", "Harvest Lights Festival 2026")).toBe(1);
    expect(
      titleSimilarity("Night Owls live at Union Hall", "The Night Owls"),
    ).toBeGreaterThanOrEqual(0.6);
    expect(titleSimilarity("Night Owls", "Comedy Showcase")).toBe(0);
    expect(titleSimilarity("Jazz Brunch", "Jazz Night")).toBe(0.5);
  });
});

describe("dedupeSuggestions", () => {
  const tm = makeSuggestion({
    source: "ticketmaster",
    sourceId: "tm-1",
    title: "Harvest Lights Festival",
  });
  const web = makeSuggestion({
    source: "ai_web",
    sourceId: "web-1",
    title: "Harvest Lights Festival 2026",
    verified: false,
  });

  it("treats same venue, same day, similar title as a duplicate", () => {
    expect(isDuplicate(tm, web, TZ)).toBe(true);
  });

  it("does not merge different days at the same venue", () => {
    const nextDay = { ...web, startsAt: "2026-11-15T00:30:00.000Z" };
    expect(isDuplicate(tm, nextDay, TZ)).toBe(false);
  });

  it("does not merge different venues", () => {
    expect(isDuplicate(tm, { ...web, venueName: "Other Park" }, TZ)).toBe(false);
  });

  it("keeps the verified copy no matter the order", () => {
    expect(dedupeSuggestions([web, tm], TZ).map((s) => s.id)).toEqual(["ticketmaster:tm-1"]);
    expect(dedupeSuggestions([tm, web], TZ).map((s) => s.id)).toEqual(["ticketmaster:tm-1"]);
  });

  it("drops exact repeat ids", () => {
    expect(dedupeSuggestions([tm, tm], TZ)).toHaveLength(1);
  });

  it("keeps distinct items in order", () => {
    const other = makeSuggestion({
      sourceId: "tm-2",
      title: "Comedy Night",
      venueName: "Corner Club",
    });
    expect(dedupeSuggestions([tm, other], TZ).map((s) => s.sourceId)).toEqual(["tm-1", "tm-2"]);
  });
});

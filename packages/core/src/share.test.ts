import { describe, expect, it } from "vitest";
import type { Plan } from "./schemas/plan";
import { planShareText, SHARE_MAX_ITEMS } from "./share";
import { makePlanRequest, makeSuggestion } from "./test/factories";

function makePlan(count: number): Plan {
  return {
    id: "3f1c2a52-5e0b-4f43-9a51-0c8b1c1f2d77",
    status: "ready",
    createdAt: "2026-11-11T12:00:00.000Z",
    input: makePlanRequest(),
    location: { label: "Blue Bell, PA", lat: 40.15, lng: -75.26, approximate: false },
    items: Array.from({ length: count }, (_, i) =>
      makeSuggestion({
        sourceId: `item-${i}`,
        title: `Pick ${i + 1}`,
        startsAt: i === 1 ? null : "2026-11-14T00:30:00.000Z",
      }),
    ),
    meta: { candidateCount: count, usedWebResearch: false, fixtureData: true },
  };
}

describe("planShareText", () => {
  it("lists the picks with their times", () => {
    const text = planShareText(makePlan(2));
    const lines = text.split("\n");
    expect(lines[0]).toContain("Weekend plan near Blue Bell, PA");
    expect(lines[1]).toMatch(/^1\. Pick 1 \(.+7:30 PM\)$/);
    expect(lines[2]).toBe("2. Pick 2 (any time)");
    expect(text).not.toContain("more");
  });

  it("caps the list and says how many were left out", () => {
    const text = planShareText(makePlan(SHARE_MAX_ITEMS + 3));
    expect(text).toContain(`${SHARE_MAX_ITEMS}. Pick ${SHARE_MAX_ITEMS}`);
    expect(text).not.toContain(`Pick ${SHARE_MAX_ITEMS + 1}`);
    expect(text).toContain("...and 3 more");
  });
});

import { describe, expect, it } from "vitest";
import { makeSuggestion } from "../test/factories";
import {
  applyRanking,
  heuristicRanker,
  heuristicReason,
  heuristicScore,
  selectCandidatesForRanking,
  type RankingProfile,
} from "./rank";

const profile: RankingProfile = {
  interests: ["live_music", "food_drink"],
  interestsFreeform: "",
  eventTypes: ["concerts", "restaurants"],
  groupSize: 4,
  budget: { minCents: 0, maxCents: 5000 },
  radiusMiles: 25,
};

describe("applyRanking", () => {
  const a = makeSuggestion({ sourceId: "a" });
  const b = makeSuggestion({ sourceId: "b" });

  it("only returns candidates it was given (no invented items)", () => {
    const out = applyRanking(
      [a, b],
      [
        { id: "ticketmaster:made-up", fitScore: 99, fitReason: "Hallucinated" },
        { id: b.id, fitScore: 80, fitReason: "Good" },
      ],
    );
    expect(out.map((s) => s.id)).toEqual([b.id]);
  });

  it("drops repeat ids and sorts by score", () => {
    const out = applyRanking(
      [a, b],
      [
        { id: a.id, fitScore: 50, fitReason: "ok" },
        { id: b.id, fitScore: 90, fitReason: "great" },
        { id: a.id, fitScore: 100, fitReason: "again" },
      ],
    );
    expect(out.map((s) => [s.id, s.fitScore])).toEqual([
      [b.id, 90],
      [a.id, 50],
    ]);
  });

  it("clamps scores and respects the limit", () => {
    const out = applyRanking(
      [a, b],
      [
        { id: a.id, fitScore: 140, fitReason: "x" },
        { id: b.id, fitScore: -3, fitReason: "y" },
      ],
      1,
    );
    expect(out).toHaveLength(1);
    expect(out[0]?.fitScore).toBe(100);
  });
});

describe("heuristic ranker", () => {
  it("scores a liked category above an unliked one", () => {
    const concert = makeSuggestion({ category: "concert" });
    const sports = makeSuggestion({ category: "sports" });
    expect(heuristicScore(concert, profile)).toBeGreaterThan(heuristicScore(sports, profile));
  });

  it("scores closer items higher", () => {
    const near = makeSuggestion({ distanceMiles: 1 });
    const far = makeSuggestion({ distanceMiles: 24 });
    expect(heuristicScore(near, profile)).toBeGreaterThan(heuristicScore(far, profile));
  });

  it("penalizes unverified and unpriced items", () => {
    const base = makeSuggestion();
    expect(heuristicScore({ ...base, verified: false }, profile)).toBeLessThan(
      heuristicScore(base, profile),
    );
    expect(heuristicScore({ ...base, priceKnown: false }, profile)).toBeLessThan(
      heuristicScore(base, profile),
    );
  });

  it("writes a short reason that mentions interests and price", () => {
    const reason = heuristicReason(
      makeSuggestion({ category: "concert", priceMinCents: 2000 }),
      profile,
    );
    expect(reason).toBe(
      "Lines up with your group's interest in live music. From $20 per person, inside your under $50 budget.",
    );
  });

  it("calls out free and unpriced items", () => {
    expect(
      heuristicReason(makeSuggestion({ priceMinCents: 0, priceMaxCents: 0 }), profile),
    ).toContain("Free for the whole group.");
    expect(
      heuristicReason(makeSuggestion({ priceKnown: false, priceMinCents: null }), profile),
    ).toContain("No price listed");
  });

  it("does not call a cheap place free just because its price starts at $0", () => {
    const cheap = makeSuggestion({ priceMinCents: 0, priceMaxCents: 1500, priceEstimated: true });
    const reason = heuristicReason(cheap, profile);
    expect(reason).not.toContain("Free");
    expect(reason).toContain("Up to about $15 per person");
    expect(heuristicScore(cheap, profile)).toBeLessThan(
      heuristicScore({ ...cheap, priceMaxCents: 0, priceEstimated: false }, profile),
    );
  });

  it("ranks and limits", async () => {
    const items = ["a", "b", "c"].map((id, i) =>
      makeSuggestion({ sourceId: id, distanceMiles: i * 5 }),
    );
    const rankings = await heuristicRanker.rank({ candidates: items, profile, limit: 2 });
    expect(rankings.map((r) => r.id)).toEqual(["ticketmaster:a", "ticketmaster:b"]);
  });
});

describe("selectCandidatesForRanking", () => {
  it("returns the list unchanged when it is short", () => {
    const items = [makeSuggestion()];
    expect(selectCandidatesForRanking(items, profile)).toBe(items);
  });

  it("prefers liked categories, then closer items", () => {
    const items = [
      makeSuggestion({ sourceId: "far-liked", category: "concert", distanceMiles: 20 }),
      makeSuggestion({ sourceId: "near-unliked", category: "sports", distanceMiles: 1 }),
      makeSuggestion({ sourceId: "near-liked", category: "restaurant", distanceMiles: 2 }),
    ];
    expect(selectCandidatesForRanking(items, profile, 2).map((s) => s.sourceId)).toEqual([
      "near-liked",
      "far-liked",
    ]);
  });
});

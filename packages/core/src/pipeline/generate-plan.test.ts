import { describe, expect, it, vi } from "vitest";
import { localDateOf } from "../dates";
import { stubAiWebProvider } from "../providers/stubs/ai-web";
import { fixtureGeocoder } from "../providers/stubs/geocoder";
import { stubGooglePlacesProvider } from "../providers/stubs/google-places";
import { stubTicketmasterProvider } from "../providers/stubs/ticketmaster";
import type { Provider } from "../providers/types";
import { planSchema } from "../schemas/plan";
import { makePlanRequest, makePreferences } from "../test/factories";
import {
  generatePlan,
  LocationNotFoundError,
  resolveLocation,
  shouldUseWebResearch,
  type PipelineDeps,
} from "./generate-plan";
import { heuristicRanker, type Ranker } from "./rank";

function deps(overrides: Partial<PipelineDeps> = {}): PipelineDeps {
  return {
    providers: [stubTicketmasterProvider, stubGooglePlacesProvider] as Provider<unknown>[],
    webResearch: stubAiWebProvider as Provider<unknown>,
    geocoder: fixtureGeocoder,
    ranker: heuristicRanker,
    newId: () => "00000000-0000-4000-8000-000000000001",
    now: () => new Date("2026-11-12T22:00:00.000Z"),
    fixtureData: true,
    ...overrides,
  };
}

describe("generatePlan", () => {
  it("builds a valid plan of 5 to 10 ranked items from the stubs", async () => {
    const plan = await generatePlan(makePlanRequest(), deps());
    expect(planSchema.safeParse(plan).success).toBe(true);
    expect(plan.items.length).toBeGreaterThanOrEqual(5);
    expect(plan.items.length).toBeLessThanOrEqual(10);
    expect(plan.status).toBe("ready");
    expect(plan.meta.fixtureData).toBe(true);
  });

  it("only returns items that pass the hard filters", async () => {
    const request = makePlanRequest();
    const plan = await generatePlan(request, deps());
    for (const item of plan.items) {
      if (item.distanceMiles !== null) expect(item.distanceMiles).toBeLessThanOrEqual(25);
      if (item.priceMinCents !== null) expect(item.priceMinCents).toBeLessThanOrEqual(5000);
      if (item.startsAt) {
        const day = localDateOf(item.startsAt, request.timezone);
        expect(day >= request.dateRange.start && day <= request.dateRange.end).toBe(true);
      }
    }
  });

  it("ranks best first and explains every pick", async () => {
    const plan = await generatePlan(makePlanRequest(), deps());
    const scores = plan.items.map((i) => i.fitScore ?? 0);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    for (const item of plan.items) expect(item.fitReason).toBeTruthy();
  });

  it("geocodes a typed location", async () => {
    const request = makePlanRequest({
      preferences: makePreferences({ location: { label: "19406", lat: null, lng: null } }),
    });
    const plan = await generatePlan(request, deps());
    expect(plan.location).toMatchObject({ label: "King of Prussia, PA", approximate: false });
  });

  it("uses web research for movies and removes the duplicate festival", async () => {
    const request = makePlanRequest({
      preferences: makePreferences({ eventTypes: ["movies", "festivals"], interests: ["markets"] }),
    });
    const plan = await generatePlan(request, deps());
    expect(plan.meta.usedWebResearch).toBe(true);
    const festivals = plan.items.filter((i) => i.title.startsWith("Harvest Lights"));
    expect(festivals).toHaveLength(1);
    expect(festivals[0]?.source).toBe("ticketmaster");
    expect(plan.items.some((i) => i.source === "ai_web" && i.verified === false)).toBe(true);
  });

  it("skips web research when structured sources have enough", async () => {
    const plan = await generatePlan(makePlanRequest(), deps());
    expect(plan.meta.usedWebResearch).toBe(false);
    expect(plan.items.every((i) => i.source !== "ai_web")).toBe(true);
  });

  it("still builds a plan when one provider fails", async () => {
    const onProviderError = vi.fn();
    const broken: Provider<unknown> = {
      id: "ticketmaster",
      supports: () => true,
      search: () => Promise.reject(new Error("quota")),
      normalize: () => {
        throw new Error("unreachable");
      },
    };
    const plan = await generatePlan(
      makePlanRequest(),
      deps({ providers: [broken, stubGooglePlacesProvider as Provider<unknown>], onProviderError }),
    );
    expect(onProviderError).toHaveBeenCalledWith("ticketmaster", expect.any(Error));
    expect(plan.items.length).toBeGreaterThan(0);
  });

  it("ignores items the ranker invents", async () => {
    const lyingRanker: Ranker = {
      rank: async ({ candidates }) => [
        { id: "ticketmaster:does-not-exist", fitScore: 100, fitReason: "Made up" },
        { id: candidates[0]!.id, fitScore: 70, fitReason: "Real" },
      ],
    };
    const plan = await generatePlan(makePlanRequest(), deps({ ranker: lyingRanker }));
    expect(plan.items.map((i) => i.fitReason)).toEqual(["Real"]);
  });

  it("returns an empty plan when nothing fits", async () => {
    const request = makePlanRequest({
      preferences: makePreferences({
        budget: { minCents: 0, maxCents: 0 },
        eventTypes: ["sports_games"],
      }),
    });
    const plan = await generatePlan(request, deps({ webResearch: undefined }));
    expect(plan.items).toEqual([]);
    expect(plan.meta.candidateCount).toBe(0);
  });
});

describe("shouldUseWebResearch", () => {
  it("runs when there are too few candidates", () => {
    expect(shouldUseWebResearch(2, makePlanRequest())).toBe(true);
    expect(shouldUseWebResearch(20, makePlanRequest())).toBe(false);
  });

  it("runs for movies, festivals, or markets", () => {
    const withMovies = makePlanRequest({
      preferences: makePreferences({ eventTypes: ["movies"] }),
    });
    expect(shouldUseWebResearch(20, withMovies)).toBe(true);
  });
});

describe("resolveLocation", () => {
  it("uses coordinates when present", async () => {
    const r = await resolveLocation({ label: "Current location", lat: 1, lng: 2 }, fixtureGeocoder);
    expect(r).toEqual({ label: "Current location", lat: 1, lng: 2, approximate: false });
  });

  it("throws when the geocoder finds nothing", async () => {
    await expect(
      resolveLocation({ label: "Nowhere", lat: null, lng: null }, { geocode: async () => null }),
    ).rejects.toBeInstanceOf(LocationNotFoundError);
  });
});

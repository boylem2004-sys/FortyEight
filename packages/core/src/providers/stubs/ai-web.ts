import { categorySchema, type Category } from "../../schemas/enums";
import { suggestionId, type Suggestion } from "../../schemas/suggestion";
import type { Provider, ProviderSearchInput } from "../types";
import { fixtureStartsAt, placeFixture, type FixturePlacement } from "./fixture-helpers";

/**
 * Structured result we will ask Claude (with web search) to return in Phase 1.
 * Every item must carry the URL it came from.
 */
export interface AiWebResult {
  id: string;
  title: string;
  category: Category;
  startsAt: string | null;
  venueName: string | null;
  lat: number | null;
  lng: number | null;
  priceMinCents: number | null;
  priceMaxCents: number | null;
  sourceUrl: string;
}

export function normalizeAiWebResult(result: AiWebResult): Suggestion {
  const priceKnown = result.priceMinCents !== null || result.priceMaxCents !== null;
  return {
    id: suggestionId("ai_web", result.id),
    source: "ai_web",
    sourceId: result.id,
    title: result.title,
    category: categorySchema.catch("other").parse(result.category),
    startsAt: result.startsAt,
    venueName: result.venueName,
    lat: result.lat,
    lng: result.lng,
    distanceMiles: null,
    priceMinCents: result.priceMinCents ?? result.priceMaxCents,
    priceMaxCents: result.priceMaxCents ?? result.priceMinCents,
    priceKnown,
    priceEstimated: false,
    url: result.sourceUrl,
    imageUrl: null,
    fitScore: null,
    fitReason: null,
    // Web research is never treated as verified.
    verified: false,
  };
}

/* ------------------------------------------------------------------ */
/* Fixtures                                                           */
/* ------------------------------------------------------------------ */

interface WebFixture extends FixturePlacement {
  id: string;
  title: string;
  category: Category;
  venue: string;
  price?: [minCents: number, maxCents: number];
}

/** Invented sample local events. Not real listings. */
export const AI_WEB_FIXTURES: readonly WebFixture[] = [
  {
    id: "web-retro-scifi",
    title: "Retro Sci-Fi Double Feature",
    category: "movie",
    venue: "Main Street Cinema",
    day: 1,
    time: "19:00",
    northMiles: -3,
    eastMiles: -2,
    price: [1200, 1200],
  },
  {
    id: "web-makers-popup",
    title: "Makers Holiday Pop-up",
    category: "market",
    venue: "Old Firehouse",
    day: 1,
    time: "10:00",
    northMiles: 2,
    eastMiles: 4,
    price: [0, 0],
  },
  // Same event Ticketmaster lists. The pipeline should keep only one.
  {
    id: "web-harvest-lights",
    title: "Harvest Lights Festival 2026",
    category: "festival",
    venue: "Commons Park",
    day: 1,
    time: "12:00",
    northMiles: 5,
    eastMiles: 7,
    price: [0, 0],
  },
  {
    id: "web-pottery-wheel",
    title: "Intro to the Pottery Wheel",
    category: "class",
    venue: "Clay Studio Collective",
    day: 2,
    time: "13:00",
    northMiles: -5,
    eastMiles: -3,
    price: [4500, 4500],
  },
  {
    id: "web-open-mic",
    title: "Open Mic Night at the Bean",
    category: "concert",
    venue: "Bean There Cafe",
    day: 0,
    time: "19:00",
    northMiles: 1,
    eastMiles: 1,
    price: [0, 0],
  },
  {
    id: "web-sunrise-run",
    title: "Sunrise Group Run and Coffee",
    category: "outdoors",
    venue: "Riverside Trailhead",
    day: 2,
    time: "08:00",
    northMiles: -2,
    eastMiles: 3,
    price: [0, 0],
  },
];

function fixtureToResult(f: WebFixture, input: ProviderSearchInput): AiWebResult {
  const { lat, lng } = placeFixture(f, input);
  return {
    id: f.id,
    title: f.title,
    category: f.category,
    startsAt: fixtureStartsAt(f, input),
    venueName: f.venue,
    lat,
    lng,
    priceMinCents: f.price?.[0] ?? null,
    priceMaxCents: f.price?.[1] ?? null,
    sourceUrl: `https://example.com/fixtures/ai_web/${f.id}`,
  };
}

/**
 * Stub AI web research provider. Supports every category because it is the
 * fallback; the pipeline decides when to call it.
 */
export const stubAiWebProvider: Provider<AiWebResult> = {
  id: "ai_web",
  supports: () => true,
  async search(input) {
    return AI_WEB_FIXTURES.filter((f) => input.categories.includes(f.category)).map((f) =>
      fixtureToResult(f, input),
    );
  },
  normalize: normalizeAiWebResult,
};

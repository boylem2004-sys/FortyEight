import { targetCategories } from "../categories";
import type { Location } from "../schemas/preferences";
import type { Plan, PlanRequest, ResolvedLocation } from "../schemas/plan";
import type { Suggestion } from "../schemas/suggestion";
import type { Geocoder, Provider, ProviderSearchInput } from "../providers/types";
import { dedupeSuggestions } from "./dedupe";
import { applyHardFilters, withDistance, type HardFilterInput } from "./filters";
import {
  applyRanking,
  MAX_PLAN_ITEMS,
  MIN_PLAN_ITEMS,
  selectCandidatesForRanking,
  type Ranker,
  type RankingProfile,
} from "./rank";

export interface PipelineDeps {
  /** Structured providers (Ticketmaster, Google Places, ...). */
  providers: Provider<unknown>[];
  /** AI web research fallback. Optional so it can be turned off. */
  webResearch?: Provider<unknown>;
  geocoder: Geocoder;
  ranker: Ranker;
  newId: () => string;
  now: () => Date;
  /** True while the providers are stubs. Shown in the UI. */
  fixtureData: boolean;
  /** Called when a provider fails. The plan still builds from the rest. */
  onProviderError?: (providerId: string, error: unknown) => void;
}

export class LocationNotFoundError extends Error {
  constructor(public readonly query: string) {
    super(`Could not find a location for "${query}"`);
    this.name = "LocationNotFoundError";
  }
}

export async function resolveLocation(
  location: Location,
  geocoder: Geocoder,
): Promise<ResolvedLocation> {
  if (location.lat !== null && location.lng !== null) {
    return { label: location.label, lat: location.lat, lng: location.lng, approximate: false };
  }
  const resolved = await geocoder.geocode(location.label);
  if (!resolved) throw new LocationNotFoundError(location.label);
  return resolved;
}

/**
 * Web research runs only when structured sources come up short, or when the
 * group wants things structured APIs cover badly (movies, festivals, markets).
 */
export function shouldUseWebResearch(candidateCount: number, request: PlanRequest): boolean {
  const { eventTypes, interests } = request.preferences;
  return (
    candidateCount < MIN_PLAN_ITEMS ||
    eventTypes.includes("movies") ||
    eventTypes.includes("festivals") ||
    interests.includes("markets")
  );
}

async function searchProvider(
  provider: Provider<unknown>,
  base: Omit<ProviderSearchInput, "categories">,
  categories: ProviderSearchInput["categories"],
  deps: PipelineDeps,
): Promise<Suggestion[]> {
  const supported = categories.filter((c) => provider.supports(c));
  if (supported.length === 0) return [];
  try {
    const raw = await provider.search({ ...base, categories: supported });
    const out: Suggestion[] = [];
    for (const item of raw) {
      try {
        out.push(provider.normalize(item));
      } catch (error) {
        deps.onProviderError?.(provider.id, error);
      }
    }
    return out;
  } catch (error) {
    deps.onProviderError?.(provider.id, error);
    return [];
  }
}

/**
 * The recommendation pipeline (PRD section 7):
 * resolve location -> fan out to providers -> normalize -> distance ->
 * dedupe -> hard filter -> (web research fallback) -> rank -> plan.
 *
 * Caching (F8) and persistence (plans, plan_items) are added in Phase 1.
 */
export async function generatePlan(request: PlanRequest, deps: PipelineDeps): Promise<Plan> {
  const prefs = request.preferences;
  const location = await resolveLocation(prefs.location, deps.geocoder);
  const center = { lat: location.lat, lng: location.lng };
  const categories = targetCategories(prefs.eventTypes);

  const base: Omit<ProviderSearchInput, "categories"> = {
    center,
    radiusMiles: prefs.radiusMiles,
    dateRange: request.dateRange,
    timezone: request.timezone,
    interests: prefs.interests,
    interestsFreeform: prefs.interestsFreeform,
  };

  const filterInput: HardFilterInput = {
    dateRange: request.dateRange,
    timezone: request.timezone,
    radiusMiles: prefs.radiusMiles,
    budgetMaxCents: prefs.budget.maxCents,
  };

  const prepare = (items: Suggestion[]) =>
    applyHardFilters(
      items.map((i) => withDistance(i, center)),
      filterInput,
    );

  const structured = (
    await Promise.all(deps.providers.map((p) => searchProvider(p, base, categories, deps)))
  ).flat();
  let candidates = dedupeSuggestions(prepare(structured), request.timezone);

  let usedWebResearch = false;
  if (deps.webResearch && shouldUseWebResearch(candidates.length, request)) {
    const web = await searchProvider(deps.webResearch, base, categories, deps);
    usedWebResearch = true;
    // Structured results come first so they win ties in dedupe.
    candidates = dedupeSuggestions([...candidates, ...prepare(web)], request.timezone);
  }

  const profile: RankingProfile = {
    interests: prefs.interests,
    interestsFreeform: prefs.interestsFreeform,
    eventTypes: prefs.eventTypes,
    groupSize: prefs.groupSize,
    budget: prefs.budget,
    radiusMiles: prefs.radiusMiles,
  };

  const toRank = selectCandidatesForRanking(candidates, profile);
  const rankings =
    toRank.length > 0
      ? await deps.ranker.rank({ candidates: toRank, profile, limit: MAX_PLAN_ITEMS })
      : [];
  const items = applyRanking(toRank, rankings, MAX_PLAN_ITEMS);

  return {
    id: deps.newId(),
    status: "ready",
    createdAt: deps.now().toISOString(),
    input: request,
    location,
    items,
    meta: {
      candidateCount: candidates.length,
      usedWebResearch,
      fixtureData: deps.fixtureData,
    },
  };
}

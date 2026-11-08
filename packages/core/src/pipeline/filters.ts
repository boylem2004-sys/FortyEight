import { localDateOf, type DateRange, type IsoDate } from "../dates";
import { haversineMiles, roundMiles, type LatLng } from "../geo";
import type { Category } from "../schemas/enums";
import type { Suggestion } from "../schemas/suggestion";

/** Fills in distance from the search center when the item has coordinates. */
export function withDistance(item: Suggestion, center: LatLng): Suggestion {
  if (item.lat === null || item.lng === null) return { ...item, distanceMiles: null };
  return {
    ...item,
    distanceMiles: roundMiles(haversineMiles(center, { lat: item.lat, lng: item.lng })),
  };
}

export interface HardFilterInput {
  dateRange: DateRange;
  timezone: string;
  radiusMiles: number;
  /** Per person. null = no max. */
  budgetMaxCents: number | null;
}

export type HardFilterResult = "ok" | "outside_dates" | "too_far" | "over_budget";

/**
 * The non-negotiable filters from the PRD: date range, radius, and price per
 * person. Missing data never removes an item: no start time, no location, or
 * no price all pass (the UI flags them instead).
 */
export function checkHardFilters(item: Suggestion, input: HardFilterInput): HardFilterResult {
  if (item.startsAt !== null) {
    const day = localDateOf(item.startsAt, input.timezone);
    if (day < input.dateRange.start || day > input.dateRange.end) return "outside_dates";
  }
  if (item.distanceMiles !== null && item.distanceMiles > input.radiusMiles) return "too_far";
  if (
    input.budgetMaxCents !== null &&
    item.priceMinCents !== null &&
    item.priceMinCents > input.budgetMaxCents
  ) {
    return "over_budget";
  }
  return "ok";
}

export function applyHardFilters(items: Suggestion[], input: HardFilterInput): Suggestion[] {
  return items.filter((item) => checkHardFilters(item, input) === "ok");
}

/* ------------------------------------------------------------------ */
/* Results-screen filters (user controlled, applied on the client).   */
/* ------------------------------------------------------------------ */

export interface ResultFilters {
  category: Category | null;
  /** Per person. null = any price. */
  maxPriceCents: number | null;
  maxDistanceMiles: number | null;
  /** YYYY-MM-DD. null = any day. */
  day: IsoDate | null;
}

export const EMPTY_RESULT_FILTERS: ResultFilters = {
  category: null,
  maxPriceCents: null,
  maxDistanceMiles: null,
  day: null,
};

/**
 * Narrows ranked results. Items with unknown values stay visible: an item with
 * no start time is available every day, and unknown price or distance is shown
 * with a flag rather than hidden.
 */
export function filterResults(
  items: Suggestion[],
  filters: ResultFilters,
  timezone: string,
): Suggestion[] {
  return items.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (
      filters.maxPriceCents !== null &&
      item.priceMinCents !== null &&
      item.priceMinCents > filters.maxPriceCents
    ) {
      return false;
    }
    if (
      filters.maxDistanceMiles !== null &&
      item.distanceMiles !== null &&
      item.distanceMiles > filters.maxDistanceMiles
    ) {
      return false;
    }
    if (
      filters.day &&
      item.startsAt !== null &&
      localDateOf(item.startsAt, timezone) !== filters.day
    )
      return false;
    return true;
  });
}

/** Categories present in a result set, in first-seen order, for the filter UI. */
export function categoriesIn(items: Suggestion[]): Category[] {
  return [...new Set(items.map((i) => i.category))];
}

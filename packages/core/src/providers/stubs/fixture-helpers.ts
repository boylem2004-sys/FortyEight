import { listDates, zonedTimeToUtc, type IsoDate } from "../../dates";
import { offsetLatLng, type LatLng } from "../../geo";
import type { ProviderSearchInput } from "../types";

/**
 * Fixture items are written relative to the search, so sample data shows up
 * wherever the user is and on whatever weekend they pick.
 */
export interface FixturePlacement {
  /** Index into the requested dates. Wraps around if the range is short. */
  day: number;
  /** Local wall-clock time, "HH:MM". */
  time: string;
  northMiles: number;
  eastMiles: number;
}

export function placeFixture(
  placement: Pick<FixturePlacement, "northMiles" | "eastMiles">,
  input: ProviderSearchInput,
): LatLng {
  return offsetLatLng(input.center, placement.northMiles, placement.eastMiles);
}

export function fixtureDate(day: number, input: ProviderSearchInput): IsoDate {
  const dates = listDates(input.dateRange);
  return dates[day % dates.length] ?? input.dateRange.start;
}

export function fixtureStartsAt(placement: FixturePlacement, input: ProviderSearchInput): string {
  return zonedTimeToUtc(fixtureDate(placement.day, input), placement.time, input.timezone);
}

/** Sample links point at example.com so nobody mistakes them for real listings. */
export function fixtureUrl(provider: string, id: string): string {
  return `https://example.com/fixtures/${provider}/${id}`;
}

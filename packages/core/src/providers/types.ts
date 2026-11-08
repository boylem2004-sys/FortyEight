import type { DateRange } from "../dates";
import type { LatLng } from "../geo";
import type { Category, Interest, Source } from "../schemas/enums";
import type { ResolvedLocation } from "../schemas/plan";
import type { Suggestion } from "../schemas/suggestion";

export interface ProviderSearchInput {
  center: LatLng;
  radiusMiles: number;
  dateRange: DateRange;
  /** IANA zone of the search area. */
  timezone: string;
  /** Only the categories this provider supports are passed in. */
  categories: Category[];
  interests: Interest[];
  interestsFreeform: string;
}

/**
 * A source of things to do. Every source (Ticketmaster, Google Places,
 * AI web research, and later SeatGeek, PredictHQ, Yelp) implements this.
 *
 * `normalize` maps one raw item to a Suggestion. Distance, fit score, and
 * fit reason are filled in later by the pipeline, so leave them null.
 */
export interface Provider<TRaw = unknown> {
  id: Source;
  supports(category: Category): boolean;
  search(input: ProviderSearchInput): Promise<TRaw[]>;
  normalize(raw: TRaw): Suggestion;
}

/** Turns a typed city/ZIP into coordinates. */
export interface Geocoder {
  geocode(query: string): Promise<ResolvedLocation | null>;
}

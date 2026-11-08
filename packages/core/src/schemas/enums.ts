import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Interests: what the group is into (onboarding step 2).             */
/* ------------------------------------------------------------------ */

export const INTERESTS = [
  "live_music",
  "food_drink",
  "outdoors",
  "nightlife",
  "arts",
  "comedy",
  "sports",
  "fitness",
  "gaming",
  "markets",
  "learning",
] as const;

export const interestSchema = z.enum(INTERESTS);
export type Interest = z.infer<typeof interestSchema>;

export const INTEREST_LABELS: Record<Interest, string> = {
  live_music: "Live music",
  food_drink: "Food and drink",
  outdoors: "Outdoors",
  nightlife: "Nightlife",
  arts: "Arts",
  comedy: "Comedy",
  sports: "Sports",
  fitness: "Fitness",
  gaming: "Gaming",
  markets: "Markets",
  learning: "Learning",
};

/* ------------------------------------------------------------------ */
/* Event types: formats the group likes (onboarding step 3).          */
/* ------------------------------------------------------------------ */

export const EVENT_TYPES = [
  "concerts",
  "sports_games",
  "movies",
  "theater",
  "comedy_shows",
  "festivals",
  "bars_breweries",
  "restaurants",
  "outdoor_activities",
  "classes_workshops",
] as const;

export const eventTypeSchema = z.enum(EVENT_TYPES);
export type EventType = z.infer<typeof eventTypeSchema>;

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  concerts: "Concerts",
  sports_games: "Sports games",
  movies: "Movies",
  theater: "Theater",
  comedy_shows: "Comedy shows",
  festivals: "Festivals",
  bars_breweries: "Bars and breweries",
  restaurants: "Restaurants",
  outdoor_activities: "Outdoor activities",
  classes_workshops: "Classes and workshops",
};

/* ------------------------------------------------------------------ */
/* Category: what a single suggestion is. Providers declare support   */
/* per category, and results can be filtered by it.                   */
/* ------------------------------------------------------------------ */

export const CATEGORIES = [
  "concert",
  "sports",
  "movie",
  "theater",
  "comedy",
  "festival",
  "market",
  "bar",
  "restaurant",
  "nightlife",
  "outdoors",
  "class",
  "attraction",
  "other",
] as const;

export const categorySchema = z.enum(CATEGORIES);
export type Category = z.infer<typeof categorySchema>;

export const CATEGORY_LABELS: Record<Category, string> = {
  concert: "Concert",
  sports: "Sports",
  movie: "Movie",
  theater: "Theater",
  comedy: "Comedy",
  festival: "Festival",
  market: "Market",
  bar: "Bar",
  restaurant: "Restaurant",
  nightlife: "Nightlife",
  outdoors: "Outdoors",
  class: "Class",
  attraction: "Attraction",
  other: "Other",
};

/* ------------------------------------------------------------------ */
/* Travel radius (onboarding step 1).                                 */
/* ------------------------------------------------------------------ */

export const RADIUS_OPTIONS = [5, 10, 25, 50] as const;
export const radiusMilesSchema = z.literal(RADIUS_OPTIONS);
export type RadiusMiles = z.infer<typeof radiusMilesSchema>;
export const DEFAULT_RADIUS_MILES: RadiusMiles = 25;

/* ------------------------------------------------------------------ */
/* Data sources. Adding a provider means adding its id here first.    */
/* ------------------------------------------------------------------ */

export const SOURCES = ["ticketmaster", "google_places", "ai_web"] as const;
export const sourceSchema = z.enum(SOURCES);
export type Source = z.infer<typeof sourceSchema>;

/* ------------------------------------------------------------------ */
/* Group size (onboarding step 4).                                    */
/* ------------------------------------------------------------------ */

export const GROUP_SIZE_MIN = 1;
export const GROUP_SIZE_MAX = 20;
const GROUP_SIZE_MESSAGE = `Enter a group size from ${GROUP_SIZE_MIN} to ${GROUP_SIZE_MAX}`;
export const groupSizeSchema = z
  .int({ error: GROUP_SIZE_MESSAGE })
  .min(GROUP_SIZE_MIN, GROUP_SIZE_MESSAGE)
  .max(GROUP_SIZE_MAX, GROUP_SIZE_MESSAGE);

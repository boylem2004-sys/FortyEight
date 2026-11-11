import {
  CATEGORIES,
  INTERESTS,
  type Category,
  type EventType,
  type Interest,
} from "./schemas/enums";

/** Which suggestion categories each liked event type maps to. */
export const EVENT_TYPE_CATEGORIES: Record<EventType, readonly Category[]> = {
  concerts: ["concert"],
  sports_games: ["sports"],
  movies: ["movie"],
  theater: ["theater"],
  comedy_shows: ["comedy"],
  festivals: ["festival", "market"],
  bars_breweries: ["bar", "nightlife"],
  restaurants: ["restaurant"],
  outdoor_activities: ["outdoors"],
  classes_workshops: ["class"],
};

/** Which suggestion categories each interest tends to show up in. */
export const INTEREST_CATEGORIES: Record<Interest, readonly Category[]> = {
  live_music: ["concert", "festival", "bar"],
  food_drink: ["restaurant", "bar", "market", "festival"],
  outdoors: ["outdoors"],
  nightlife: ["nightlife", "bar", "concert"],
  arts: ["theater", "attraction", "class"],
  comedy: ["comedy"],
  sports: ["sports"],
  fitness: ["outdoors", "class"],
  gaming: ["attraction", "bar"],
  markets: ["market", "festival"],
  learning: ["class", "attraction"],
};

/** Interests implied by each event type. Onboarding only asks for event types. */
export const EVENT_TYPE_INTERESTS: Record<EventType, readonly Interest[]> = {
  concerts: ["live_music"],
  sports_games: ["sports"],
  movies: ["arts"],
  theater: ["arts"],
  comedy_shows: ["comedy"],
  festivals: ["markets", "food_drink"],
  bars_breweries: ["nightlife", "food_drink"],
  restaurants: ["food_drink"],
  outdoor_activities: ["outdoors", "fitness"],
  classes_workshops: ["learning"],
};

/** Unique interests for the picked event types, in the standard interest order. */
export function interestsForEventTypes(eventTypes: readonly EventType[]): Interest[] {
  const set = new Set<Interest>();
  for (const type of eventTypes) {
    for (const interest of EVENT_TYPE_INTERESTS[type]) set.add(interest);
  }
  return INTERESTS.filter((i) => set.has(i));
}

/**
 * Categories to search for. Liked event types decide the search. If none are
 * picked we search everything rather than return an empty plan.
 */
export function targetCategories(eventTypes: readonly EventType[]): Category[] {
  if (eventTypes.length === 0) return [...CATEGORIES];
  const set = new Set<Category>();
  for (const type of eventTypes) {
    for (const category of EVENT_TYPE_CATEGORIES[type]) set.add(category);
  }
  return CATEGORIES.filter((c) => set.has(c));
}

/** Interests that point at a given category, used for ranking and reasons. */
export function interestsMatchingCategory(
  interests: readonly Interest[],
  category: Category,
): Interest[] {
  return interests.filter((interest) => INTEREST_CATEGORIES[interest].includes(category));
}

/** Event types that point at a given category. */
export function eventTypesMatchingCategory(
  eventTypes: readonly EventType[],
  category: Category,
): EventType[] {
  return eventTypes.filter((type) => EVENT_TYPE_CATEGORIES[type].includes(category));
}

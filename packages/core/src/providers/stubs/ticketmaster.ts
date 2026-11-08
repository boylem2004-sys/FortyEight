import type { Category } from "../../schemas/enums";
import { suggestionId, type Suggestion } from "../../schemas/suggestion";
import type { Provider, ProviderSearchInput } from "../types";
import {
  fixtureStartsAt,
  fixtureUrl,
  placeFixture,
  type FixturePlacement,
} from "./fixture-helpers";

/**
 * Subset of a Ticketmaster Discovery API v2 event. The Phase 1 provider will
 * fetch these for real; `normalizeTicketmasterEvent` is meant to be reused.
 */
export interface TicketmasterEvent {
  id: string;
  name: string;
  url?: string;
  dates: { start: { dateTime?: string; localDate?: string; localTime?: string } };
  classifications?: { segment?: { name: string }; genre?: { name: string } }[];
  priceRanges?: { type?: string; currency: string; min: number; max: number }[];
  images?: { url: string; width?: number; height?: number }[];
  _embedded?: {
    venues?: { name?: string; location?: { latitude: string; longitude: string } }[];
  };
}

const SUPPORTED: readonly Category[] = ["concert", "sports", "theater", "comedy", "festival"];

export function ticketmasterCategory(event: TicketmasterEvent): Category {
  const c = event.classifications?.[0];
  const segment = c?.segment?.name.toLowerCase() ?? "";
  const genre = c?.genre?.name.toLowerCase() ?? "";
  if (segment === "music") return "concert";
  if (segment === "sports") return "sports";
  if (segment === "film") return "movie";
  if (segment === "arts & theatre") return genre.includes("comedy") ? "comedy" : "theater";
  if (genre.includes("festival") || genre.includes("fair")) return "festival";
  return "other";
}

const dollarsToCents = (dollars: number) => Math.round(dollars * 100);

export function normalizeTicketmasterEvent(event: TicketmasterEvent): Suggestion {
  const venue = event._embedded?.venues?.[0];
  const lat = venue?.location ? Number(venue.location.latitude) : NaN;
  const lng = venue?.location ? Number(venue.location.longitude) : NaN;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const prices = event.priceRanges ?? [];
  const priceKnown = prices.length > 0;

  return {
    id: suggestionId("ticketmaster", event.id),
    source: "ticketmaster",
    sourceId: event.id,
    title: event.name,
    category: ticketmasterCategory(event),
    startsAt: event.dates.start.dateTime ?? null,
    venueName: venue?.name ?? null,
    lat: hasCoords ? lat : null,
    lng: hasCoords ? lng : null,
    distanceMiles: null,
    priceMinCents: priceKnown ? dollarsToCents(Math.min(...prices.map((p) => p.min))) : null,
    priceMaxCents: priceKnown ? dollarsToCents(Math.max(...prices.map((p) => p.max))) : null,
    priceKnown,
    priceEstimated: false,
    url: event.url ?? null,
    imageUrl: event.images?.[0]?.url ?? null,
    fitScore: null,
    fitReason: null,
    verified: true,
  };
}

/* ------------------------------------------------------------------ */
/* Fixtures                                                           */
/* ------------------------------------------------------------------ */

interface EventFixture extends FixturePlacement {
  id: string;
  name: string;
  segment: string;
  genre: string;
  venue: string;
  price?: [min: number, max: number];
}

/** Invented sample events. Not real listings. */
export const TICKETMASTER_FIXTURES: readonly EventFixture[] = [
  {
    id: "tm-night-owls",
    name: "The Night Owls with Paper Lanterns",
    segment: "Music",
    genre: "Rock",
    venue: "Union Hall",
    day: 1,
    time: "20:00",
    northMiles: 3,
    eastMiles: 2,
    price: [28, 45],
  },
  {
    id: "tm-brass-bluegrass",
    name: "Brass and Bluegrass Saturday",
    segment: "Music",
    genre: "Folk",
    venue: "Riverside Amphitheater",
    day: 1,
    time: "18:30",
    northMiles: -8,
    eastMiles: -4,
    price: [20, 35],
  },
  {
    id: "tm-late-laughs",
    name: "Late Night Laughs Showcase",
    segment: "Arts & Theatre",
    genre: "Comedy",
    venue: "The Punchline Room",
    day: 0,
    time: "21:00",
    northMiles: 2,
    eastMiles: -1,
    price: [18, 25],
  },
  {
    id: "tm-stallions-hawks",
    name: "City Stallions vs. Harbor Hawks",
    segment: "Sports",
    genre: "Hockey",
    venue: "Metro Arena",
    day: 1,
    time: "19:00",
    northMiles: -14,
    eastMiles: 6,
    price: [35, 120],
  },
  {
    id: "tm-valley-thunder",
    name: "Valley Thunder Basketball",
    segment: "Sports",
    genre: "Basketball",
    venue: "Valley Fieldhouse",
    day: 2,
    time: "14:00",
    northMiles: 6,
    eastMiles: -9,
    price: [12, 22],
  },
  {
    id: "tm-lantern-keeper",
    name: "The Lantern Keeper: A New Musical",
    segment: "Arts & Theatre",
    genre: "Theatre",
    venue: "Grand Street Theater",
    day: 1,
    time: "19:30",
    northMiles: -10,
    eastMiles: 3,
    price: [45, 90],
  },
  {
    id: "tm-static-bloom",
    name: "Indie Night: Static Bloom and Coastlines",
    segment: "Music",
    genre: "Indie",
    venue: "The Basement",
    day: 2,
    time: "19:00",
    northMiles: -4,
    eastMiles: -5,
  },
  {
    id: "tm-harvest-lights",
    name: "Harvest Lights Festival",
    segment: "Miscellaneous",
    genre: "Fairs & Festivals",
    venue: "Commons Park",
    day: 1,
    time: "12:00",
    northMiles: 5,
    eastMiles: 7,
    price: [0, 0],
  },
  {
    id: "tm-symphony-dome",
    name: "Symphony Under the Dome",
    segment: "Music",
    genre: "Classical",
    venue: "Hillcrest Concert Hall",
    day: 0,
    time: "19:30",
    northMiles: -22,
    eastMiles: 10,
    price: [35, 75],
  },
  {
    id: "tm-brunch-standup",
    name: "Stand-Up Sunday Brunch Set",
    segment: "Arts & Theatre",
    genre: "Comedy",
    venue: "Corner Club",
    day: 2,
    time: "12:00",
    northMiles: 7,
    eastMiles: -2,
    price: [15, 15],
  },
  {
    id: "tm-midnight-static",
    name: "Arena Tour: Midnight Static",
    segment: "Music",
    genre: "Pop",
    venue: "Metro Arena",
    day: 0,
    time: "20:00",
    northMiles: -14,
    eastMiles: 6,
    price: [95, 250],
  },
  {
    id: "tm-wrestling-night",
    name: "Regional Wrestling Night",
    segment: "Sports",
    genre: "Wrestling",
    venue: "Expo Center",
    day: 0,
    time: "19:00",
    northMiles: 38,
    eastMiles: -20,
    price: [25, 60],
  },
];

function fixtureToEvent(f: EventFixture, input: ProviderSearchInput): TicketmasterEvent {
  const { lat, lng } = placeFixture(f, input);
  return {
    id: f.id,
    name: f.name,
    url: fixtureUrl("ticketmaster", f.id),
    dates: { start: { dateTime: fixtureStartsAt(f, input) } },
    classifications: [{ segment: { name: f.segment }, genre: { name: f.genre } }],
    priceRanges: f.price
      ? [{ type: "standard", currency: "USD", min: f.price[0], max: f.price[1] }]
      : undefined,
    _embedded: {
      venues: [{ name: f.venue, location: { latitude: String(lat), longitude: String(lng) } }],
    },
  };
}

/** Stub Ticketmaster provider. Returns fixtures placed around the search center. */
export const stubTicketmasterProvider: Provider<TicketmasterEvent> = {
  id: "ticketmaster",
  supports: (category) => SUPPORTED.includes(category),
  async search(input) {
    return TICKETMASTER_FIXTURES.map((f) => fixtureToEvent(f, input)).filter((event) =>
      input.categories.includes(ticketmasterCategory(event)),
    );
  },
  normalize: normalizeTicketmasterEvent,
};

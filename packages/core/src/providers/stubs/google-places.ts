import type { Category } from "../../schemas/enums";
import { suggestionId, type Suggestion } from "../../schemas/suggestion";
import type { Provider, ProviderSearchInput } from "../types";
import { fixtureUrl, placeFixture } from "./fixture-helpers";

export type GooglePriceLevel =
  | "PRICE_LEVEL_FREE"
  | "PRICE_LEVEL_INEXPENSIVE"
  | "PRICE_LEVEL_MODERATE"
  | "PRICE_LEVEL_EXPENSIVE"
  | "PRICE_LEVEL_VERY_EXPENSIVE";

interface GoogleMoney {
  currencyCode: string;
  units: string;
}

/** Subset of a Google Places API (New) place, matching the field mask we plan to use. */
export interface GooglePlace {
  id: string;
  displayName: { text: string };
  primaryType?: string;
  formattedAddress?: string;
  location: { latitude: number; longitude: number };
  priceLevel?: GooglePriceLevel;
  priceRange?: { startPrice?: GoogleMoney; endPrice?: GoogleMoney };
  googleMapsUri?: string;
  rating?: number;
}

const SUPPORTED: readonly Category[] = [
  "bar",
  "restaurant",
  "nightlife",
  "outdoors",
  "attraction",
  "market",
];

const TYPE_TO_CATEGORY: Record<string, Category> = {
  bar: "bar",
  pub: "bar",
  wine_bar: "bar",
  brewery: "bar",
  night_club: "nightlife",
  restaurant: "restaurant",
  cafe: "restaurant",
  park: "outdoors",
  hiking_area: "outdoors",
  national_park: "outdoors",
  marina: "outdoors",
  museum: "attraction",
  art_gallery: "attraction",
  bowling_alley: "attraction",
  amusement_park: "attraction",
  tourist_attraction: "attraction",
  zoo: "attraction",
  aquarium: "attraction",
  movie_theater: "movie",
  market: "market",
  farmers_market: "market",
};

export function googlePlaceCategory(place: GooglePlace): Category {
  const type = place.primaryType ?? "";
  if (TYPE_TO_CATEGORY[type]) return TYPE_TO_CATEGORY[type];
  if (type.endsWith("_restaurant")) return "restaurant";
  return "other";
}

/** Rough per-person spend by Google price level. Used only when there is no price range. */
export const PRICE_LEVEL_ESTIMATES: Record<GooglePriceLevel, [minCents: number, maxCents: number]> =
  {
    PRICE_LEVEL_FREE: [0, 0],
    PRICE_LEVEL_INEXPENSIVE: [0, 1500],
    PRICE_LEVEL_MODERATE: [1500, 3000],
    PRICE_LEVEL_EXPENSIVE: [3000, 6000],
    PRICE_LEVEL_VERY_EXPENSIVE: [6000, 10000],
  };

const unitsToCents = (money?: GoogleMoney) => {
  if (!money) return null;
  const n = Number(money.units);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
};

function placePrice(place: GooglePlace) {
  const start = unitsToCents(place.priceRange?.startPrice);
  const end = unitsToCents(place.priceRange?.endPrice);
  if (start !== null || end !== null) {
    return {
      priceMinCents: start ?? end,
      priceMaxCents: end ?? start,
      priceKnown: true,
      priceEstimated: false,
    };
  }
  if (place.priceLevel) {
    const [min, max] = PRICE_LEVEL_ESTIMATES[place.priceLevel];
    // "Free" is a definite statement, not an estimate.
    const estimated = place.priceLevel !== "PRICE_LEVEL_FREE";
    return { priceMinCents: min, priceMaxCents: max, priceKnown: true, priceEstimated: estimated };
  }
  return { priceMinCents: null, priceMaxCents: null, priceKnown: false, priceEstimated: false };
}

export function normalizeGooglePlace(place: GooglePlace): Suggestion {
  return {
    id: suggestionId("google_places", place.id),
    source: "google_places",
    sourceId: place.id,
    title: place.displayName.text,
    category: googlePlaceCategory(place),
    // Places are open across the weekend. Opening hours come in Phase 1.
    startsAt: null,
    venueName: place.formattedAddress ?? null,
    lat: place.location.latitude,
    lng: place.location.longitude,
    distanceMiles: null,
    ...placePrice(place),
    url: place.googleMapsUri ?? null,
    imageUrl: null,
    fitScore: null,
    fitReason: null,
    verified: true,
  };
}

/* ------------------------------------------------------------------ */
/* Fixtures                                                           */
/* ------------------------------------------------------------------ */

interface PlaceFixture {
  id: string;
  name: string;
  type: string;
  address: string;
  northMiles: number;
  eastMiles: number;
  priceLevel?: GooglePriceLevel;
  priceRange?: [min: number, max: number];
  rating: number;
}

/** Invented sample places. Not real businesses. */
export const GOOGLE_PLACES_FIXTURES: readonly PlaceFixture[] = [
  {
    id: "gp-copper-kettle",
    name: "Copper Kettle Brewing",
    type: "brewery",
    address: "41 Mill St",
    northMiles: 2,
    eastMiles: 3,
    priceLevel: "PRICE_LEVEL_MODERATE",
    rating: 4.6,
  },
  {
    id: "gp-juniper-smoke",
    name: "Juniper and Smoke BBQ",
    type: "barbecue_restaurant",
    address: "980 Ridge Pike",
    northMiles: -1,
    eastMiles: 1,
    priceRange: [20, 30],
    rating: 4.5,
  },
  {
    id: "gp-ridgeline-trail",
    name: "Ridgeline Trail Park",
    type: "hiking_area",
    address: "Ridgeline Rd",
    northMiles: 6,
    eastMiles: -8,
    priceLevel: "PRICE_LEVEL_FREE",
    rating: 4.8,
  },
  {
    id: "gp-neon-pins",
    name: "Neon Pins Bowl and Arcade",
    type: "bowling_alley",
    address: "300 Market Sq",
    northMiles: -5,
    eastMiles: 2,
    priceLevel: "PRICE_LEVEL_INEXPENSIVE",
    rating: 4.2,
  },
  {
    id: "gp-velvet-room",
    name: "The Velvet Room",
    type: "night_club",
    address: "12 Second St",
    northMiles: -9,
    eastMiles: 4,
    priceLevel: "PRICE_LEVEL_EXPENSIVE",
    rating: 4.0,
  },
  {
    id: "gp-taqueria-sol",
    name: "Taqueria Sol",
    type: "mexican_restaurant",
    address: "77 Oak Ave",
    northMiles: 3,
    eastMiles: -0.5,
    priceLevel: "PRICE_LEVEL_INEXPENSIVE",
    rating: 4.7,
  },
  {
    id: "gp-old-mill-market",
    name: "Old Mill Farmers Market",
    type: "farmers_market",
    address: "5 Old Mill Ln",
    northMiles: 4,
    eastMiles: 6,
    priceLevel: "PRICE_LEVEL_FREE",
    rating: 4.6,
  },
  {
    id: "gp-lakeside-kayak",
    name: "Lakeside Kayak Rentals",
    type: "marina",
    address: "1 Lakeside Dr",
    northMiles: 11,
    eastMiles: -6,
    priceRange: [30, 45],
    rating: 4.4,
  },
  {
    id: "gp-gallery-48",
    name: "Gallery 48",
    type: "art_gallery",
    address: "48 Front St",
    northMiles: -3,
    eastMiles: -2,
    priceLevel: "PRICE_LEVEL_FREE",
    rating: 4.5,
  },
  {
    id: "gp-skyline-rooftop",
    name: "Skyline Rooftop Bar",
    type: "bar",
    address: "200 Tower Pl",
    northMiles: -12,
    eastMiles: 7,
    priceLevel: "PRICE_LEVEL_EXPENSIVE",
    rating: 4.3,
  },
  {
    id: "gp-chefs-table",
    name: "Chef's Table Tasting Room",
    type: "fine_dining_restaurant",
    address: "9 Park Row",
    northMiles: -16,
    eastMiles: 5,
    priceLevel: "PRICE_LEVEL_VERY_EXPENSIVE",
    rating: 4.9,
  },
  {
    id: "gp-board-brew",
    name: "Board and Brew Game Bar",
    type: "bar",
    address: "66 Elm St",
    northMiles: 1,
    eastMiles: 2,
    priceLevel: "PRICE_LEVEL_INEXPENSIVE",
    rating: 4.6,
  },
];

function fixtureToPlace(f: PlaceFixture, input: ProviderSearchInput): GooglePlace {
  const { lat, lng } = placeFixture(f, input);
  return {
    id: f.id,
    displayName: { text: f.name },
    primaryType: f.type,
    formattedAddress: f.address,
    location: { latitude: lat, longitude: lng },
    priceLevel: f.priceLevel,
    priceRange: f.priceRange
      ? {
          startPrice: { currencyCode: "USD", units: String(f.priceRange[0]) },
          endPrice: { currencyCode: "USD", units: String(f.priceRange[1]) },
        }
      : undefined,
    googleMapsUri: fixtureUrl("google_places", f.id),
    rating: f.rating,
  };
}

/** Stub Google Places provider. Returns fixtures placed around the search center. */
export const stubGooglePlacesProvider: Provider<GooglePlace> = {
  id: "google_places",
  supports: (category) => SUPPORTED.includes(category),
  async search(input) {
    return GOOGLE_PLACES_FIXTURES.map((f) => fixtureToPlace(f, input)).filter((place) =>
      input.categories.includes(googlePlaceCategory(place)),
    );
  },
  normalize: normalizeGooglePlace,
};

import type { ResolvedLocation } from "../../schemas/plan";
import type { Geocoder } from "../types";

interface KnownPlace {
  label: string;
  lat: number;
  lng: number;
  /** Lowercase strings that match this place. */
  aliases: string[];
}

const KNOWN_PLACES: readonly KnownPlace[] = [
  { label: "Blue Bell, PA", lat: 40.1523, lng: -75.2663, aliases: ["blue bell", "19422"] },
  {
    label: "King of Prussia, PA",
    lat: 40.0893,
    lng: -75.3963,
    aliases: ["king of prussia", "kop", "19406"],
  },
  {
    label: "Philadelphia, PA",
    lat: 39.9526,
    lng: -75.1652,
    aliases: ["philadelphia", "philly", "19103", "19107"],
  },
  { label: "Pittsburgh, PA", lat: 40.4406, lng: -79.9959, aliases: ["pittsburgh", "15222"] },
  {
    label: "New York, NY",
    lat: 40.7128,
    lng: -74.006,
    aliases: ["new york", "nyc", "brooklyn", "10001"],
  },
  { label: "Boston, MA", lat: 42.3601, lng: -71.0589, aliases: ["boston", "02108"] },
  { label: "Washington, DC", lat: 38.9072, lng: -77.0369, aliases: ["washington", "dc", "20001"] },
  { label: "Chicago, IL", lat: 41.8781, lng: -87.6298, aliases: ["chicago", "60601"] },
  { label: "Austin, TX", lat: 30.2672, lng: -97.7431, aliases: ["austin", "78701"] },
  { label: "Denver, CO", lat: 39.7392, lng: -104.9903, aliases: ["denver", "80202"] },
  {
    label: "Los Angeles, CA",
    lat: 34.0522,
    lng: -118.2437,
    aliases: ["los angeles", "la", "90012"],
  },
  {
    label: "San Francisco, CA",
    lat: 37.7749,
    lng: -122.4194,
    aliases: ["san francisco", "sf", "94103"],
  },
];

const FALLBACK = KNOWN_PLACES[2]!;

function matches(query: string, alias: string): boolean {
  // Short aliases ("la", "dc", "sf") must match a whole word.
  if (alias.length <= 3) return new RegExp(`\\b${alias}\\b`).test(query);
  return query.includes(alias);
}

/**
 * Phase 0 geocoder. Knows a handful of places and otherwise falls back to
 * Philadelphia, flagged as approximate. Replaced by Google Geocoding in Phase 1.
 */
export const fixtureGeocoder: Geocoder = {
  async geocode(query) {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const hit = KNOWN_PLACES.find((p) => p.aliases.some((a) => matches(q, a)));
    const place = hit ?? FALLBACK;
    const result: ResolvedLocation = {
      label: place.label,
      lat: place.lat,
      lng: place.lng,
      approximate: !hit,
    };
    return result;
  },
};

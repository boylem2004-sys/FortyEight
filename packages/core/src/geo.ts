import { z } from "zod";

export const latLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type LatLng = z.infer<typeof latLngSchema>;

const EARTH_RADIUS_MILES = 3958.8;
const MILES_PER_DEGREE_LAT = 69.0;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in miles. */
export function haversineMiles(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Moves a point by a number of miles north and east. Good enough for short hops. */
export function offsetLatLng(origin: LatLng, northMiles: number, eastMiles: number): LatLng {
  const lat = origin.lat + northMiles / MILES_PER_DEGREE_LAT;
  const lng = origin.lng + eastMiles / (MILES_PER_DEGREE_LAT * Math.cos(toRad(origin.lat)));
  return { lat, lng };
}

/** One decimal place, for display and storage. */
export function roundMiles(miles: number): number {
  return Math.round(miles * 10) / 10;
}

export function formatDistance(miles: number | null): string | null {
  if (miles === null) return null;
  if (miles < 0.1) return "Nearby";
  return `${roundMiles(miles)} mi`;
}

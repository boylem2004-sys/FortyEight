import { describe, expect, it } from "vitest";
import { formatDistance, haversineMiles, offsetLatLng, roundMiles } from "./geo";

const PHILLY = { lat: 39.9526, lng: -75.1652 };
const NYC = { lat: 40.7128, lng: -74.006 };

describe("geo", () => {
  it("measures Philadelphia to New York at about 81 miles", () => {
    expect(haversineMiles(PHILLY, NYC)).toBeGreaterThan(79);
    expect(haversineMiles(PHILLY, NYC)).toBeLessThan(83);
  });

  it("is zero for the same point", () => {
    expect(haversineMiles(PHILLY, PHILLY)).toBe(0);
  });

  it("offsets a point by the requested miles", () => {
    const moved = offsetLatLng(PHILLY, 3, 4);
    expect(haversineMiles(PHILLY, moved)).toBeCloseTo(5, 1);
  });

  it("rounds and formats distance", () => {
    expect(roundMiles(3.14159)).toBe(3.1);
    expect(formatDistance(3.14159)).toBe("3.1 mi");
    expect(formatDistance(0.05)).toBe("Nearby");
    expect(formatDistance(null)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { describePrice, isFree } from "./price";

const priced = (
  min: number | null,
  max: number | null,
  opts: { estimated?: boolean; known?: boolean } = {},
) => ({
  priceMinCents: min,
  priceMaxCents: max,
  priceEstimated: opts.estimated ?? false,
  priceKnown: opts.known ?? true,
});

describe("isFree", () => {
  it("is true only when both ends are zero", () => {
    expect(isFree(priced(0, 0))).toBe(true);
    expect(isFree(priced(0, 1500, { estimated: true }))).toBe(false);
    expect(isFree(priced(null, null, { known: false }))).toBe(false);
  });
});

describe("describePrice", () => {
  it("handles unknown and free", () => {
    expect(describePrice(priced(null, null, { known: false }), 4)).toEqual({
      perPerson: "Price not listed",
      group: null,
    });
    expect(describePrice(priced(0, 0), 4)).toEqual({ perPerson: "Free", group: null });
  });

  it("shows a range and the group total", () => {
    expect(describePrice(priced(2800, 4500), 4)).toEqual({
      perPerson: "$28-$45 per person",
      group: "$112-$180 for your group of 4",
    });
  });

  it("marks estimates", () => {
    expect(describePrice(priced(1500, 3000, { estimated: true }), 2)).toEqual({
      perPerson: "About $15-$30 per person",
      group: "About $30-$60 for your group of 2",
    });
  });

  it("leads with the ceiling when the low end is $0", () => {
    expect(describePrice(priced(0, 1500, { estimated: true }), 4)).toEqual({
      perPerson: "Up to about $15 per person",
      group: "Up to about $60 for your group of 4",
    });
    expect(describePrice(priced(0, 1500), 1)).toEqual({
      perPerson: "Up to $15 per person",
      group: null,
    });
  });

  it("skips the group line for one person", () => {
    expect(describePrice(priced(2000, 2000), 1)).toEqual({
      perPerson: "$20 per person",
      group: null,
    });
  });
});

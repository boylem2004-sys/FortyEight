import { describe, expect, it } from "vitest";
import {
  BUDGET_PRESETS,
  budgetFromPreset,
  budgetLabel,
  budgetSchema,
  formatCents,
  formatPriceRange,
  groupPriceRange,
  presetForBudget,
} from "./budget";

describe("budget presets", () => {
  it("round-trips every preset", () => {
    for (const preset of BUDGET_PRESETS) {
      expect(presetForBudget(budgetFromPreset(preset.id))?.id).toBe(preset.id);
    }
  });

  it("stores $100+ as a min with no max", () => {
    expect(budgetFromPreset("over_100")).toEqual({ minCents: 10000, maxCents: null });
  });

  it("returns null for a custom budget", () => {
    expect(presetForBudget({ minCents: 500, maxCents: 3000 })).toBeNull();
  });

  it("labels presets and custom budgets", () => {
    expect(budgetLabel({ minCents: 0, maxCents: 5000 })).toBe("Under $50");
    expect(budgetLabel({ minCents: 500, maxCents: 3000 })).toBe("$5 to $30");
    expect(budgetLabel({ minCents: 20000, maxCents: null })).toBe("$200+");
  });
});

describe("budgetSchema", () => {
  it("rejects max below min", () => {
    expect(budgetSchema.safeParse({ minCents: 5000, maxCents: 1000 }).success).toBe(false);
  });
  it("rejects fractional cents", () => {
    expect(budgetSchema.safeParse({ minCents: 0, maxCents: 10.5 }).success).toBe(false);
  });
  it("accepts an open-ended max", () => {
    expect(budgetSchema.safeParse({ minCents: 10000, maxCents: null }).success).toBe(true);
  });
});

describe("price formatting", () => {
  it("formats cents", () => {
    expect(formatCents(0)).toBe("Free");
    expect(formatCents(2500)).toBe("$25");
    expect(formatCents(1250)).toBe("$12.50");
    expect(formatCents(150000)).toBe("$1,500");
  });

  it("formats ranges", () => {
    expect(formatPriceRange({ minCents: null, maxCents: null })).toBeNull();
    expect(formatPriceRange({ minCents: 0, maxCents: 0 })).toBe("Free");
    expect(formatPriceRange({ minCents: 1500, maxCents: 1500 })).toBe("$15");
    expect(formatPriceRange({ minCents: 2000, maxCents: 4500 })).toBe("$20-$45");
    expect(formatPriceRange({ minCents: 0, maxCents: 1500 })).toBe("Free to $15");
    expect(formatPriceRange({ minCents: 2000, maxCents: null })).toBe("$20");
  });

  it("multiplies prices out for the group", () => {
    expect(groupPriceRange({ minCents: 2000, maxCents: 4500 }, 4)).toEqual({
      minCents: 8000,
      maxCents: 18000,
    });
    expect(groupPriceRange({ minCents: null, maxCents: null }, 4)).toBeNull();
  });
});

import { z } from "zod";

/** Budget is per person, per weekend, stored as integer cents. */
export const budgetSchema = z
  .object({
    minCents: z.int().min(0),
    /** null means no upper limit. */
    maxCents: z.int().min(0).nullable(),
  })
  .refine((b) => b.maxCents === null || b.maxCents >= b.minCents, {
    message: "Max budget must be at least the min budget",
    path: ["maxCents"],
  });

export type Budget = z.infer<typeof budgetSchema>;

export const BUDGET_PRESETS = [
  { id: "free", label: "Free", minCents: 0, maxCents: 0 },
  { id: "under_25", label: "Under $25", minCents: 0, maxCents: 2500 },
  { id: "under_50", label: "Under $50", minCents: 0, maxCents: 5000 },
  { id: "under_100", label: "Under $100", minCents: 0, maxCents: 10000 },
  { id: "over_100", label: "$100+", minCents: 10000, maxCents: null },
] as const satisfies readonly {
  id: string;
  label: string;
  minCents: number;
  maxCents: number | null;
}[];

export type BudgetPreset = (typeof BUDGET_PRESETS)[number];
export type BudgetPresetId = BudgetPreset["id"];

export const DEFAULT_BUDGET_PRESET_ID: BudgetPresetId = "under_50";

export function budgetFromPreset(id: BudgetPresetId): Budget {
  const preset = BUDGET_PRESETS.find((p) => p.id === id);
  if (!preset) throw new Error(`Unknown budget preset: ${id}`);
  return { minCents: preset.minCents, maxCents: preset.maxCents };
}

/** Returns the preset that exactly matches a budget, or null for a custom budget. */
export function presetForBudget(budget: Budget): BudgetPreset | null {
  return (
    BUDGET_PRESETS.find((p) => p.minCents === budget.minCents && p.maxCents === budget.maxCents) ??
    null
  );
}

export function budgetLabel(budget: Budget): string {
  const preset = presetForBudget(budget);
  if (preset) return preset.label;
  if (budget.maxCents === null) return `${formatCents(budget.minCents)}+`;
  return `${formatCents(budget.minCents)} to ${formatCents(budget.maxCents)}`;
}

/** "$25", "$12.50", or "Free" for zero. */
export function formatCents(cents: number): string {
  if (cents === 0) return "Free";
  const dollars = cents / 100;
  const hasCents = cents % 100 !== 0;
  return `$${dollars.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  })}`;
}

export interface PriceRange {
  minCents: number | null;
  maxCents: number | null;
}

/** Human price text for one person. Returns null when there is no price data. */
export function formatPriceRange({ minCents, maxCents }: PriceRange): string | null {
  if (minCents === null && maxCents === null) return null;
  const low = minCents ?? maxCents ?? 0;
  const high = maxCents ?? minCents ?? 0;
  if (high === 0) return "Free";
  if (low === high) return formatCents(low);
  if (low === 0) return `Free to ${formatCents(high)}`;
  return `${formatCents(low)}-${formatCents(high)}`;
}

/** Price range multiplied out for the whole group. */
export function groupPriceRange(price: PriceRange, groupSize: number): PriceRange | null {
  if (price.minCents === null && price.maxCents === null) return null;
  return {
    minCents: price.minCents === null ? null : price.minCents * groupSize,
    maxCents: price.maxCents === null ? null : price.maxCents * groupSize,
  };
}

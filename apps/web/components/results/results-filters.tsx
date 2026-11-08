"use client";

import {
  BUDGET_PRESETS,
  CATEGORY_LABELS,
  formatDayLabel,
  RADIUS_OPTIONS,
  type Category,
  type IsoDate,
  type ResultFilters,
} from "@fortyeight/core";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

interface Props {
  filters: ResultFilters;
  onChange: (next: ResultFilters) => void;
  categories: Category[];
  days: IsoDate[];
  radiusMiles: number;
}

const PRICE_OPTIONS = BUDGET_PRESETS.filter((p) => p.maxCents !== null);

export function ResultsFilters({ filters, onChange, categories, days, radiusMiles }: Props) {
  const distances = RADIUS_OPTIONS.filter((r) => r < radiusMiles);
  return (
    <fieldset className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <legend className="sr-only">Filter results</legend>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-category" className="text-xs text-muted-foreground">
          Category
        </Label>
        <NativeSelect
          id="filter-category"
          value={filters.category ?? ""}
          onChange={(e) =>
            onChange({ ...filters, category: (e.target.value || null) as Category | null })
          }
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-price" className="text-xs text-muted-foreground">
          Max price
        </Label>
        <NativeSelect
          id="filter-price"
          value={filters.maxPriceCents ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              maxPriceCents: e.target.value === "" ? null : Number(e.target.value),
            })
          }
        >
          <option value="">Any</option>
          {PRICE_OPTIONS.map((p) => (
            <option key={p.id} value={p.maxCents ?? ""}>
              {p.label}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-distance" className="text-xs text-muted-foreground">
          Distance
        </Label>
        <NativeSelect
          id="filter-distance"
          value={filters.maxDistanceMiles ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              maxDistanceMiles: e.target.value === "" ? null : Number(e.target.value),
            })
          }
        >
          <option value="">Within {radiusMiles} mi</option>
          {distances.map((d) => (
            <option key={d} value={d}>
              Within {d} mi
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-day" className="text-xs text-muted-foreground">
          Day
        </Label>
        <NativeSelect
          id="filter-day"
          value={filters.day ?? ""}
          onChange={(e) => onChange({ ...filters, day: e.target.value || null })}
        >
          <option value="">Any day</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {formatDayLabel(d)}
            </option>
          ))}
        </NativeSelect>
      </div>
    </fieldset>
  );
}

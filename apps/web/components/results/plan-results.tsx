"use client";

import {
  budgetLabel,
  categoriesIn,
  EMPTY_RESULT_FILTERS,
  filterResults,
  formatDateRange,
  listDates,
  type Plan,
  type ResultFilters,
} from "@fortyeight/core";
import { FlaskConical, Info, RefreshCw, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePlansStore } from "@/lib/stores/plans-store";
import { ResultsFilters } from "./results-filters";
import { SharePlan } from "./share-plan";
import { SuggestionCard } from "./suggestion-card";

export function PlanResults({ plan }: { plan: Plan }) {
  const router = useRouter();
  const requestPlan = usePlansStore((s) => s.requestPlan);
  const [filters, setFilters] = useState<ResultFilters>(EMPTY_RESULT_FILTERS);

  const { preferences, dateRange, timezone } = plan.input;
  const visible = filterResults(plan.items, filters, timezone);
  const filtered = visible.length !== plan.items.length;
  const typedLabel = preferences.location.label;

  function regenerate() {
    requestPlan(plan.input);
    router.push("/results/new");
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl text-balance">
          Your weekend near {plan.location.label}
        </h1>
        <p className="text-muted-foreground">
          {formatDateRange(dateRange)} ·{" "}
          {preferences.groupSize === 1 ? "Just you" : `${preferences.groupSize} people`} ·{" "}
          {budgetLabel(preferences.budget)} per person
        </p>
      </header>

      {plan.meta.fixtureData && (
        <p className="flex gap-2 rounded-2xl bg-card p-4 text-sm">
          <FlaskConical aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>
            <span className="font-semibold">Sample data.</span> These picks are made up so you can
            try the flow. Real events and places are coming soon.
          </span>
        </p>
      )}

      {plan.location.approximate && (
        <p className="flex gap-2 rounded-2xl bg-highlight-wash p-4 text-highlight text-sm">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>
            We can&apos;t look up &ldquo;{typedLabel}&rdquo; yet, so these are around{" "}
            {plan.location.label}.
          </span>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {plan.items.length > 0 && <SharePlan plan={plan} />}
        <Button onClick={regenerate} variant="secondary">
          <RefreshCw aria-hidden />
          Regenerate
        </Button>
        <Button asChild variant="outline">
          <Link href="/plan">Change dates</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/onboarding/location">
            <SlidersHorizontal aria-hidden />
            Edit preferences
          </Link>
        </Button>
      </div>

      {plan.items.length === 0 ? (
        <div className="rounded-card border border-dashed border-border p-8 text-center">
          <h2 className="text-lg font-semibold">Nothing fit this time</h2>
          <p className="mt-1 text-muted-foreground">
            Try a bigger travel radius, a higher budget, or more event types.
          </p>
          <Button asChild className="mt-4">
            <Link href="/onboarding/location">Edit preferences</Link>
          </Button>
        </div>
      ) : (
        <>
          <ResultsFilters
            filters={filters}
            onChange={setFilters}
            categories={categoriesIn(plan.items)}
            days={listDates(dateRange)}
            radiusMiles={preferences.radiusMiles}
          />

          <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
            {filtered
              ? `Showing ${visible.length} of ${plan.items.length} picks`
              : `${plan.items.length} picks, best first`}
          </p>

          {visible.length === 0 ? (
            <div className="rounded-card border border-dashed border-border p-8 text-center">
              <h2 className="text-lg font-semibold">No picks match these filters</h2>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setFilters(EMPTY_RESULT_FILTERS)}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <ol className="grid gap-4 md:grid-cols-2">
              {visible.map((item) => (
                <li key={item.id}>
                  <SuggestionCard
                    item={item}
                    rank={plan.items.indexOf(item) + 1}
                    groupSize={preferences.groupSize}
                    timezone={timezone}
                  />
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}

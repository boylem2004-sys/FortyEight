"use client";

import {
  addDays,
  dateRangeProblem,
  dateRangeSchema,
  firstIncompleteStep,
  formatDateRange,
  MAX_DAYS_OUT,
  preferencesSchema,
  todayInTimeZone,
  upcomingWeekend,
  type DateRange,
} from "@fortyeight/core";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignInNotice } from "@/components/account/sign-in-notice";
import { FieldError } from "@/components/onboarding/field-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getBrowserTimeZone } from "@/lib/browser";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { usePlansStore } from "@/lib/stores/plans-store";
import { PreferencesSummary } from "./preferences-summary";

export function PlanSetup() {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="mx-auto flex max-w-content flex-col gap-4" aria-busy="true">
        <Skeleton className="h-9 w-1/2" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  return <PlanSetupForm />;
}

function rangeError(range: DateRange, today: string): string | undefined {
  const parsed = dateRangeSchema.safeParse(range);
  if (!parsed.success) return parsed.error.issues[0]?.message;
  const problem = dateRangeProblem(range, today);
  if (problem === "starts_in_past") return "Pick a start date of today or later.";
  if (problem === "too_far_out") return `Pick dates within the next ${MAX_DAYS_OUT} days.`;
  return undefined;
}

function PlanSetupForm() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const requestPlan = usePlansStore((s) => s.requestPlan);

  const [timezone] = useState(getBrowserTimeZone);
  const [today] = useState(() => todayInTimeZone(new Date(), timezone));
  const weekend = upcomingWeekend(today);
  const [mode, setMode] = useState<"weekend" | "custom">("weekend");
  const [custom, setCustom] = useState<DateRange>(weekend);
  const [submitted, setSubmitted] = useState(false);

  const prefs = preferencesSchema.safeParse(draft);
  if (!prefs.success) {
    const step = firstIncompleteStep(draft) ?? "location";
    return (
      <Card className="mx-auto max-w-content">
        <CardHeader>
          <CardTitle>
            <h1>A few questions first</h1>
          </CardTitle>
          <CardDescription>
            We need to know a bit about your group before we can plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={`/onboarding/${step}`}>Continue setup</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const range = mode === "weekend" ? weekend : custom;
  const error = mode === "custom" ? rangeError(custom, today) : undefined;
  const maxDate = addDays(today, MAX_DAYS_OUT);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (error || !prefs.success) return;
    requestPlan({ preferences: prefs.data, dateRange: range, timezone });
    router.push("/results/new");
  }

  const optionClass =
    "flex cursor-pointer items-start gap-3 rounded-3xl border border-transparent bg-card p-5 has-checked:border-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/60";

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto flex max-w-content flex-col gap-6">
      <SignInNotice />
      <div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          When are you going out?
        </h1>
        <p className="mt-2 text-muted-foreground">Then we&apos;ll find your best options.</p>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-semibold">Dates</legend>
        <label className={optionClass}>
          <input
            type="radio"
            name="date-mode"
            className="mt-1 accent-foreground"
            checked={mode === "weekend"}
            onChange={() => setMode("weekend")}
          />
          <span>
            <span className="block font-semibold">This weekend</span>
            <span className="block text-sm text-muted-foreground">{formatDateRange(weekend)}</span>
          </span>
        </label>
        <label className={optionClass}>
          <input
            type="radio"
            name="date-mode"
            className="mt-1 accent-foreground"
            checked={mode === "custom"}
            onChange={() => setMode("custom")}
          />
          <span>
            <span className="block font-semibold">Pick dates</span>
            <span className="block text-sm text-muted-foreground">
              Up to {MAX_DAYS_OUT} days out
            </span>
          </span>
        </label>

        {mode === "custom" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date-start">From</Label>
              <Input
                id="date-start"
                type="date"
                min={today}
                max={maxDate}
                value={custom.start}
                onChange={(e) => setCustom((c) => ({ ...c, start: e.target.value }))}
                aria-invalid={submitted && error ? true : undefined}
                aria-describedby={submitted && error ? "dates-error" : undefined}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="date-end">To</Label>
              <Input
                id="date-end"
                type="date"
                min={custom.start || today}
                max={maxDate}
                value={custom.end}
                onChange={(e) => setCustom((c) => ({ ...c, end: e.target.value }))}
                aria-invalid={submitted && error ? true : undefined}
                aria-describedby={submitted && error ? "dates-error" : undefined}
              />
            </div>
          </div>
        )}
        <FieldError id="dates-error" message={submitted ? error : undefined} />
      </fieldset>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Your group</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-1">
          <PreferencesSummary preferences={prefs.data} />
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full">
        <Sparkles aria-hidden />
        Plan my weekend
      </Button>
    </form>
  );
}

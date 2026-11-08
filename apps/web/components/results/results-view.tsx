"use client";

import { ApiClientError } from "@fortyeight/api-client";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { usePlanGeneration } from "@/lib/hooks/use-plan-generation";
import { usePlansStore } from "@/lib/stores/plans-store";
import { PlanResults } from "./plan-results";
import { ResultsSkeleton } from "./results-skeleton";

export function ResultsView({ planId }: { planId: string }) {
  const hydrated = useHydrated();
  if (!hydrated) return <ResultsSkeleton />;
  return planId === "new" ? <GeneratePlan /> : <StoredPlan planId={planId} />;
}

/** /results/new: builds the pending plan, then moves to its permanent URL. */
function GeneratePlan() {
  const router = useRouter();
  const pending = usePlansStore((s) => s.pending);
  const query = usePlanGeneration(pending);

  useEffect(() => {
    if (!pending) router.replace("/plan");
  }, [pending, router]);

  useEffect(() => {
    if (query.data) router.replace(`/results/${query.data.id}`);
  }, [query.data, router]);

  if (query.isError) {
    const err = query.error;
    const message =
      err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
    return (
      <Card className="mx-auto max-w-content" role="alert">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle aria-hidden className="size-5 text-destructive" />
            <h1>We couldn&apos;t build your plan</h1>
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => query.refetch()}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/plan">Change dates</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <ResultsSkeleton label="Finding the best things to do..." />;
}

/** /results/[id]: a plan saved on this device. */
function StoredPlan({ planId }: { planId: string }) {
  const plan = usePlansStore((s) => s.plans[planId]);
  if (!plan) {
    return (
      <Card className="mx-auto max-w-content">
        <CardHeader>
          <CardTitle>
            <h1>Plan not found</h1>
          </CardTitle>
          <CardDescription>
            Plans are only saved on the device that made them for now. Make a new one in a few
            seconds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/plan">Plan my weekend</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  return <PlanResults plan={plan} />;
}

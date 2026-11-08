"use client";

import { firstIncompleteStep } from "@fortyeight/core";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";

/** Main call to action. Returning users with saved answers skip straight to dates. */
export function HeroActions() {
  const hydrated = useHydrated();
  const draft = useOnboardingStore((s) => s.draft);
  const hasAnswers = hydrated && firstIncompleteStep(draft) === null;

  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <Button asChild size="lg" className="w-full sm:w-auto">
        <Link href={hasAnswers ? "/plan" : "/onboarding/location"}>
          Plan my weekend
          <ArrowRight aria-hidden />
        </Link>
      </Button>
      {hasAnswers && (
        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
          <Link href="/onboarding/location">Change my answers</Link>
        </Button>
      )}
    </div>
  );
}

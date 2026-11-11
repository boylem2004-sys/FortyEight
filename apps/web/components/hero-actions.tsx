"use client";

import { firstIncompleteStep } from "@fortyeight/core";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { cn } from "@/lib/utils";

/**
 * Main call to action. Returning users with saved answers skip straight to
 * dates. `secondary` adds the quieter second button under the hero.
 */
export function HeroActions({
  secondary = false,
  className,
}: {
  secondary?: boolean;
  className?: string;
}) {
  const hydrated = useHydrated();
  const draft = useOnboardingStore((s) => s.draft);
  const hasAnswers = hydrated && firstIncompleteStep(draft) === null;

  return (
    <div className={cn("flex flex-col items-center gap-3 sm:flex-row", className)}>
      <Button asChild size="lg" className="w-full sm:w-auto">
        <Link href={hasAnswers ? "/plan" : "/onboarding/location"}>
          Start planning your weekend
          <ArrowRight aria-hidden />
        </Link>
      </Button>
      {hasAnswers ? (
        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
          <Link href="/onboarding/location">Change my answers</Link>
        </Button>
      ) : (
        secondary && (
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/#how">See how it works</Link>
          </Button>
        )
      )}
    </div>
  );
}

"use client";

import type { OnboardingStep } from "@fortyeight/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { ActivitiesStepForm } from "./activities-step";
import { GroupStepForm } from "./group-step";
import { LocationStepForm } from "./location-step";

const FORMS: Record<OnboardingStep, () => React.JSX.Element> = {
  location: LocationStepForm,
  activities: ActivitiesStepForm,
  group: GroupStepForm,
};

export function OnboardingStepView({ step }: { step: OnboardingStep }) {
  // Answers live in device storage, so wait for it before showing the form.
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="mx-auto flex max-w-content flex-col gap-6" aria-busy="true">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  const Form = FORMS[step];
  return <Form key={step} />;
}

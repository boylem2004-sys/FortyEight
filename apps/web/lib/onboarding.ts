import { nextStep, type OnboardingStep } from "@fortyeight/core";

/** Where "Next" goes from a step. After the last question, pick dates. */
export function hrefAfterStep(step: OnboardingStep): string {
  const next = nextStep(step);
  return next ? `/onboarding/${next}` : "/plan";
}

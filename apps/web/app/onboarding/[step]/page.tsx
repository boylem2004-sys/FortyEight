import {
  isOnboardingStep,
  LEGACY_ONBOARDING_STEPS,
  ONBOARDING_STEPS,
  type OnboardingStep,
} from "@fortyeight/core";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OnboardingStepView } from "@/components/onboarding/onboarding-step-view";

const TITLES: Record<OnboardingStep, string> = {
  location: "Where are you?",
  activities: "What sounds good?",
  group: "Who's in, and what's the budget?",
};

type Props = { params: Promise<{ step: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  // Old step URLs are built too, so saved links redirect instead of 404.
  return [...ONBOARDING_STEPS, ...Object.keys(LEGACY_ONBOARDING_STEPS)].map((step) => ({ step }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { step } = await params;
  return { title: isOnboardingStep(step) ? TITLES[step] : "Get started" };
}

export default async function OnboardingStepPage({ params }: Props) {
  const { step } = await params;
  if (isOnboardingStep(step)) return <OnboardingStepView step={step} />;
  const current = (LEGACY_ONBOARDING_STEPS as Record<string, OnboardingStep>)[step];
  if (current) redirect(`/onboarding/${current}`);
  notFound();
}

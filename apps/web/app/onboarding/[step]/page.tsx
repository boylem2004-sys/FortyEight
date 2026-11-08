import { isOnboardingStep, ONBOARDING_STEPS, type OnboardingStep } from "@fortyeight/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OnboardingStepView } from "@/components/onboarding/onboarding-step-view";

const TITLES: Record<OnboardingStep, string> = {
  location: "Where are you?",
  interests: "What are you into?",
  "event-types": "What do you like to do?",
  group: "How many of you?",
  budget: "What's the budget?",
};

type Props = { params: Promise<{ step: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return ONBOARDING_STEPS.map((step) => ({ step }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { step } = await params;
  return { title: isOnboardingStep(step) ? TITLES[step] : "Get started" };
}

export default async function OnboardingStepPage({ params }: Props) {
  const { step } = await params;
  if (!isOnboardingStep(step)) notFound();
  return <OnboardingStepView step={step} />;
}

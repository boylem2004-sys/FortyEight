import { z } from "zod";
import { budgetSchema } from "../budget";
import {
  eventTypeSchema,
  EVENT_TYPES,
  groupSizeSchema,
  interestSchema,
  INTERESTS,
  radiusMilesSchema,
} from "./enums";

const unique = <T>(arr: readonly T[]) => new Set(arr).size === arr.length;

/**
 * Where the user is. Coordinates come from browser geolocation, or are null
 * when the user typed a city/ZIP (the server geocodes the label).
 */
export const locationSchema = z
  .object({
    label: z.string().trim().min(2, "Enter a city or ZIP code").max(120),
    lat: z.number().min(-90).max(90).nullable(),
    lng: z.number().min(-180).max(180).nullable(),
  })
  .refine((l) => (l.lat === null) === (l.lng === null), {
    message: "Latitude and longitude must both be set or both be empty",
  });

export type Location = z.infer<typeof locationSchema>;

export const INTERESTS_FREEFORM_MAX = 280;

const interestsField = z
  .array(interestSchema)
  .max(INTERESTS.length)
  .refine(unique, { message: "Interests must be unique" });

const interestsFreeformField = z.string().trim().max(INTERESTS_FREEFORM_MAX);

const eventTypesField = z
  .array(eventTypeSchema)
  .min(1, "Pick at least one")
  .max(EVENT_TYPES.length)
  .refine(unique, { message: "Event types must be unique" });

const hasSomeInterest = (v: { interests: readonly unknown[]; interestsFreeform: string }) =>
  v.interests.length > 0 || v.interestsFreeform.trim().length > 0;

const someInterestIssue = {
  message: "Pick at least one interest or describe one",
  path: ["interests"],
};

/* ------------------------------------------------------------------ */
/* One schema per onboarding step, so each screen validates alone.    */
/* ------------------------------------------------------------------ */

export const locationStepSchema = z.object({
  location: locationSchema,
  radiusMiles: radiusMilesSchema,
});

export const interestsStepSchema = z
  .object({
    interests: interestsField,
    interestsFreeform: interestsFreeformField,
  })
  .refine(hasSomeInterest, someInterestIssue);

export const eventTypesStepSchema = z.object({
  eventTypes: eventTypesField,
});

export const groupStepSchema = z.object({
  groupSize: groupSizeSchema,
});

export const budgetStepSchema = z.object({
  budget: budgetSchema,
});

/**
 * "What sounds good?" The user only picks event types (plus optional free
 * text). Interests are filled in from those picks with
 * `interestsForEventTypes`, so the saved preferences keep the same shape.
 */
export const activitiesStepSchema = z.object({
  eventTypes: eventTypesField,
  interestsFreeform: interestsFreeformField,
});

/** Group size and budget share one screen. */
export const groupBudgetStepSchema = z.object({
  groupSize: groupSizeSchema,
  budget: budgetSchema,
});

export type LocationStep = z.infer<typeof locationStepSchema>;
export type InterestsStep = z.infer<typeof interestsStepSchema>;
export type EventTypesStep = z.infer<typeof eventTypesStepSchema>;
export type GroupStep = z.infer<typeof groupStepSchema>;
export type BudgetStep = z.infer<typeof budgetStepSchema>;
export type ActivitiesStep = z.infer<typeof activitiesStepSchema>;
export type GroupBudgetStep = z.infer<typeof groupBudgetStepSchema>;

/** Full saved preferences: the union of every onboarding step. */
export const preferencesSchema = z
  .object({
    location: locationSchema,
    radiusMiles: radiusMilesSchema,
    interests: interestsField,
    interestsFreeform: interestsFreeformField,
    eventTypes: eventTypesField,
    groupSize: groupSizeSchema,
    budget: budgetSchema,
  })
  .refine(hasSomeInterest, someInterestIssue);

export type Preferences = z.infer<typeof preferencesSchema>;

/* ------------------------------------------------------------------ */
/* Onboarding step order.                                             */
/* ------------------------------------------------------------------ */

export const ONBOARDING_STEPS = ["location", "activities", "group"] as const;
export const onboardingStepSchema = z.enum(ONBOARDING_STEPS);
export type OnboardingStep = z.infer<typeof onboardingStepSchema>;

/** What a saved draft needs for each step to count as done. */
export const ONBOARDING_STEP_SCHEMAS = {
  location: locationStepSchema,
  activities: z
    .object({
      eventTypes: eventTypesField,
      interests: interestsField,
      interestsFreeform: interestsFreeformField,
    })
    .refine(hasSomeInterest, someInterestIssue),
  group: groupBudgetStepSchema,
} as const satisfies Record<OnboardingStep, z.ZodType>;

/** Old step URLs (the flow used to have five screens) and where they live now. */
export const LEGACY_ONBOARDING_STEPS = {
  interests: "activities",
  "event-types": "activities",
  budget: "group",
} as const satisfies Record<string, OnboardingStep>;

export function isOnboardingStep(value: string): value is OnboardingStep {
  return (ONBOARDING_STEPS as readonly string[]).includes(value);
}

export function stepIndex(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step);
}

export function nextStep(step: OnboardingStep): OnboardingStep | null {
  return ONBOARDING_STEPS[stepIndex(step) + 1] ?? null;
}

export function previousStep(step: OnboardingStep): OnboardingStep | null {
  const i = stepIndex(step);
  return i <= 0 ? null : (ONBOARDING_STEPS[i - 1] ?? null);
}

/** First step whose data is missing or invalid, or null when everything is filled in. */
export function firstIncompleteStep(draft: unknown): OnboardingStep | null {
  for (const step of ONBOARDING_STEPS) {
    if (!ONBOARDING_STEP_SCHEMAS[step].safeParse(draft).success) return step;
  }
  return null;
}

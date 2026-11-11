import { describe, expect, it } from "vitest";
import { makePreferences } from "../test/factories";
import {
  activitiesStepSchema,
  firstIncompleteStep,
  groupBudgetStepSchema,
  interestsStepSchema,
  isOnboardingStep,
  LEGACY_ONBOARDING_STEPS,
  locationSchema,
  nextStep,
  ONBOARDING_STEPS,
  preferencesSchema,
  previousStep,
} from "./preferences";

describe("preferencesSchema", () => {
  it("accepts complete preferences", () => {
    expect(preferencesSchema.safeParse(makePreferences()).success).toBe(true);
  });

  it("accepts free text in place of picked interests", () => {
    const prefs = makePreferences({ interests: [], interestsFreeform: "board games" });
    expect(preferencesSchema.safeParse(prefs).success).toBe(true);
  });

  it("needs at least one interest or free text", () => {
    const result = preferencesSchema.safeParse(
      makePreferences({ interests: [], interestsFreeform: "  " }),
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["interests"]);
  });

  it("needs at least one event type", () => {
    expect(preferencesSchema.safeParse(makePreferences({ eventTypes: [] })).success).toBe(false);
  });

  it("rejects repeated interests", () => {
    expect(
      preferencesSchema.safeParse(makePreferences({ interests: ["arts", "arts"] })).success,
    ).toBe(false);
  });

  it("keeps group size between 1 and 20", () => {
    expect(preferencesSchema.safeParse(makePreferences({ groupSize: 0 })).success).toBe(false);
    expect(preferencesSchema.safeParse(makePreferences({ groupSize: 21 })).success).toBe(false);
    expect(preferencesSchema.safeParse(makePreferences({ groupSize: 20 })).success).toBe(true);
  });

  it("only allows the listed radius options", () => {
    const bad = { ...makePreferences(), radiusMiles: 30 };
    expect(preferencesSchema.safeParse(bad).success).toBe(false);
  });
});

describe("locationSchema", () => {
  it("accepts a typed city with no coordinates", () => {
    expect(locationSchema.safeParse({ label: "Blue Bell, PA", lat: null, lng: null }).success).toBe(
      true,
    );
  });

  it("rejects half-filled coordinates", () => {
    expect(locationSchema.safeParse({ label: "Blue Bell, PA", lat: 40, lng: null }).success).toBe(
      false,
    );
  });

  it("rejects an empty label", () => {
    expect(locationSchema.safeParse({ label: " ", lat: null, lng: null }).success).toBe(false);
  });
});

describe("onboarding steps", () => {
  it("validates one step at a time", () => {
    expect(
      interestsStepSchema.safeParse({ interests: ["arts"], interestsFreeform: "" }).success,
    ).toBe(true);
    expect(interestsStepSchema.safeParse({ interests: [], interestsFreeform: "" }).success).toBe(
      false,
    );
  });

  it("validates the combined screens", () => {
    expect(
      activitiesStepSchema.safeParse({ eventTypes: ["concerts"], interestsFreeform: "" }).success,
    ).toBe(true);
    expect(
      activitiesStepSchema.safeParse({ eventTypes: [], interestsFreeform: "karaoke" }).success,
    ).toBe(false);
    const { groupSize, budget } = makePreferences();
    expect(groupBudgetStepSchema.safeParse({ groupSize, budget }).success).toBe(true);
    expect(groupBudgetStepSchema.safeParse({ groupSize: 0, budget }).success).toBe(false);
  });

  it("walks the steps in order", () => {
    expect(nextStep("location")).toBe("activities");
    expect(nextStep("group")).toBeNull();
    expect(previousStep("location")).toBeNull();
    expect(previousStep("group")).toBe("activities");
  });

  it("recognizes step slugs", () => {
    expect(isOnboardingStep("group")).toBe(true);
    expect(isOnboardingStep("budget")).toBe(false);
    expect(isOnboardingStep("dates")).toBe(false);
  });

  it("maps old step slugs to current ones", () => {
    for (const step of Object.values(LEGACY_ONBOARDING_STEPS)) {
      expect(isOnboardingStep(step)).toBe(true);
    }
  });

  it("finds the first incomplete step", () => {
    expect(firstIncompleteStep({})).toBe("location");
    const prefs = makePreferences();
    expect(firstIncompleteStep(prefs)).toBeNull();
    expect(firstIncompleteStep({ ...prefs, eventTypes: [] })).toBe("activities");
    expect(firstIncompleteStep({ ...prefs, interests: [], interestsFreeform: "" })).toBe(
      "activities",
    );
    expect(firstIncompleteStep({ ...prefs, groupSize: 0 })).toBe("group");
    expect(ONBOARDING_STEPS).toHaveLength(3);
  });
});

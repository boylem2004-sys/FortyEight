"use client";

import {
  budgetFromPreset,
  DEFAULT_BUDGET_PRESET_ID,
  DEFAULT_RADIUS_MILES,
  type Budget,
  type EventType,
  type Interest,
  type Location,
  type RadiusMiles,
} from "@fortyeight/core";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Onboarding answers so far. Becomes `Preferences` once every step is valid. */
export interface PreferencesDraft {
  location: Location | null;
  radiusMiles: RadiusMiles;
  interests: Interest[];
  interestsFreeform: string;
  eventTypes: EventType[];
  groupSize: number;
  budget: Budget;
}

export const INITIAL_DRAFT: PreferencesDraft = {
  location: null,
  radiusMiles: DEFAULT_RADIUS_MILES,
  interests: [],
  interestsFreeform: "",
  eventTypes: [],
  groupSize: 4,
  budget: budgetFromPreset(DEFAULT_BUDGET_PRESET_ID),
};

interface OnboardingState {
  draft: PreferencesDraft;
  update: (patch: Partial<PreferencesDraft>) => void;
  reset: () => void;
}

/**
 * Onboarding wizard state, saved on this device so anonymous users keep their
 * answers. Signed-in users also sync to /api/v1/preferences (Phase 1).
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      draft: INITIAL_DRAFT,
      update: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      reset: () => set({ draft: INITIAL_DRAFT }),
    }),
    {
      name: "fortyeight:onboarding",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ draft: s.draft }),
    },
  ),
);

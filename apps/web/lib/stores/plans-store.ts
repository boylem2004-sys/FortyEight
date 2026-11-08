"use client";

import type { Plan, PlanRequest } from "@fortyeight/core";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const MAX_STORED_PLANS = 10;

export interface PendingPlanRequest {
  /** New id per click, so "Regenerate" never reuses a cached result. */
  requestId: string;
  request: PlanRequest;
}

interface PlansState {
  /** What /results/new should generate. */
  pending: PendingPlanRequest | null;
  /** Recent plans on this device, by id. Server persistence comes in Phase 1. */
  plans: Record<string, Plan>;
  /** Plan ids, newest first. */
  order: string[];
  requestPlan: (request: PlanRequest) => void;
  savePlan: (plan: Plan) => void;
}

export const usePlansStore = create<PlansState>()(
  persist(
    (set) => ({
      pending: null,
      plans: {},
      order: [],
      requestPlan: (request) => set({ pending: { requestId: crypto.randomUUID(), request } }),
      savePlan: (plan) =>
        set((s) => {
          const order = [plan.id, ...s.order.filter((id) => id !== plan.id)].slice(
            0,
            MAX_STORED_PLANS,
          );
          const plans: Record<string, Plan> = {};
          for (const id of order) {
            const p = id === plan.id ? plan : s.plans[id];
            if (p) plans[id] = p;
          }
          return { plans, order };
        }),
    }),
    {
      name: "fortyeight:plans",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

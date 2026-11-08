"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { usePlansStore, type PendingPlanRequest } from "@/lib/stores/plans-store";

/**
 * Generates a plan for a pending request.
 *
 * This is a POST, but it runs through useQuery on purpose: the query key is
 * the unique request id, so React strict mode, re-renders, and remounts can
 * never fire it twice. "Regenerate" makes a new request id.
 */
export function usePlanGeneration(pending: PendingPlanRequest | null) {
  const savePlan = usePlansStore((s) => s.savePlan);
  return useQuery({
    queryKey: ["plan-generation", pending?.requestId],
    enabled: pending !== null,
    // No abort signal: a half-sent generation would still count against usage
    // limits later, so let it finish even if the user navigates away.
    queryFn: async () => {
      const { plan } = await api.plans.create(pending!.request);
      savePlan(plan);
      return plan;
    },
    staleTime: Infinity,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

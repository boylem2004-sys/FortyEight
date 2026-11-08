import { z } from "zod";
import { dateRangeSchema, timeZoneSchema } from "../dates";
import { preferencesSchema } from "./preferences";
import { suggestionSchema } from "./suggestion";

/** Body of POST /api/v1/plans. */
export const planRequestSchema = z.object({
  preferences: preferencesSchema,
  dateRange: dateRangeSchema,
  /** IANA zone of the user, e.g. "America/New_York". Used for date math. */
  timezone: timeZoneSchema,
});

export type PlanRequest = z.infer<typeof planRequestSchema>;

export const resolvedLocationSchema = z.object({
  label: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  /** True when geocoding fell back to a guess. */
  approximate: z.boolean(),
});

export type ResolvedLocation = z.infer<typeof resolvedLocationSchema>;

export const PLAN_STATUSES = ["pending", "ready", "failed"] as const;
export const planStatusSchema = z.enum(PLAN_STATUSES);
export type PlanStatus = z.infer<typeof planStatusSchema>;

export const planSchema = z.object({
  id: z.uuid(),
  status: planStatusSchema,
  createdAt: z.iso.datetime({ offset: true }),
  input: planRequestSchema,
  location: resolvedLocationSchema,
  /** Ranked best first. */
  items: z.array(suggestionSchema),
  meta: z.object({
    /** How many items survived the hard filters before ranking. */
    candidateCount: z.int().min(0),
    usedWebResearch: z.boolean(),
    /** True while providers are stubs returning sample data. */
    fixtureData: z.boolean(),
  }),
});

export type Plan = z.infer<typeof planSchema>;

/** Response of POST /api/v1/plans. */
export const createPlanResponseSchema = z.object({ plan: planSchema });
export type CreatePlanResponse = z.infer<typeof createPlanResponseSchema>;

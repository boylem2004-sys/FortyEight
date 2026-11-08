import { z } from "zod";
import { categorySchema, sourceSchema } from "./enums";

/**
 * The one shape every provider result is normalized into.
 * Mirrors the `plan_items` table so it can be stored as-is.
 */
export const suggestionSchema = z.object({
  /** Stable within a plan: `${source}:${sourceId}`. */
  id: z.string().min(1),
  source: sourceSchema,
  sourceId: z.string().min(1),
  title: z.string().min(1),
  category: categorySchema,
  /** ISO instant. null for places that are open across the weekend. */
  startsAt: z.iso.datetime({ offset: true }).nullable(),
  venueName: z.string().nullable(),
  lat: z.number().min(-90).max(90).nullable(),
  lng: z.number().min(-180).max(180).nullable(),
  distanceMiles: z.number().min(0).nullable(),
  /** Price per person in cents. */
  priceMinCents: z.int().min(0).nullable(),
  priceMaxCents: z.int().min(0).nullable(),
  /** False when the source had no price at all. Never hide these silently. */
  priceKnown: z.boolean(),
  /** True when the price is a guess (for example from Google price level). */
  priceEstimated: z.boolean(),
  url: z.url().nullable(),
  imageUrl: z.url().nullable(),
  /** 0 to 100. Set by the ranker. */
  fitScore: z.number().min(0).max(100).nullable(),
  /** One or two sentences on why this fits the group. Set by the ranker. */
  fitReason: z.string().nullable(),
  /** False for AI web research results until a structured source confirms them. */
  verified: z.boolean(),
});

export type Suggestion = z.infer<typeof suggestionSchema>;

export function suggestionId(source: string, sourceId: string): string {
  return `${source}:${sourceId}`;
}

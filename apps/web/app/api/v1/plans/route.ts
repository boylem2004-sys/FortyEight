import {
  createPlanResponseSchema,
  dateRangeProblem,
  generatePlan,
  LocationNotFoundError,
  planRequestSchema,
  todayInTimeZone,
} from "@fortyeight/core";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/server/http";
import { getPipelineDeps } from "@/lib/server/pipeline";

/**
 * POST /api/v1/plans
 * Builds a ranked weekend plan from preferences + dates.
 * Anonymous use is allowed. Phase 1 adds auth-aware persistence and
 * Phase 2 adds usage limits here.
 */
export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, planRequestSchema, "plan request");
  if (!parsed.ok) return parsed.response;
  const planRequest = parsed.data;

  const today = todayInTimeZone(new Date(), planRequest.timezone);
  const problem = dateRangeProblem(planRequest.dateRange, today);
  if (problem === "starts_in_past") {
    return jsonError("invalid_date_range", "Pick dates that start today or later.");
  }
  if (problem === "too_far_out") {
    return jsonError("invalid_date_range", "Pick dates within the next 14 days.");
  }

  try {
    const plan = await generatePlan(planRequest, getPipelineDeps());
    return jsonOk(createPlanResponseSchema, { plan }, { status: 201 });
  } catch (error) {
    if (error instanceof LocationNotFoundError) {
      return jsonError(
        "bad_request",
        `We couldn't find "${error.query}". Try a city name or ZIP code.`,
        [{ path: "preferences.location.label", message: "Location not found" }],
      );
    }
    console.error("Plan generation failed", error);
    return jsonError("internal", "We couldn't build your plan. Please try again.");
  }
}

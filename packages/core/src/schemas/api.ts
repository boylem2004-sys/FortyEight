import { z } from "zod";
import { preferencesSchema } from "./preferences";

export const API_VERSION = "v1";
export const API_BASE_PATH = `/api/${API_VERSION}`;

/* ------------------------------------------------------------------ */
/* Errors: every non-2xx response uses this shape.                    */
/* ------------------------------------------------------------------ */

export const API_ERROR_CODES = [
  "bad_request",
  "invalid_date_range",
  "unauthorized",
  "not_found",
  "not_configured",
  "internal",
] as const;

export const apiErrorCodeSchema = z.enum(API_ERROR_CODES);
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

export const apiIssueSchema = z.object({
  path: z.string(),
  message: z.string(),
});
export type ApiIssue = z.infer<typeof apiIssueSchema>;

export const apiErrorSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
    issues: z.array(apiIssueSchema).optional(),
  }),
});
export type ApiErrorBody = z.infer<typeof apiErrorSchema>;

/** Flattens zod issues into `{ path: "preferences.groupSize", message }`. */
export function toApiIssues(error: z.ZodError): ApiIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));
}

/* ------------------------------------------------------------------ */
/* GET /api/v1/health                                                 */
/* ------------------------------------------------------------------ */

export const healthResponseSchema = z.object({
  ok: z.literal(true),
  version: z.string(),
  commit: z.string().nullable(),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;

/* ------------------------------------------------------------------ */
/* GET / PUT /api/v1/preferences                                      */
/* ------------------------------------------------------------------ */

export const getPreferencesResponseSchema = z.object({
  preferences: preferencesSchema.nullable(),
});
export type GetPreferencesResponse = z.infer<typeof getPreferencesResponseSchema>;

export const putPreferencesRequestSchema = preferencesSchema;

export const putPreferencesResponseSchema = z.object({
  preferences: preferencesSchema,
});
export type PutPreferencesResponse = z.infer<typeof putPreferencesResponseSchema>;

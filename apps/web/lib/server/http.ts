import "server-only";
import { toApiIssues, type ApiErrorBody, type ApiErrorCode, type ApiIssue } from "@fortyeight/core";
import type { z } from "zod";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  bad_request: 400,
  invalid_date_range: 400,
  unauthorized: 401,
  not_found: 404,
  not_configured: 503,
  internal: 500,
};

export function jsonError(code: ApiErrorCode, message: string, issues?: ApiIssue[]): Response {
  const body: ApiErrorBody = { error: { code, message, ...(issues ? { issues } : {}) } };
  return Response.json(body, { status: STATUS_BY_CODE[code] });
}

/**
 * Sends a response after checking it against its contract. A mismatch is a
 * server bug, so it becomes a 500 instead of leaking a broken payload.
 */
export function jsonOk<S extends z.ZodType>(
  schema: S,
  data: z.input<S>,
  init?: ResponseInit,
): Response {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    console.error("Response failed its schema", toApiIssues(parsed.error));
    return jsonError("internal", "Something went wrong on our end.");
  }
  return Response.json(parsed.data, init);
}

type ParseResult<T> = { ok: true; data: T } | { ok: false; response: Response };

/** Reads a JSON body and validates it. On failure, returns a ready 400 response. */
export async function parseJsonBody<S extends z.ZodType>(
  request: Request,
  schema: S,
  label = "request",
): Promise<ParseResult<z.output<S>>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { ok: false, response: jsonError("bad_request", "Body must be valid JSON.") };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      response: jsonError("bad_request", `Invalid ${label}.`, toApiIssues(parsed.error)),
    };
  }
  return { ok: true, data: parsed.data };
}

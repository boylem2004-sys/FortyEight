import {
  API_BASE_PATH,
  apiErrorSchema,
  createPlanResponseSchema,
  getPreferencesResponseSchema,
  healthResponseSchema,
  planRequestSchema,
  putPreferencesRequestSchema,
  putPreferencesResponseSchema,
  toApiIssues,
  type ApiErrorCode,
  type ApiIssue,
  type CreatePlanResponse,
  type GetPreferencesResponse,
  type HealthResponse,
  type PlanRequest,
  type Preferences,
  type PutPreferencesResponse,
} from "@fortyeight/core";
import type { z } from "zod";

export type TokenGetter = () => string | null | undefined | Promise<string | null | undefined>;

export interface ApiClientOptions {
  /**
   * Origin of the API, e.g. "https://fortyeight.app". Use "" on the web app to
   * call the same origin. Mobile passes the deployed URL.
   */
  baseUrl: string;
  /** Returns the Supabase access token, or null when signed out. */
  getToken?: TokenGetter;
  /** Override for tests or custom runtimes. Defaults to global fetch. */
  fetch?: typeof fetch;
}

/** Thrown for any non-2xx response, or a response that breaks the contract. */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: ApiErrorCode | "network_error" | "invalid_response",
    public readonly issues: ApiIssue[] = [],
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/** Validates a request body before it leaves the device, so bad input fails fast and typed. */
function validateBody<S extends z.ZodType>(schema: S, value: unknown): z.output<S> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new ApiClientError("Request is not valid", 0, "bad_request", toApiIssues(parsed.error));
  }
  return parsed.data;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export function createApiClient(options: ApiClientOptions) {
  const base = options.baseUrl.replace(/\/+$/, "");
  const fetchImpl = options.fetch ?? ((...args: Parameters<typeof fetch>) => fetch(...args));

  async function request<S extends z.ZodType>(
    path: string,
    schema: S,
    { method = "GET", body, signal }: RequestOptions = {},
  ): Promise<z.output<S>> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const token = await options.getToken?.();
    if (token) headers.Authorization = `Bearer ${token}`;

    let res: Response;
    try {
      res = await fetchImpl(`${base}${API_BASE_PATH}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") throw error;
      throw new ApiClientError(
        "Could not reach the server. Check your connection.",
        0,
        "network_error",
      );
    }

    const json: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const parsed = apiErrorSchema.safeParse(json);
      if (parsed.success) {
        const { code, message, issues } = parsed.data.error;
        throw new ApiClientError(message, res.status, code, issues);
      }
      throw new ApiClientError(`Request failed with status ${res.status}`, res.status, "internal");
    }

    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw new ApiClientError(
        "The server sent an unexpected response.",
        res.status,
        "invalid_response",
      );
    }
    return parsed.data;
  }

  return {
    health(signal?: AbortSignal): Promise<HealthResponse> {
      return request("/health", healthResponseSchema, { signal });
    },

    preferences: {
      get(signal?: AbortSignal): Promise<GetPreferencesResponse> {
        return request("/preferences", getPreferencesResponseSchema, { signal });
      },
      async put(preferences: Preferences, signal?: AbortSignal): Promise<PutPreferencesResponse> {
        return request("/preferences", putPreferencesResponseSchema, {
          method: "PUT",
          body: validateBody(putPreferencesRequestSchema, preferences),
          signal,
        });
      },
    },

    plans: {
      async create(input: PlanRequest, signal?: AbortSignal): Promise<CreatePlanResponse> {
        return request("/plans", createPlanResponseSchema, {
          method: "POST",
          body: validateBody(planRequestSchema, input),
          signal,
        });
      },
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

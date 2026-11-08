import type { Plan, PlanRequest } from "@fortyeight/core";
import { describe, expect, it, vi } from "vitest";
import { ApiClientError, createApiClient } from "./index";

const request: PlanRequest = {
  preferences: {
    location: { label: "Blue Bell, PA", lat: null, lng: null },
    radiusMiles: 25,
    interests: ["live_music"],
    interestsFreeform: "",
    eventTypes: ["concerts"],
    groupSize: 4,
    budget: { minCents: 0, maxCents: 5000 },
  },
  dateRange: { start: "2026-11-13", end: "2026-11-15" },
  timezone: "America/New_York",
};

const plan: Plan = {
  id: "00000000-0000-4000-8000-000000000001",
  status: "ready",
  createdAt: "2026-11-12T22:00:00.000Z",
  input: request,
  location: { label: "Blue Bell, PA", lat: 40.15, lng: -75.27, approximate: false },
  items: [],
  meta: { candidateCount: 0, usedWebResearch: false, fixtureData: true },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("createApiClient", () => {
  it("calls versioned paths on the base url", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ ok: true, version: "0.1.0", commit: null }));
    const api = createApiClient({ baseUrl: "https://api.example.com/", fetch });
    await expect(api.health()).resolves.toEqual({ ok: true, version: "0.1.0", commit: null });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/health",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("supports a same-origin base url", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ ok: true, version: "0.1.0", commit: null }));
    await createApiClient({ baseUrl: "", fetch }).health();
    expect(fetch.mock.calls[0]?.[0]).toBe("/api/v1/health");
  });

  it("sends the bearer token when there is one", async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ plan }, 201));
    const api = createApiClient({ baseUrl: "", fetch, getToken: async () => "jwt-123" });
    await api.plans.create(request);
    const init = fetch.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer jwt-123");
    expect(JSON.parse(init.body as string)).toEqual(request);
  });

  it("leaves out the auth header when signed out", async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ preferences: null }));
    await createApiClient({ baseUrl: "", fetch, getToken: () => null }).preferences.get();
    const init = fetch.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("validates input before sending", async () => {
    const fetch = vi.fn();
    const api = createApiClient({ baseUrl: "", fetch });
    const bad = { ...request, preferences: { ...request.preferences, groupSize: 99 } };
    await expect(api.plans.create(bad)).rejects.toMatchObject({
      code: "bad_request",
      issues: [{ path: "preferences.groupSize" }],
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("turns API errors into ApiClientError with issues", async () => {
    const fetch = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: "bad_request",
            message: "Invalid plan request",
            issues: [{ path: "timezone", message: "Unknown time zone" }],
          },
        },
        400,
      ),
    );
    const error = await createApiClient({ baseUrl: "", fetch })
      .plans.create(request)
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiClientError);
    expect(error).toMatchObject({
      status: 400,
      code: "bad_request",
      issues: [{ path: "timezone" }],
    });
  });

  it("handles non-JSON error bodies", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("Bad gateway", { status: 502 }));
    await expect(createApiClient({ baseUrl: "", fetch }).health()).rejects.toMatchObject({
      status: 502,
      code: "internal",
    });
  });

  it("rejects responses that break the contract", async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ ok: "yes" }));
    await expect(createApiClient({ baseUrl: "", fetch }).health()).rejects.toMatchObject({
      code: "invalid_response",
    });
  });

  it("reports network failures", async () => {
    const fetch = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    await expect(createApiClient({ baseUrl: "", fetch }).health()).rejects.toMatchObject({
      status: 0,
      code: "network_error",
    });
  });
});

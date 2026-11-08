import { expect, test } from "@playwright/test";

test.describe("API v1", () => {
  test("health reports ok and a version", async ({ request }) => {
    const res = await request.get("/api/v1/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, version: expect.any(String) });
  });

  test("plans rejects invalid input with issues", async ({ request }) => {
    const res = await request.post("/api/v1/plans", { data: { preferences: {} } });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("bad_request");
    expect(body.error.issues.length).toBeGreaterThan(0);
  });

  test("plans rejects dates in the past", async ({ request }) => {
    const res = await request.post("/api/v1/plans", {
      data: {
        preferences: {
          location: { label: "Blue Bell, PA", lat: null, lng: null },
          radiusMiles: 25,
          interests: ["live_music"],
          interestsFreeform: "",
          eventTypes: ["concerts"],
          groupSize: 2,
          budget: { minCents: 0, maxCents: 5000 },
        },
        dateRange: { start: "2020-01-03", end: "2020-01-05" },
        timezone: "America/New_York",
      },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_date_range");
  });

  test("preferences needs Supabase or a signed-in user", async ({ request }) => {
    const res = await request.get("/api/v1/preferences");
    expect([401, 503]).toContain(res.status());
  });
});

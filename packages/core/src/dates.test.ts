import { describe, expect, it } from "vitest";
import {
  addDays,
  dateRangeProblem,
  dateRangeSchema,
  dayOfWeek,
  daysBetween,
  formatDateRange,
  formatDayLabel,
  formatEventTime,
  isValidTimeZone,
  listDates,
  localDateOf,
  timeZoneSchema,
  todayInTimeZone,
  upcomingWeekend,
  zonedTimeToUtc,
} from "./dates";

describe("date arithmetic", () => {
  it("adds days across month and year ends", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("counts days between dates", () => {
    expect(daysBetween("2026-11-13", "2026-11-15")).toBe(2);
    expect(daysBetween("2026-11-15", "2026-11-13")).toBe(-2);
  });

  it("knows the day of week", () => {
    expect(dayOfWeek("2026-11-08")).toBe(0); // Sunday
    expect(dayOfWeek("2026-11-13")).toBe(5); // Friday
  });

  it("lists every date in a range", () => {
    expect(listDates({ start: "2026-11-13", end: "2026-11-15" })).toEqual([
      "2026-11-13",
      "2026-11-14",
      "2026-11-15",
    ]);
  });
});

describe("upcomingWeekend", () => {
  it.each([
    ["2026-11-09", "Mon", "2026-11-13", "2026-11-15"],
    ["2026-11-12", "Thu", "2026-11-13", "2026-11-15"],
    ["2026-11-13", "Fri", "2026-11-13", "2026-11-15"],
    ["2026-11-14", "Sat", "2026-11-14", "2026-11-15"],
    ["2026-11-08", "Sun", "2026-11-13", "2026-11-15"],
  ])("from %s (%s) picks %s to %s", (today, _day, start, end) => {
    expect(upcomingWeekend(today)).toEqual({ start, end });
  });
});

describe("dateRangeSchema", () => {
  it("accepts a normal weekend", () => {
    expect(dateRangeSchema.safeParse({ start: "2026-11-13", end: "2026-11-15" }).success).toBe(
      true,
    );
  });

  it("rejects an end before the start", () => {
    expect(dateRangeSchema.safeParse({ start: "2026-11-15", end: "2026-11-13" }).success).toBe(
      false,
    );
  });

  it("rejects a range longer than 14 days", () => {
    expect(dateRangeSchema.safeParse({ start: "2026-11-01", end: "2026-11-20" }).success).toBe(
      false,
    );
  });

  it("rejects bad date strings", () => {
    expect(dateRangeSchema.safeParse({ start: "11/13/2026", end: "2026-11-15" }).success).toBe(
      false,
    );
  });
});

describe("dateRangeProblem", () => {
  const today = "2026-11-08";
  it("allows ranges from today up to 14 days out", () => {
    expect(dateRangeProblem({ start: today, end: "2026-11-22" }, today)).toBeNull();
  });
  it("flags ranges that start in the past", () => {
    expect(dateRangeProblem({ start: "2026-11-07", end: "2026-11-09" }, today)).toBe(
      "starts_in_past",
    );
  });
  it("flags ranges that end too far out", () => {
    expect(dateRangeProblem({ start: "2026-11-20", end: "2026-11-23" }, today)).toBe("too_far_out");
  });
});

describe("time zones", () => {
  it("validates zone names", () => {
    expect(isValidTimeZone("America/New_York")).toBe(true);
    expect(isValidTimeZone("Mars/Olympus_Mons")).toBe(false);
    expect(timeZoneSchema.safeParse("Not/AZone").success).toBe(false);
  });

  it("converts local wall time to UTC in standard time", () => {
    expect(zonedTimeToUtc("2026-11-14", "19:30", "America/New_York")).toBe(
      "2026-11-15T00:30:00.000Z",
    );
  });

  it("converts local wall time to UTC in daylight time", () => {
    expect(zonedTimeToUtc("2026-07-04", "21:00", "America/New_York")).toBe(
      "2026-07-05T01:00:00.000Z",
    );
  });

  it("handles zones east of UTC", () => {
    expect(zonedTimeToUtc("2026-11-14", "10:00", "Europe/Berlin")).toBe("2026-11-14T09:00:00.000Z");
  });

  it("finds the local date of an instant", () => {
    // 00:30 UTC on the 15th is still the evening of the 14th in New York.
    expect(localDateOf("2026-11-15T00:30:00.000Z", "America/New_York")).toBe("2026-11-14");
    expect(localDateOf("2026-11-15T00:30:00.000Z", "UTC")).toBe("2026-11-15");
  });

  it("gets today in a zone", () => {
    const now = new Date("2026-11-09T03:00:00.000Z");
    expect(todayInTimeZone(now, "America/Los_Angeles")).toBe("2026-11-08");
    expect(todayInTimeZone(now, "Europe/London")).toBe("2026-11-09");
  });
});

describe("formatting", () => {
  it("formats day labels and ranges", () => {
    expect(formatDayLabel("2026-11-13")).toBe("Fri, Nov 13");
    expect(formatDateRange({ start: "2026-11-13", end: "2026-11-15" })).toBe(
      "Fri, Nov 13 to Sun, Nov 15",
    );
    expect(formatDateRange({ start: "2026-11-14", end: "2026-11-14" })).toBe("Sat, Nov 14");
  });

  it("formats event times in the given zone", () => {
    expect(formatEventTime("2026-11-15T00:30:00.000Z", "America/New_York")).toBe(
      "Sat, Nov 14, 7:30 PM",
    );
  });
});

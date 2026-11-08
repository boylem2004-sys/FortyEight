import { z } from "zod";

/** How far ahead a user can plan. */
export const MAX_DAYS_OUT = 14;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const isoDateSchema = z.iso.date();
export type IsoDate = string;

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const timeZoneSchema = z
  .string()
  .min(1)
  .max(64)
  .refine(isValidTimeZone, { message: "Unknown time zone" });

/** Whole days from a to b (b - a). Both are YYYY-MM-DD. */
export function daysBetween(a: IsoDate, b: IsoDate): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / MS_PER_DAY);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const ms = Date.parse(`${date}T00:00:00Z`) + days * MS_PER_DAY;
  return new Date(ms).toISOString().slice(0, 10);
}

/** 0 = Sunday ... 6 = Saturday. */
export function dayOfWeek(date: IsoDate): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export const dateRangeSchema = z
  .object({ start: isoDateSchema, end: isoDateSchema })
  .refine((r) => r.start <= r.end, {
    message: "End date must be on or after the start date",
    path: ["end"],
  })
  .refine((r) => daysBetween(r.start, r.end) <= MAX_DAYS_OUT, {
    message: `Date range can be at most ${MAX_DAYS_OUT} days`,
    path: ["end"],
  });

export type DateRange = z.infer<typeof dateRangeSchema>;

/** Every date in the range, inclusive. */
export function listDates(range: DateRange): IsoDate[] {
  const out: IsoDate[] = [];
  const span = daysBetween(range.start, range.end);
  for (let i = 0; i <= span; i++) out.push(addDays(range.start, i));
  return out;
}

/** The calendar date (YYYY-MM-DD) of an instant, as seen in a time zone. */
export function localDateOf(instant: Date | string, timeZone: string): IsoDate {
  const date = typeof instant === "string" ? new Date(instant) : instant;
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function todayInTimeZone(now: Date, timeZone: string): IsoDate {
  return localDateOf(now, timeZone);
}

/** Offset of a time zone from UTC at an instant, in minutes (e.g. -300 for EST). */
function timeZoneOffsetMinutes(instantMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instantMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return Math.round((asUtc - instantMs) / 60000);
}

/**
 * Turns a wall-clock time in a time zone into a UTC ISO string.
 * Example: ("2026-11-14", "19:30", "America/New_York") -> "2026-11-15T00:30:00.000Z".
 */
export function zonedTimeToUtc(date: IsoDate, time: string, timeZone: string): string {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const [year = 1970, month = 1, day = 1] = date.split("-").map(Number);
  const guess = Date.UTC(year, month - 1, day, hours, minutes);
  // Two passes handle the rare case where the offset changes (DST) near the guess.
  let utc = guess - timeZoneOffsetMinutes(guess, timeZone) * 60000;
  utc = guess - timeZoneOffsetMinutes(utc, timeZone) * 60000;
  return new Date(utc).toISOString();
}

/**
 * The default plan window.
 * Mon-Thu: the coming Fri-Sun. Fri: today-Sun. Sat: today-Sun.
 * Sun: next Fri-Sun (the current weekend is basically over).
 */
export function upcomingWeekend(today: IsoDate): DateRange {
  const dow = dayOfWeek(today);
  switch (dow) {
    case 5:
      return { start: today, end: addDays(today, 2) };
    case 6:
      return { start: today, end: addDays(today, 1) };
    case 0:
      return { start: addDays(today, 5), end: addDays(today, 7) };
    default: {
      const start = addDays(today, 5 - dow);
      return { start, end: addDays(start, 2) };
    }
  }
}

export type DateRangeProblem = "starts_in_past" | "too_far_out" | null;

/** Checks a range against "today" in the user's time zone. */
export function dateRangeProblem(range: DateRange, today: IsoDate): DateRangeProblem {
  if (range.start < today) return "starts_in_past";
  if (daysBetween(today, range.end) > MAX_DAYS_OUT) return "too_far_out";
  return null;
}

/** "Fri, Nov 13" for a YYYY-MM-DD date. */
export function formatDayLabel(date: IsoDate): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** "Fri, Nov 13 to Sun, Nov 15", or one day label when start equals end. */
export function formatDateRange(range: DateRange): string {
  if (range.start === range.end) return formatDayLabel(range.start);
  return `${formatDayLabel(range.start)} to ${formatDayLabel(range.end)}`;
}

/** "Sat, Nov 14, 7:30 PM" for an instant, shown in a time zone. */
export function formatEventTime(instant: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(instant));
}

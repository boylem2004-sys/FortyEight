/**
 * The 48 hours this app is named after: Friday 6 PM to Sunday 6 PM, in the
 * user's local time. Used for the landing page countdown.
 */
export const WEEKEND_MINUTES = 48 * 60;

const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_WEEK = 7 * MINUTES_PER_DAY;
/** Friday (day 5) at 18:00, counted in minutes from Sunday 00:00. */
const WEEKEND_START = 5 * MINUTES_PER_DAY + 18 * 60;

export interface WeekendClock {
  /** "before": counting down to Friday 6 PM. "during": the weekend is running. */
  phase: "before" | "during";
  /** Minutes until the weekend starts, or minutes of weekend left. */
  minutes: number;
  /** How much of the 48 hours is gone, 0 to 1. Always 0 before the weekend. */
  elapsed: number;
}

/**
 * @param day Day of the week in local time, 0 = Sunday (like `Date.getDay()`).
 * @param minuteOfDay Minutes since local midnight, 0 to 1439.
 */
export function weekendClock(day: number, minuteOfDay: number): WeekendClock {
  const now = day * MINUTES_PER_DAY + minuteOfDay;
  // Minutes since the most recent Friday 6 PM.
  const since = (now - WEEKEND_START + MINUTES_PER_WEEK) % MINUTES_PER_WEEK;
  if (since < WEEKEND_MINUTES) {
    return { phase: "during", minutes: WEEKEND_MINUTES - since, elapsed: since / WEEKEND_MINUTES };
  }
  return { phase: "before", minutes: MINUTES_PER_WEEK - since, elapsed: 0 };
}

/** "2d 4h 12m", "4h 12m", or "12m". Drops leading zero units. */
export function formatCountdown(totalMinutes: number): string {
  const minutes = Math.max(0, Math.floor(totalMinutes));
  const d = Math.floor(minutes / MINUTES_PER_DAY);
  const h = Math.floor((minutes % MINUTES_PER_DAY) / 60);
  const m = minutes % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

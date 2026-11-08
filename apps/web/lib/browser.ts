import { isValidTimeZone } from "@fortyeight/core";

const FALLBACK_TIME_ZONE = "America/New_York";

/** The device's IANA time zone, used for all date math on plans. */
export function getBrowserTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz && isValidTimeZone(tz) ? tz : FALLBACK_TIME_ZONE;
  } catch {
    return FALLBACK_TIME_ZONE;
  }
}

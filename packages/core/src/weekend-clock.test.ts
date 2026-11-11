import { describe, expect, it } from "vitest";
import { formatCountdown, weekendClock, WEEKEND_MINUTES } from "./weekend-clock";

describe("weekendClock", () => {
  it("counts down to Friday 6 PM during the week", () => {
    // Wednesday 6 PM is exactly two days before.
    expect(weekendClock(3, 18 * 60)).toEqual({ phase: "before", minutes: 2880, elapsed: 0 });
    // Friday 5:59 PM.
    expect(weekendClock(5, 18 * 60 - 1)).toMatchObject({ phase: "before", minutes: 1 });
  });

  it("runs for exactly 48 hours from Friday 6 PM", () => {
    expect(weekendClock(5, 18 * 60)).toEqual({
      phase: "during",
      minutes: WEEKEND_MINUTES,
      elapsed: 0,
    });
    // Saturday 6 PM is the halfway point.
    expect(weekendClock(6, 18 * 60)).toEqual({ phase: "during", minutes: 1440, elapsed: 0.5 });
    // Sunday 5:59 PM, one minute left. Sunday is day 0, so this checks the week wrap.
    expect(weekendClock(0, 18 * 60 - 1)).toMatchObject({ phase: "during", minutes: 1 });
  });

  it("starts the next countdown at Sunday 6 PM", () => {
    expect(weekendClock(0, 18 * 60)).toEqual({ phase: "before", minutes: 5 * 1440, elapsed: 0 });
  });
});

describe("formatCountdown", () => {
  it("drops leading zero units", () => {
    expect(formatCountdown(2 * 1440 + 4 * 60 + 12)).toBe("2d 4h 12m");
    expect(formatCountdown(4 * 60 + 12)).toBe("4h 12m");
    expect(formatCountdown(12)).toBe("12m");
    expect(formatCountdown(1440)).toBe("1d 0h 0m");
    expect(formatCountdown(-5)).toBe("0m");
  });
});

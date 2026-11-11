"use client";

import { formatCountdown } from "@fortyeight/core";
import { useWeekendClock } from "@/lib/hooks/use-weekend-clock";
import { cn } from "@/lib/utils";
import { Hourglass } from "./hourglass";

/** Hero object: the hourglass plus a live "your 48 hours" countdown. */
export function WeekendCountdown({ className }: { className?: string }) {
  const clock = useWeekendClock();
  const during = clock?.phase === "during";

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <Hourglass
        elapsed={clock?.elapsed ?? 0}
        running={clock !== null}
        className="h-32 w-auto sm:h-64 lg:h-[26rem]"
      />
      <p className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold tabular-nums">
        {clock === null ? (
          "Friday 6 PM to Sunday 6 PM"
        ) : during ? (
          <>
            <span className="text-success">{formatCountdown(clock.minutes)}</span> of your weekend
            left
          </>
        ) : (
          <>
            Your 48 hours start in{" "}
            <span className="text-success">{formatCountdown(clock.minutes)}</span>
          </>
        )}
      </p>
    </div>
  );
}

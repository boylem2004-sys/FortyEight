import type * as React from "react";
import { cn } from "@/lib/utils";

/** Simple accessible progress bar. `value` is 0 to 100. */
export function Progress({
  value,
  label,
  className,
  ...props
}: React.ComponentProps<"div"> & { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn("h-1 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-foreground transition-[width] duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

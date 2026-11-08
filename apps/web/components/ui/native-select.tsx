import { ChevronDown } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

/** Styled native <select>. Native keeps keyboard and screen reader support for free. */
export function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className={cn("relative", className)}>
      <select
        data-slot="native-select"
        className="h-10 w-full appearance-none rounded-lg border border-input bg-card pr-8 pl-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

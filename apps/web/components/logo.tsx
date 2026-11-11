import { cn } from "@/lib/utils";

/**
 * Monochrome mark: a white tile with "48" cut out in black, next to a plain
 * one-color wordmark. No brand color here; blue is saved for the main action.
 */
export function Logo({
  className,
  variant = "compact",
}: {
  className?: string;
  variant?: "compact" | "hero";
}) {
  const isHero = variant === "hero";

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold text-foreground",
        isHero ? "flex-col gap-4 text-2xl tracking-tight" : "gap-2 text-[17px] tracking-[-0.022em]",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 64 64"
        fill="none"
        className={cn("shrink-0", isHero ? "size-16" : "size-6")}
      >
        <rect width="64" height="64" rx="15" className="fill-foreground" />
        <path
          d="M25 19 14 36h17m-6-17v27"
          className="stroke-background"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M43 31c-9 0-9-13 0-13s9 13 0 13Zm0 0c-11 0-11 15 0 15s11-15 0-15Z"
          className="stroke-background"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>FortyEight</span>
    </span>
  );
}

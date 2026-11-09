import { cn } from "@/lib/utils";

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
        "inline-flex items-center font-bold tracking-tight",
        isHero ? "flex-col gap-3 text-3xl sm:text-4xl" : "gap-2 text-base",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 64 64"
        fill="none"
        className={cn("shrink-0", isHero ? "size-20 sm:size-24" : "size-9")}
      >
        <rect x="2" y="2" width="60" height="60" rx="18" className="fill-primary" />
        <path
          d="M23 19 13 35h16m-5-16v26"
          className="stroke-primary-foreground"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M43 31c-9 0-9-13 0-13s9 13 0 13Zm0 0c-11 0-11 15 0 15s11-15 0-15Z"
          className="stroke-primary-foreground"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="53" cy="11" r="7" className="fill-highlight" />
        <path
          d="m50.5 11 1.5 1.5 3-3"
          className="stroke-foreground"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        Forty<span className="text-primary">Eight</span>
      </span>
    </span>
  );
}

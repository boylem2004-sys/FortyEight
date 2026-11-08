import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-bold tracking-tight", className)}>
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground"
      >
        48
      </span>
      <span>FortyEight</span>
    </span>
  );
}

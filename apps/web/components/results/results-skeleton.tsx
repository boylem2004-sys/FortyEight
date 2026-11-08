import { Skeleton } from "@/components/ui/skeleton";

export function ResultsSkeleton({ label = "Loading your plan..." }: { label?: string }) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <p role="status" aria-live="polite" className="text-sm font-medium text-muted-foreground">
        {label}
      </p>
      <Skeleton className="h-9 w-2/3" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-56 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

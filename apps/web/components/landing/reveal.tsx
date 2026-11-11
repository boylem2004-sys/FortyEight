"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades its children up the first time they scroll into view. Children can
 * stagger themselves with `group-data-[shown=true]/reveal:` classes.
 * With "reduce motion" on, everything is simply visible.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-shown={shown} className={cn("group/reveal", className)}>
      {children}
    </div>
  );
}

/** One staggered item inside a `Reveal`. `index` sets its place in the sequence. */
export function RevealItem({
  index,
  children,
  className,
}: {
  index: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      style={{ transitionDelay: `${index * 110}ms` }}
      className={cn(
        "translate-y-4 opacity-0 transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "group-data-[shown=true]/reveal:translate-y-0 group-data-[shown=true]/reveal:opacity-100",
        "motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

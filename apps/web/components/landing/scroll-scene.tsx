"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A tall section whose content stays pinned to the screen while you scroll
 * through it. Scroll position is written to the CSS variable `--p` (0 at the
 * start of the pin, 1 at the end), and children animate from it with plain
 * CSS. Nothing re-renders in React while scrolling, which keeps phones smooth.
 *
 * `steps` also sets `data-step` (0, 1, 2...) for styles that switch in stages,
 * and calls `onStep` when it changes.
 *
 * Hidden when "reduce motion" is on. Render a static version next to it.
 */
export function ScrollScene({
  children,
  className,
  steps = 1,
  onStep,
  "aria-labelledby": labelledBy,
  id,
}: {
  children: ReactNode;
  /** Sets the scroll length, e.g. `h-[300svh]`. */
  className?: string;
  steps?: number;
  onStep?: (step: number) => void;
  "aria-labelledby"?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const onStepRef = useRef(onStep);
  useEffect(() => {
    onStepRef.current = onStep;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let lastStep = -1;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel));
      el.style.setProperty("--p", p.toFixed(4));
      const step = Math.min(steps - 1, Math.floor(p * steps));
      if (step !== lastStep) {
        lastStep = step;
        el.dataset.step = String(step);
        onStepRef.current?.(step);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, [steps]);

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      data-step="0"
      style={{ "--p": 0 } as React.CSSProperties}
      className={cn("group/scene full-bleed relative motion-reduce:hidden", className)}
    >
      <div className="sticky top-0 h-svh overflow-hidden">{children}</div>
    </section>
  );
}

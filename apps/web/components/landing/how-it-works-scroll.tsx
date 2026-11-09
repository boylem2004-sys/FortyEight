"use client";

import { CalendarDays, Sparkles, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { DURATION_IN_FRAMES, STEP_COUNT } from "@/remotion/how-it-works/constants";
import { cn } from "@/lib/utils";

export const HOW_IT_WORKS_STEPS = [
  {
    icon: Users,
    title: "Tell us about your crew",
    body: "Where you are, what you're into, how many of you, and what you want to spend.",
  },
  {
    icon: CalendarDays,
    title: "Pick your weekend",
    body: "This Friday to Sunday by default, or any dates in the next two weeks.",
  },
  {
    icon: Sparkles,
    title: "Get 5 to 10 real picks",
    body: "Concerts, food, outdoors, and more, ranked for your group with a reason for each.",
  },
] as const;

const HowItWorksPlayer = dynamic(() => import("./how-it-works-player"), {
  ssr: false,
  loading: () => <div className="aspect-square w-full animate-pulse bg-muted" />,
});

/**
 * 0 when the section's top is 60% of the way down the screen (so the
 * animation starts as it slides in), 1 when its bottom reaches the bottom of
 * the screen (the end of the pinned part).
 */
function scrollProgress(section: HTMLElement): number {
  const rect = section.getBoundingClientRect();
  const vh = window.innerHeight;
  const start = vh * 0.6;
  const end = vh - rect.height;
  const p = (start - rect.top) / (start - end);
  return Math.min(1, Math.max(0, p));
}

/**
 * "How it works": the screen stays pinned while you scroll, and a Remotion
 * animation plays forward (scroll down) or rewinds (scroll up).
 * Hidden for people who turn on "reduce motion"; they get static cards instead.
 */
export function HowItWorksScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (sectionRef.current) setProgress(scrollProgress(sectionRef.current));
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
  }, []);

  const frame = Math.round(progress * (DURATION_IN_FRAMES - 1));
  const active = Math.min(STEP_COUNT - 1, Math.floor(progress * STEP_COUNT));

  return (
    <section
      ref={sectionRef}
      aria-labelledby="how-it-works"
      className="relative h-[320vh] motion-reduce:hidden"
    >
      <div className="sticky top-0 flex h-svh items-center py-6">
        <div className="grid w-full items-center gap-6 md:grid-cols-2 md:gap-12">
          <div
            aria-hidden
            className="mx-auto w-full max-w-[min(100%,48svh)] md:order-2 md:max-w-none"
          >
            <div className="overflow-hidden rounded-2xl border border-border shadow-lg">
              <HowItWorksPlayer frame={frame} />
            </div>
            <div className="mt-4 flex justify-center gap-2">
              {HOW_IT_WORKS_STEPS.map((step, i) => (
                <span
                  key={step.title}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === active ? "w-8 bg-primary" : "w-4 bg-border",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="md:order-1">
            <h2
              id="how-it-works"
              className="mb-4 text-sm font-semibold tracking-wide text-accent-foreground uppercase"
            >
              How it works
            </h2>
            <ol className="flex flex-col gap-3">
              {HOW_IT_WORKS_STEPS.map(({ icon: Icon, title, body }, i) => (
                <li
                  key={title}
                  aria-current={i === active ? "step" : undefined}
                  className={cn(
                    "rounded-xl border p-4 transition-all duration-300",
                    i === active
                      ? "border-primary/40 bg-card shadow-sm"
                      : "border-transparent opacity-45 max-md:sr-only",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <h3 className="font-semibold">
                      <span className="text-muted-foreground">{i + 1}. </span>
                      {title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Same content without motion, for people who turn on "reduce motion". */
export function HowItWorksStatic() {
  return (
    <section
      aria-labelledby="how-it-works-static"
      className="hidden pb-section motion-reduce:block"
    >
      <h2 id="how-it-works-static" className="sr-only">
        How it works
      </h2>
      <ol className="grid gap-4 sm:grid-cols-3">
        {HOW_IT_WORKS_STEPS.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Icon aria-hidden className="size-5" />
              </span>
              <span className="text-sm font-semibold text-muted-foreground">Step {i + 1}</span>
            </div>
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

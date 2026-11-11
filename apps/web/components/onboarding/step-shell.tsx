"use client";

import { ONBOARDING_STEPS, previousStep, stepIndex, type OnboardingStep } from "@fortyeight/core";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type FormEventHandler, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepShellProps {
  step: OnboardingStep;
  title: string;
  description?: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitLabel?: string;
  children: ReactNode;
}

/** Layout for one onboarding question: progress, heading, body, back/next. */
export function StepShell({
  step,
  title,
  description,
  onSubmit,
  submitLabel = "Next",
  children,
}: StepShellProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const index = stepIndex(step);
  const total = ONBOARDING_STEPS.length;
  const prev = previousStep(step);

  // Move focus to the new question so screen reader users hear it.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mx-auto flex max-w-content animate-rise-in flex-col gap-8 sm:pt-8"
    >
      <div
        role="progressbar"
        aria-label={`Step ${index + 1} of ${total}`}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        className="flex items-center gap-1.5"
      >
        {ONBOARDING_STEPS.map((s, i) => (
          <span
            key={s}
            className={cn("h-1 flex-1 rounded-full", i <= index ? "bg-foreground" : "bg-secondary")}
          />
        ))}
        <span aria-hidden className="ml-2 text-xs text-muted-foreground tabular-nums">
          {index + 1}/{total}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-4xl font-semibold tracking-tight text-balance outline-none sm:text-5xl"
        >
          {title}
        </h1>
        {description && <p className="text-[17px] text-muted-foreground">{description}</p>}
      </div>

      <div className="flex flex-col gap-8">{children}</div>

      <div className="sticky bottom-0 -mx-gutter mt-2 flex items-center justify-between gap-3 bg-background/90 px-gutter py-4 backdrop-blur-xl sm:static sm:mx-0 sm:bg-transparent sm:px-0">
        {prev ? (
          <Button asChild variant="ghost">
            <Link href={`/onboarding/${prev}`}>
              <ArrowLeft aria-hidden />
              Back
            </Link>
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" size="lg">
          {submitLabel}
          <ArrowRight aria-hidden />
        </Button>
      </div>
    </form>
  );
}

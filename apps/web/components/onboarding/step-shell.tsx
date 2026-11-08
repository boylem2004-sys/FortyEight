"use client";

import { ONBOARDING_STEPS, previousStep, stepIndex, type OnboardingStep } from "@fortyeight/core";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type FormEventHandler, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
    <form onSubmit={onSubmit} noValidate className="mx-auto flex max-w-content flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          Step {index + 1} of {total}
        </p>
        <Progress value={((index + 1) / total) * 100} label={`Step ${index + 1} of ${total}`} />
      </div>

      <div className="flex flex-col gap-2">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl font-bold tracking-tight outline-none"
        >
          {title}
        </h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      <div className="flex flex-col gap-6">{children}</div>

      <div className="sticky bottom-0 -mx-gutter mt-2 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-gutter py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
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

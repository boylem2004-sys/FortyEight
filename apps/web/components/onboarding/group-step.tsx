"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BUDGET_PRESETS,
  budgetFromPreset,
  DEFAULT_BUDGET_PRESET_ID,
  formatCents,
  GROUP_SIZE_MAX,
  GROUP_SIZE_MIN,
  groupBudgetStepSchema,
  presetForBudget,
  type Budget,
} from "@fortyeight/core";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { hrefAfterStep } from "@/lib/onboarding";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { ChipRadioGroup } from "./chip-group";
import { FieldError } from "./field-error";
import { StepShell } from "./step-shell";

const BUDGET_OPTIONS = BUDGET_PRESETS.map((p) => ({ value: p.id, label: p.label }));

function budgetHint(budget: Budget, groupSize: number): string {
  if (budget.maxCents === 0) return "Only free things.";
  if (budget.maxCents === null) return `${formatCents(budget.minCents)} or more per person.`;
  if (!Number.isFinite(groupSize) || groupSize <= 1) {
    return `Up to ${formatCents(budget.maxCents)} for you.`;
  }
  return `Up to ${formatCents(budget.maxCents * groupSize)} for your group of ${groupSize}.`;
}

/** Last question: how many people, and what each can spend. */
export function GroupStepForm() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const update = useOnboardingStore((s) => s.update);

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(groupBudgetStepSchema),
    defaultValues: { groupSize: draft.groupSize, budget: draft.budget },
  });
  const groupSize = useWatch({ control, name: "groupSize" });
  const sizeError = formState.errors.groupSize?.message;
  const budgetError =
    formState.errors.budget?.message ?? formState.errors.budget?.maxCents?.message;

  const onSubmit = handleSubmit((values) => {
    update(values);
    router.push(hrefAfterStep("group"));
  });

  return (
    <StepShell
      step="group"
      title="Who's in, and what's the budget?"
      description="We'll show prices for the whole group."
      onSubmit={onSubmit}
      submitLabel="Pick dates"
    >
      <Controller
        control={control}
        name="groupSize"
        render={({ field }) => {
          const value = Number.isFinite(field.value) ? field.value : GROUP_SIZE_MIN;
          const set = (n: number) =>
            field.onChange(Math.max(GROUP_SIZE_MIN, Math.min(GROUP_SIZE_MAX, n)));
          return (
            <div className="flex flex-col gap-3">
              <Label htmlFor="group-size">People going</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  aria-label="One fewer person"
                  onClick={() => set(value - 1)}
                  disabled={value <= GROUP_SIZE_MIN}
                >
                  <Minus aria-hidden />
                </Button>
                <input
                  id="group-size"
                  type="number"
                  inputMode="numeric"
                  min={GROUP_SIZE_MIN}
                  max={GROUP_SIZE_MAX}
                  value={Number.isFinite(field.value) ? field.value : ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? Number.NaN : Number(e.target.value))
                  }
                  onBlur={field.onBlur}
                  aria-invalid={sizeError ? true : undefined}
                  aria-describedby={sizeError ? "group-size-error" : "group-size-hint"}
                  className="h-16 w-24 [appearance:textfield] rounded-3xl bg-card text-center text-5xl font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/60 [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  aria-label="One more person"
                  onClick={() => set(value + 1)}
                  disabled={value >= GROUP_SIZE_MAX}
                >
                  <Plus aria-hidden />
                </Button>
              </div>
              <p id="group-size-hint" className="text-sm text-muted-foreground">
                Count everyone, including you. {GROUP_SIZE_MIN} to {GROUP_SIZE_MAX} people.
              </p>
              <FieldError id="group-size-error" message={sizeError} />
            </div>
          );
        }}
      />

      <Controller
        control={control}
        name="budget"
        render={({ field }) => (
          <div className="flex flex-col gap-3">
            <ChipRadioGroup
              legend="Budget per person, for the whole weekend"
              options={BUDGET_OPTIONS}
              value={presetForBudget(field.value)?.id ?? DEFAULT_BUDGET_PRESET_ID}
              onChange={(id) => field.onChange(budgetFromPreset(id))}
            />
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {budgetHint(field.value, groupSize)}
            </p>
            <FieldError id="budget-error" message={budgetError} />
          </div>
        )}
      />
    </StepShell>
  );
}

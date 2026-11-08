"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BUDGET_PRESETS,
  budgetFromPreset,
  budgetStepSchema,
  DEFAULT_BUDGET_PRESET_ID,
  formatCents,
  presetForBudget,
  type Budget,
} from "@fortyeight/core";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { hrefAfterStep } from "@/lib/onboarding";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { ChipRadioGroup } from "./chip-group";
import { FieldError } from "./field-error";
import { StepShell } from "./step-shell";

const DEFAULT_INDEX = BUDGET_PRESETS.findIndex((p) => p.id === DEFAULT_BUDGET_PRESET_ID);

function presetIndex(budget: Budget): number {
  const preset = presetForBudget(budget);
  const i = preset ? BUDGET_PRESETS.findIndex((p) => p.id === preset.id) : -1;
  return i === -1 ? DEFAULT_INDEX : i;
}

function groupHint(budget: Budget, groupSize: number): string {
  if (budget.maxCents === 0) return "Only free things.";
  if (budget.maxCents === null) return `${formatCents(budget.minCents)} or more per person.`;
  if (groupSize <= 1) return `Up to ${formatCents(budget.maxCents)} for you.`;
  return `Up to ${formatCents(budget.maxCents * groupSize)} for your group of ${groupSize}.`;
}

export function BudgetStepForm() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const update = useOnboardingStore((s) => s.update);

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(budgetStepSchema),
    defaultValues: { budget: draft.budget },
  });
  const error = formState.errors.budget?.message ?? formState.errors.budget?.maxCents?.message;

  const onSubmit = handleSubmit((values) => {
    update(values);
    router.push(hrefAfterStep("budget"));
  });

  return (
    <StepShell
      step="budget"
      title="What's the budget?"
      description="Per person, for the whole weekend."
      onSubmit={onSubmit}
      submitLabel="Pick dates"
    >
      <Controller
        control={control}
        name="budget"
        render={({ field }) => {
          const index = presetIndex(field.value);
          const preset = BUDGET_PRESETS[index]!;
          return (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                <Label htmlFor="budget-slider" className="text-muted-foreground">
                  Budget per person
                </Label>
                <p aria-hidden className="text-3xl font-bold">
                  {preset.label}
                </p>
                <input
                  id="budget-slider"
                  type="range"
                  min={0}
                  max={BUDGET_PRESETS.length - 1}
                  step={1}
                  value={index}
                  aria-valuetext={preset.label}
                  onChange={(e) =>
                    field.onChange(budgetFromPreset(BUDGET_PRESETS[Number(e.target.value)]!.id))
                  }
                  className="w-full accent-primary"
                />
                <div aria-hidden className="flex justify-between text-xs text-muted-foreground">
                  <span>Free</span>
                  <span>$100+</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {groupHint(field.value, draft.groupSize)}
                </p>
              </div>
              <ChipRadioGroup
                legend="Or pick one"
                options={BUDGET_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
                value={preset.id}
                onChange={(id) => field.onChange(budgetFromPreset(id))}
              />
            </div>
          );
        }}
      />
      <FieldError id="budget-error" message={error} />
    </StepShell>
  );
}

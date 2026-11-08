"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GROUP_SIZE_MAX, GROUP_SIZE_MIN, groupStepSchema } from "@fortyeight/core";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { hrefAfterStep } from "@/lib/onboarding";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { FieldError } from "./field-error";
import { StepShell } from "./step-shell";

export function GroupStepForm() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const update = useOnboardingStore((s) => s.update);

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(groupStepSchema),
    defaultValues: { groupSize: draft.groupSize },
  });
  const error = formState.errors.groupSize?.message;

  const onSubmit = handleSubmit((values) => {
    update(values);
    router.push(hrefAfterStep("group"));
  });

  return (
    <StepShell
      step="group"
      title="How many of you?"
      description="Count everyone, including you. We'll show prices for the whole group."
      onSubmit={onSubmit}
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
                  variant="outline"
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
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "group-size-error" : undefined}
                  className="h-14 w-24 rounded-lg border border-input bg-card text-center text-2xl font-bold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="One more person"
                  onClick={() => set(value + 1)}
                  disabled={value >= GROUP_SIZE_MAX}
                >
                  <Plus aria-hidden />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {GROUP_SIZE_MIN} to {GROUP_SIZE_MAX} people.
              </p>
            </div>
          );
        }}
      />
      <FieldError id="group-size-error" message={error} />
    </StepShell>
  );
}

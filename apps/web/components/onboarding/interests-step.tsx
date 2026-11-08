"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  INTEREST_LABELS,
  INTERESTS,
  INTERESTS_FREEFORM_MAX,
  interestsStepSchema,
} from "@fortyeight/core";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hrefAfterStep } from "@/lib/onboarding";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { ChipCheckboxGroup } from "./chip-group";
import { FieldError } from "./field-error";
import { StepShell } from "./step-shell";

const OPTIONS = INTERESTS.map((value) => ({ value, label: INTEREST_LABELS[value] }));

export function InterestsStepForm() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const update = useOnboardingStore((s) => s.update);

  const { control, register, handleSubmit, formState } = useForm({
    resolver: zodResolver(interestsStepSchema),
    defaultValues: { interests: draft.interests, interestsFreeform: draft.interestsFreeform },
  });
  const error = formState.errors.interests?.message ?? formState.errors.interests?.root?.message;

  const onSubmit = handleSubmit((values) => {
    update(values);
    router.push(hrefAfterStep("interests"));
  });

  return (
    <StepShell
      step="interests"
      title="What are you into?"
      description="Pick everything your group enjoys."
      onSubmit={onSubmit}
    >
      <Controller
        control={control}
        name="interests"
        render={({ field }) => (
          <ChipCheckboxGroup
            legend="Interests"
            hideLegend
            options={OPTIONS}
            value={field.value}
            onChange={field.onChange}
            invalid={Boolean(error)}
            errorId="interests-error"
          />
        )}
      />
      <FieldError id="interests-error" message={error} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="interests-freeform">Anything else? (optional)</Label>
        <Input
          id="interests-freeform"
          placeholder="Board games, karaoke, escape rooms..."
          maxLength={INTERESTS_FREEFORM_MAX}
          {...register("interestsFreeform")}
        />
      </div>
    </StepShell>
  );
}

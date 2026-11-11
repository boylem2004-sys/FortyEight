"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  activitiesStepSchema,
  EVENT_TYPE_LABELS,
  EVENT_TYPES,
  interestsForEventTypes,
  INTERESTS_FREEFORM_MAX,
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

const OPTIONS = EVENT_TYPES.map((value) => ({ value, label: EVENT_TYPE_LABELS[value] }));

export function ActivitiesStepForm() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const update = useOnboardingStore((s) => s.update);

  const { control, register, handleSubmit, formState } = useForm({
    resolver: zodResolver(activitiesStepSchema),
    defaultValues: { eventTypes: draft.eventTypes, interestsFreeform: draft.interestsFreeform },
  });
  const error = formState.errors.eventTypes?.message ?? formState.errors.eventTypes?.root?.message;

  const onSubmit = handleSubmit((values) => {
    // One question on screen; the interests used for ranking come from the picks.
    update({ ...values, interests: interestsForEventTypes(values.eventTypes) });
    router.push(hrefAfterStep("activities"));
  });

  return (
    <StepShell
      step="activities"
      title="What sounds good?"
      description="Tap everything your group would say yes to."
      onSubmit={onSubmit}
    >
      <Controller
        control={control}
        name="eventTypes"
        render={({ field }) => (
          <ChipCheckboxGroup
            legend="Things to do"
            hideLegend
            options={OPTIONS}
            value={field.value}
            onChange={field.onChange}
            invalid={Boolean(error)}
            errorId="activities-error"
          />
        )}
      />
      <FieldError id="activities-error" message={error} />

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

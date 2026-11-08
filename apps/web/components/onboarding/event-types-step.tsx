"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EVENT_TYPE_LABELS, EVENT_TYPES, eventTypesStepSchema } from "@fortyeight/core";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { hrefAfterStep } from "@/lib/onboarding";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { ChipCheckboxGroup } from "./chip-group";
import { FieldError } from "./field-error";
import { StepShell } from "./step-shell";

const OPTIONS = EVENT_TYPES.map((value) => ({ value, label: EVENT_TYPE_LABELS[value] }));

export function EventTypesStepForm() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const update = useOnboardingStore((s) => s.update);

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(eventTypesStepSchema),
    defaultValues: { eventTypes: draft.eventTypes },
  });
  const error = formState.errors.eventTypes?.message ?? formState.errors.eventTypes?.root?.message;

  const onSubmit = handleSubmit((values) => {
    update(values);
    router.push(hrefAfterStep("event-types"));
  });

  return (
    <StepShell
      step="event-types"
      title="What do you like to do?"
      description="We'll search for these kinds of things."
      onSubmit={onSubmit}
    >
      <Controller
        control={control}
        name="eventTypes"
        render={({ field }) => (
          <ChipCheckboxGroup
            legend="Event types"
            hideLegend
            options={OPTIONS}
            value={field.value}
            onChange={field.onChange}
            invalid={Boolean(error)}
            errorId="event-types-error"
          />
        )}
      />
      <FieldError id="event-types-error" message={error} />
    </StepShell>
  );
}

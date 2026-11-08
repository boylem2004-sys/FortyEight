"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { locationStepSchema, RADIUS_OPTIONS } from "@fortyeight/core";
import { LocateFixed, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { hrefAfterStep } from "@/lib/onboarding";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { ChipRadioGroup } from "./chip-group";
import { FieldError } from "./field-error";
import { StepShell } from "./step-shell";

const CURRENT_LOCATION_LABEL = "Current location";

export function LocationStepForm() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const update = useOnboardingStore((s) => s.update);
  const geo = useGeolocation();

  const form = useForm({
    resolver: zodResolver(locationStepSchema),
    defaultValues: {
      location: draft.location ?? { label: "", lat: null, lng: null },
      radiusMiles: draft.radiusMiles,
    },
  });
  const { control, register, handleSubmit, setValue, formState } = form;
  const location = useWatch({ control, name: "location" });
  const usingDevice = location.lat !== null;

  const errors = formState.errors.location;
  const locationError = errors?.label?.message ?? errors?.message ?? errors?.root?.message;

  async function handleUseMyLocation() {
    const coords = await geo.locate();
    if (!coords) return;
    setValue(
      "location",
      { label: CURRENT_LOCATION_LABEL, ...coords },
      { shouldValidate: true, shouldDirty: true },
    );
  }

  const onSubmit = handleSubmit((values) => {
    update(values);
    router.push(hrefAfterStep("location"));
  });

  return (
    <StepShell
      step="location"
      title="Where are you?"
      description="We'll look for things to do around here."
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleUseMyLocation}
          disabled={geo.status === "locating"}
          className="justify-start"
        >
          <LocateFixed aria-hidden />
          {geo.status === "locating" ? "Finding you..." : "Use my location"}
        </Button>
        {geo.error && (
          <p role="status" className="text-sm text-muted-foreground">
            {geo.error}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground uppercase">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="location-label">City or ZIP code</Label>
          <div className="relative">
            <MapPin
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="location-label"
              autoComplete="address-level2"
              placeholder="Blue Bell, PA or 19422"
              className="pl-9"
              aria-invalid={locationError ? true : undefined}
              aria-describedby={
                locationError ? "location-error" : usingDevice ? "location-hint" : undefined
              }
              {...register("location.label", {
                onChange: () => {
                  // Typing replaces device coordinates. The server geocodes the text.
                  if (location.lat !== null) {
                    setValue("location.lat", null);
                    setValue("location.lng", null);
                  }
                },
              })}
            />
          </div>
          {usingDevice && (
            <p id="location-hint" className="text-sm text-success">
              Using your device location.
            </p>
          )}
          <FieldError id="location-error" message={locationError} />
        </div>
      </div>

      <Controller
        control={control}
        name="radiusMiles"
        render={({ field }) => (
          <ChipRadioGroup
            legend="How far will you travel?"
            options={RADIUS_OPTIONS.map((miles) => ({ value: miles, label: `${miles} miles` }))}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </StepShell>
  );
}

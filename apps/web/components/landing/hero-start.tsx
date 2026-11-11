"use client";

import { firstIncompleteStep, locationSchema } from "@fortyeight/core";
import { ArrowRight, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { FieldError } from "@/components/onboarding/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { cn } from "@/lib/utils";

/**
 * The first onboarding question, right on the landing page. Typing a city and
 * pressing the button saves it and drops the visitor on question two.
 * People who already answered everything go straight to picking dates.
 */
export function HeroStart({ className }: { className?: string }) {
  const id = useId();
  const router = useRouter();
  const hydrated = useHydrated();
  const draft = useOnboardingStore((s) => s.draft);
  const update = useOnboardingStore((s) => s.update);
  const [typed, setTyped] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  // Returning visitors see the place they used last time.
  const saved = hydrated ? (draft.location?.label ?? "") : "";
  const value = typed ?? saved;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // Keep device coordinates when the saved place was not edited.
    const location =
      draft.location && value.trim() === draft.location.label
        ? draft.location
        : { label: value, lat: null, lng: null };
    const parsed = locationSchema.safeParse(location);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a city or ZIP code");
      return;
    }
    const next = { ...draft, location: parsed.data };
    update({ location: parsed.data });
    const step = firstIncompleteStep(next);
    router.push(step ? `/onboarding/${step}` : "/plan");
  }

  return (
    <form onSubmit={onSubmit} noValidate className={cn("w-full max-w-md", className)}>
      <label htmlFor={id} className="sr-only">
        City or ZIP code
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MapPin
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id={id}
            value={value}
            onChange={(e) => {
              setTyped(e.target.value);
              setError(undefined);
            }}
            autoComplete="address-level2"
            enterKeyHint="go"
            placeholder="Your city or ZIP"
            className="h-13 pl-11 text-[17px]"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        </div>
        <Button type="submit" size="lg">
          Find my weekend
          <ArrowRight aria-hidden />
        </Button>
      </div>
      <div className="mt-2 px-5 text-left">
        <FieldError id={`${id}-error`} message={error} />
      </div>
    </form>
  );
}

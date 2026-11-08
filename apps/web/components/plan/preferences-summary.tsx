import {
  budgetLabel,
  EVENT_TYPE_LABELS,
  INTEREST_LABELS,
  type OnboardingStep,
  type Preferences,
} from "@fortyeight/core";
import Link from "next/link";

function Row({ label, value, step }: { label: string; value: string; step: OnboardingStep }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 font-medium break-words">{value}</dd>
      </div>
      <Link
        href={`/onboarding/${step}`}
        className="shrink-0 rounded text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        Edit<span className="sr-only"> {label.toLowerCase()}</span>
      </Link>
    </div>
  );
}

export function PreferencesSummary({ preferences: p }: { preferences: Preferences }) {
  const interests = [
    ...p.interests.map((i) => INTEREST_LABELS[i]),
    p.interestsFreeform.trim(),
  ].filter(Boolean);
  return (
    <dl className="divide-y divide-border">
      <Row
        label="Where"
        value={`${p.location.label}, within ${p.radiusMiles} miles`}
        step="location"
      />
      <Row label="Into" value={interests.join(", ")} step="interests" />
      <Row
        label="Likes"
        value={p.eventTypes.map((t) => EVENT_TYPE_LABELS[t]).join(", ")}
        step="event-types"
      />
      <Row
        label="Group"
        value={p.groupSize === 1 ? "Just me" : `${p.groupSize} people`}
        step="group"
      />
      <Row label="Budget" value={`${budgetLabel(p.budget)} per person`} step="budget" />
    </dl>
  );
}

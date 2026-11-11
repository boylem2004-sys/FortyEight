"use client";

import { Check } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/utils";

interface Option<T extends string | number> {
  value: T;
  label: string;
}

const chipClass =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-input bg-foreground/[0.04] px-4 py-2.5 text-sm font-medium transition-[background-color,color,border-color,scale] duration-200 select-none hover:bg-foreground/10 active:scale-95 has-checked:border-foreground has-checked:bg-foreground has-checked:text-background has-focus-visible:ring-3 has-focus-visible:ring-ring/60";

interface ChipCheckboxGroupProps<T extends string> {
  legend: string;
  hideLegend?: boolean;
  options: readonly Option<T>[];
  value: readonly T[];
  onChange: (next: T[]) => void;
  errorId?: string;
  invalid?: boolean;
}

/** Multi-select chips. Real checkboxes underneath, so keyboard and screen readers just work. */
export function ChipCheckboxGroup<T extends string>({
  legend,
  hideLegend,
  options,
  value,
  onChange,
  errorId,
  invalid,
}: ChipCheckboxGroupProps<T>) {
  const name = useId();
  const toggle = (v: T, checked: boolean) =>
    onChange(checked ? [...value, v] : value.filter((x) => x !== v));

  return (
    <fieldset aria-describedby={invalid ? errorId : undefined} aria-invalid={invalid || undefined}>
      <legend className={cn("mb-3 text-sm font-semibold", hideLegend && "sr-only")}>
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const checked = value.includes(o.value);
          return (
            <label key={o.value} className={chipClass}>
              <input
                type="checkbox"
                name={name}
                className="sr-only"
                checked={checked}
                onChange={(e) => toggle(o.value, e.target.checked)}
              />
              {checked && <Check aria-hidden className="size-4" />}
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

interface ChipRadioGroupProps<T extends string | number> {
  legend: string;
  hideLegend?: boolean;
  options: readonly Option<T>[];
  value: T | null;
  onChange: (next: T) => void;
}

/** Single-select chips backed by native radio buttons (arrow keys move between them). */
export function ChipRadioGroup<T extends string | number>({
  legend,
  hideLegend,
  options,
  value,
  onChange,
}: ChipRadioGroupProps<T>) {
  const name = useId();
  return (
    <fieldset>
      <legend className={cn("mb-3 text-sm font-semibold", hideLegend && "sr-only")}>
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={String(o.value)} className={chipClass}>
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

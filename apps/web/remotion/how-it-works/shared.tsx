import type { CSSProperties, ReactNode } from "react";
import { Easing } from "remotion";

/** Fast start, soft landing. Used for most entrances. */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
/** A little overshoot, for things that "pop". */
export const POP = Easing.spring({ damping: 12 });

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Colors come from the site's theme tokens, so light and dark mode both work. */
export const color = {
  bg: "var(--card)",
  fg: "var(--card-foreground)",
  muted: "var(--muted)",
  mutedFg: "var(--muted-foreground)",
  primary: "var(--primary)",
  primaryFg: "var(--primary-foreground)",
  accent: "var(--accent)",
  accentFg: "var(--accent-foreground)",
  highlight: "var(--highlight)",
  success: "var(--success)",
  border: "var(--border)",
} as const;

export function StepLabel({
  step,
  children,
  style,
}: {
  step: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 72,
        left: 80,
        display: "flex",
        alignItems: "center",
        gap: 20,
        fontSize: 36,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: color.mutedFg,
        ...style,
      }}
    >
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 64,
          height: 64,
          borderRadius: 18,
          backgroundColor: color.primary,
          color: color.primaryFg,
          fontSize: 36,
          letterSpacing: 0,
        }}
      >
        {step}
      </span>
      {children}
    </div>
  );
}

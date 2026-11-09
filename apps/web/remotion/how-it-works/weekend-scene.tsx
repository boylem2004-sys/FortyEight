import { interpolate, useCurrentFrame } from "remotion";
import { OVERLAP, SCENE_FRAMES } from "./constants";
import { clamp, color, EASE_OUT, StepLabel } from "./shared";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKEND_START = 4; // Friday
const TILE = 112;
const GAP = 16;

/** Step 2: a week appears, Friday to Sunday lights up, and a 48-hour counter runs. */
export function WeekendScene() {
  const frame = useCurrentFrame();
  const length = SCENE_FRAMES;
  const sweep = interpolate(frame, [26, 50], [0, 1], { ...clamp, easing: EASE_OUT });
  const hours = Math.round(interpolate(frame, [36, 70], [0, 48], { ...clamp, easing: EASE_OUT }));
  const bandWidth = 3 * TILE + 2 * GAP + 24;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "180px 80px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 64,
        opacity: interpolate(frame, [0, OVERLAP, length - OVERLAP, length], [0, 1, 1, 0], clamp),
        translate: interpolate(
          frame,
          [0, OVERLAP, length - OVERLAP, length],
          ["0px 40px", "0px 0px", "0px 0px", "0px -40px"],
          {
            ...clamp,
            easing: EASE_OUT,
          },
        ),
      }}
    >
      <StepLabel step={2}>Your weekend</StepLabel>

      {/* The week, with a band that sweeps across Fri, Sat, Sun */}
      <div style={{ position: "relative", display: "flex", gap: GAP, alignSelf: "center" }}>
        <div
          style={{
            position: "absolute",
            top: -12,
            bottom: -12,
            left: WEEKEND_START * (TILE + GAP) - 12,
            width: bandWidth * sweep,
            borderRadius: 32,
            backgroundColor: color.primary,
          }}
        />
        {DAYS.map((day, i) => {
          const isWeekend = i >= WEEKEND_START;
          const lit = isWeekend && sweep * 3 > i - WEEKEND_START + 0.5;
          return (
            <div
              key={day}
              style={{
                position: "relative",
                width: TILE,
                height: 150,
                borderRadius: 24,
                display: "grid",
                placeItems: "center",
                fontSize: 32,
                fontWeight: 700,
                backgroundColor: lit ? "transparent" : color.muted,
                color: lit ? color.primaryFg : isWeekend ? color.fg : color.mutedFg,
                opacity: interpolate(frame, [6 + i * 3, 16 + i * 3], [0, 1], clamp),
                translate: interpolate(frame, [6 + i * 3, 16 + i * 3], ["0px 24px", "0px 0px"], {
                  ...clamp,
                  easing: EASE_OUT,
                }),
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* 48-hour counter */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 20,
            color: color.primary,
            opacity: interpolate(frame, [32, 42], [0, 1], clamp),
          }}
        >
          <span
            style={{
              fontSize: 240,
              fontWeight: 900,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {hours}
          </span>
          <span style={{ fontSize: 64, fontWeight: 800 }}>hours</span>
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: color.mutedFg,
            textAlign: "center",
            opacity: interpolate(frame, [60, 74], [0, 1], clamp),
          }}
        >
          Friday to Sunday, or any dates in the next two weeks
        </div>
      </div>
    </div>
  );
}

import { interpolate, useCurrentFrame } from "remotion";
import { OVERLAP, SCENE_FRAMES } from "./constants";
import { clamp, color, EASE_OUT, POP, StepLabel } from "./shared";

const FRIENDS = [
  { initial: "M", bg: color.primary, fg: color.primaryFg },
  { initial: "L", bg: color.highlight, fg: "#ffffff" },
  { initial: "A", bg: color.success, fg: "#ffffff" },
  { initial: "J", bg: color.accent, fg: color.accentFg },
];

const INTERESTS = ["Live music", "Food and drink", "Outdoors", "Comedy", "Nightlife", "Markets"];
/** Which interest chips get picked, in order. */
const PICKED = [0, 1, 2];

/** Step 1: the group, their interests, and a budget come together. */
export function CrewScene() {
  const frame = useCurrentFrame();
  // Fade out fully before the next scene fades in, so the two never overlap.
  const exitStart = SCENE_FRAMES - OVERLAP;
  const exitEnd = SCENE_FRAMES;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "180px 80px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 56,
        opacity: interpolate(frame, [exitStart, exitEnd], [1, 0], clamp),
        translate: interpolate(frame, [exitStart, exitEnd], ["0px 0px", "0px -40px"], {
          ...clamp,
          easing: EASE_OUT,
        }),
      }}
    >
      <StepLabel step={1} style={{ opacity: interpolate(frame, [0, 10], [0, 1], clamp) }}>
        Your crew
      </StepLabel>

      {/* Friends pop in one by one */}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{ display: "flex" }}>
          {FRIENDS.map((f, i) => (
            <div
              key={f.initial}
              style={{
                width: 132,
                height: 132,
                marginLeft: i === 0 ? 0 : -28,
                borderRadius: 999,
                border: `8px solid ${color.bg}`,
                backgroundColor: f.bg,
                color: f.fg,
                display: "grid",
                placeItems: "center",
                fontSize: 52,
                fontWeight: 800,
                scale: interpolate(frame, [4 + i * 5, 18 + i * 5], [0, 1], {
                  ...clamp,
                  easing: POP,
                  output: "perceptual-scale",
                }),
              }}
            >
              {f.initial}
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            opacity: interpolate(frame, [24, 36], [0, 1], clamp),
            translate: interpolate(frame, [24, 36], ["-20px 0px", "0px 0px"], {
              ...clamp,
              easing: EASE_OUT,
            }),
          }}
        >
          Group of 4
        </div>
      </div>

      {/* Interest chips appear, then three get picked */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {INTERESTS.map((label, i) => {
          const pickOrder = PICKED.indexOf(i);
          const pickAt = 48 + pickOrder * 7;
          const picked = pickOrder !== -1 && frame >= pickAt + 4;
          return (
            <div
              key={label}
              style={{
                position: "relative",
                padding: "22px 36px",
                borderRadius: 999,
                border: `3px solid ${picked ? color.primary : color.border}`,
                fontSize: 42,
                fontWeight: 600,
                color: picked ? color.primaryFg : color.fg,
                overflow: "hidden",
                isolation: "isolate",
                opacity: interpolate(frame, [16 + i * 4, 28 + i * 4], [0, 1], clamp),
                translate: interpolate(frame, [16 + i * 4, 28 + i * 4], ["0px 30px", "0px 0px"], {
                  ...clamp,
                  easing: EASE_OUT,
                }),
              }}
            >
              {pickOrder !== -1 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: -1,
                    backgroundColor: color.primary,
                    opacity: interpolate(frame, [pickAt, pickAt + 8], [0, 1], clamp),
                    scale: interpolate(frame, [pickAt, pickAt + 8], [0.6, 1], {
                      ...clamp,
                      easing: POP,
                      output: "perceptual-scale",
                    }),
                  }}
                />
              )}
              {picked ? "✓ " : ""}
              {label}
            </div>
          );
        })}
      </div>

      {/* Budget slides in last */}
      <div
        style={{
          alignSelf: "flex-start",
          display: "flex",
          alignItems: "baseline",
          gap: 16,
          padding: "26px 40px",
          borderRadius: 28,
          backgroundColor: color.accent,
          color: color.accentFg,
          opacity: interpolate(frame, [66, 78], [0, 1], clamp),
          translate: interpolate(frame, [66, 78], ["-60px 0px", "0px 0px"], {
            ...clamp,
            easing: EASE_OUT,
          }),
        }}
      >
        <span style={{ fontSize: 48, fontWeight: 800 }}>Under $50</span>
        <span style={{ fontSize: 34, fontWeight: 600 }}>per person</span>
      </div>
    </div>
  );
}

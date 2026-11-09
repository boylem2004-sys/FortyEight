import { interpolate, useCurrentFrame } from "remotion";
import { OVERLAP } from "./constants";
import { clamp, color, EASE_OUT, StepLabel } from "./shared";

/** Sample picks for the illustration. Same made-up places as the app's sample data. */
const PICKS = [
  { rank: 1, title: "The Night Owls", meta: "Concert · Sat 8 PM", price: "From $28", fit: 96 },
  { rank: 2, title: "Taqueria Sol", meta: "Restaurant · 3 mi", price: "Up to $15", fit: 91 },
  { rank: 3, title: "Ridgeline Trail Park", meta: "Outdoors · 10 mi", price: "Free", fit: 88 },
];

/** Step 3: ranked picks stack up, and the top one shows why it fits. */
export function PicksScene() {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "180px 80px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 44,
        opacity: interpolate(frame, [0, OVERLAP], [0, 1], clamp),
        translate: interpolate(frame, [0, OVERLAP], ["0px 40px", "0px 0px"], {
          ...clamp,
          easing: EASE_OUT,
        }),
      }}
    >
      <StepLabel step={3}>Your picks</StepLabel>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {PICKS.map((pick, i) => {
          const start = 8 + i * 9;
          const isTop = i === 0;
          return (
            <div
              key={pick.title}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
                padding: "30px 36px",
                borderRadius: 32,
                border: `3px solid ${isTop ? color.primary : color.border}`,
                backgroundColor: color.bg,
                boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
                opacity: interpolate(frame, [start, start + 14], [0, 1], clamp),
                translate: interpolate(frame, [start, start + 14], ["0px 90px", "0px 0px"], {
                  ...clamp,
                  easing: EASE_OUT,
                }),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: color.mutedFg }}>
                  #{pick.rank}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 44, fontWeight: 800 }}>{pick.title}</div>
                  <div
                    style={{ fontSize: 34, fontWeight: 600, color: color.mutedFg, marginTop: 4 }}
                  >
                    {pick.meta}
                  </div>
                </div>
                <span
                  style={{
                    padding: "12px 24px",
                    borderRadius: 999,
                    backgroundColor: color.accent,
                    color: color.accentFg,
                    fontSize: 32,
                    fontWeight: 700,
                  }}
                >
                  {pick.price}
                </span>
              </div>

              {isTop && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 18,
                        borderRadius: 999,
                        backgroundColor: color.muted,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 999,
                          backgroundColor: color.primary,
                          width: `${interpolate(frame, [40, 66], [0, pick.fit], { ...clamp, easing: EASE_OUT })}%`,
                        }}
                      />
                    </div>
                    <span
                      style={{ fontSize: 34, fontWeight: 800, color: color.primary, minWidth: 150 }}
                    >
                      {Math.round(
                        interpolate(frame, [40, 66], [0, pick.fit], { ...clamp, easing: EASE_OUT }),
                      )}
                      % fit
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 600,
                      color: color.mutedFg,
                      opacity: interpolate(frame, [56, 70], [0, 1], clamp),
                    }}
                  >
                    Why: your group loves live music, and it&apos;s inside your budget.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

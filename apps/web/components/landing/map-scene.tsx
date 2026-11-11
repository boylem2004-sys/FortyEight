import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CANDIDATES, CityStreets, MAP_SIZE, PICKS, ROUTE } from "./city-map";
import { SAMPLE_WEEKEND } from "./sample-weekend";
import { ramp, window4 } from "./scroll-math";
import { ScrollScene } from "./scroll-scene";

/** Sets `--t` (0 to 1) on an element so its classes can animate from it. */
const t = (value: string) => ({ "--t": value }) as CSSProperties;

function Caption({ show, children }: { show: string; children: ReactNode }) {
  return (
    <p
      style={{ ...t(show), opacity: "var(--t)", translate: "0 calc((1 - var(--t)) * 16px)" }}
      className="absolute inset-x-0 bottom-0 text-4xl leading-[1.07] font-semibold tracking-tight text-balance sm:text-[56px]"
    >
      {children}
    </p>
  );
}

/**
 * "How it works" as one full-screen scroll: a tilted night map turns as you
 * scroll, everything on this weekend lights up, the picks get connected, and
 * the map falls away to leave the plan.
 */
export function MapScene() {
  return (
    <ScrollScene steps={4} className="h-[420svh]" aria-labelledby="how-it-works">
      <h2 id="how-it-works" className="sr-only">
        How it works
      </h2>

      {/* The map. It has no frame: the edges fade into the page. */}
      <div
        aria-hidden
        className="absolute top-[40%] left-1/2 aspect-square w-[max(170vw,120svh)] -translate-x-1/2 -translate-y-1/2 sm:top-1/2 sm:w-[max(105vw,135svh)]"
      >
        <div
          style={{
            ...t(ramp(0.72, 0.9)),
            opacity: "calc(1 - var(--t) * 0.8)",
            translate: "0 calc(var(--t) * -12svh)",
            perspective: "1100px",
            maskImage: "radial-gradient(closest-side, black 50%, transparent)",
          }}
          className="size-full"
        >
          <svg
            viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`}
            fill="none"
            style={{
              transform:
                "rotateX(calc(64deg - var(--p) * 18deg)) rotateZ(calc(-28deg + var(--p) * 56deg)) scale(calc(0.85 + var(--p) * 0.35))",
            }}
            className="size-full will-change-transform"
          >
            <CityStreets />

            {/* How far you said you would travel. */}
            <circle
              cx="500"
              cy="500"
              r="330"
              stroke="#f5f5f7"
              strokeOpacity="0.5"
              strokeWidth="2"
              strokeDasharray="4 10"
              style={{
                ...t(ramp(0.04, 0.2)),
                opacity: "var(--t)",
                scale: "var(--t)",
                transformOrigin: "500px 500px",
              }}
            />

            {/* Everything on this weekend. */}
            {CANDIDATES.map((c, i) => (
              <circle
                key={i}
                cx={c.x}
                cy={c.y}
                r="7"
                fill="#86868b"
                style={{
                  ...t(window4(0.24 + i * 0.006, 0.27 + i * 0.006, 0.5, 0.6)),
                  opacity: "calc(0.15 + var(--t) * 0.85)",
                  scale: "var(--t)",
                  transformOrigin: `${c.x}px ${c.y}px`,
                }}
              />
            ))}

            {/* The route through the picks. */}
            <path
              d={ROUTE}
              pathLength="1"
              stroke="#f5f5f7"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1"
              style={{ ...t(ramp(0.56, 0.7)), strokeDashoffset: "calc(1 - var(--t))" }}
            />
            {PICKS.map((p, i) => (
              <g
                key={i}
                style={{
                  ...t(ramp(0.48 + i * 0.02, 0.53 + i * 0.02)),
                  opacity: "var(--t)",
                  scale: "var(--t)",
                  transformOrigin: `${p.x}px ${p.y}px`,
                }}
              >
                <circle cx={p.x} cy={p.y} r="30" fill="#f5f5f7" fillOpacity="0.14" />
                <circle cx={p.x} cy={p.y} r="13" fill="#f5f5f7" />
              </g>
            ))}

            {/* You. */}
            <circle cx="500" cy="500" r="26" fill="#0071e3" fillOpacity="0.25" />
            <circle cx="500" cy="500" r="11" fill="#0071e3" stroke="#ffffff" strokeWidth="4" />
          </svg>
        </div>
      </div>

      {/* The plan the map turns into. */}
      <div className="pointer-events-none absolute inset-x-0 top-[12svh] mx-auto w-full max-w-md px-gutter group-data-[step=3]/scene:pointer-events-auto sm:top-[16svh]">
        <ol className="flex flex-col gap-2">
          {SAMPLE_WEEKEND.map((row, i) => (
            <li
              key={row.when}
              style={{
                ...t(ramp(0.76 + i * 0.03, 0.84 + i * 0.03)),
                opacity: "var(--t)",
                translate: "0 calc((1 - var(--t)) * 40px)",
              }}
              className="flex items-center justify-between gap-3 rounded-3xl bg-card p-4"
            >
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground tabular-nums">
                  {row.when} · {row.kind}
                </span>
                <span className="mt-1 block text-[17px] font-semibold">{row.what}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums">{row.price}</span>
            </li>
          ))}
        </ol>
        <div
          style={{ ...t(ramp(0.9, 0.96)), opacity: "var(--t)" }}
          className="mt-4 flex items-center justify-between gap-3"
        >
          <Badge variant="warning">Example</Badge>
          <Button asChild>
            <Link href="/onboarding/location">
              Plan mine
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      {/* Fade the map out under the captions so the type always reads. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[45svh] bg-linear-to-t from-background via-background/80 to-transparent"
      />

      {/* Captions sit low, where a thumb is not covering them. */}
      <div className="absolute inset-x-0 bottom-[9svh] mx-auto w-full max-w-5xl px-gutter">
        <div className="relative h-40 max-w-xl sm:h-48">
          <Caption show={window4(-1, -0.5, 0.2, 0.25)}>Start with where you are.</Caption>
          <Caption show={window4(0.25, 0.3, 0.45, 0.5)}>
            We look at everything on this weekend.
          </Caption>
          <Caption show={window4(0.5, 0.55, 0.69, 0.74)}>
            Then keep only what fits your group.
          </Caption>
          <Caption show={window4(0.76, 0.82, 2, 3)}>
            <span className="text-muted-foreground">And hand you</span> a plan for all 48 hours.
          </Caption>
        </div>
      </div>
    </ScrollScene>
  );
}

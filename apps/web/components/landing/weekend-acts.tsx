"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ramp, window4 } from "./scroll-math";
import { ScrollScene } from "./scroll-scene";

/**
 * One act per day. Each has a code-drawn "light" backdrop that always shows.
 * Set `video: true` once `public/footage/<id>.mp4` and `<id>.jpg` exist and
 * the clip plays on top of it (see `public/footage/README.md`).
 */
const ACTS = [
  {
    id: "friday",
    day: "Friday",
    time: "8:00 PM",
    line: "Somewhere with a band.",
    show: window4(-1, -0.5, 0.29, 0.37),
    video: false,
    // Night, with warm stage light and a little purple haze.
    light:
      "radial-gradient(90% 55% at 65% 30%, #b06a2a 0%, #4a2710 35%, transparent 72%), radial-gradient(70% 45% at 10% 55%, #3a2440 0%, transparent 70%), #050507",
  },
  {
    id: "saturday",
    day: "Saturday",
    time: "10:30 AM",
    line: "Somewhere with a view.",
    show: window4(0.29, 0.37, 0.62, 0.7),
    video: false,
    // Clear morning: pale sky over a far ridge line.
    light:
      "radial-gradient(90% 60% at 75% 8%, #cfe3f5 0%, #6f9cc4 35%, transparent 75%), linear-gradient(to bottom, #3b6a96 0%, #1b3550 55%, #0a141d 100%)",
  },
  {
    id: "sunday",
    day: "Sunday",
    time: "11:00 AM",
    line: "Somewhere with good coffee.",
    show: window4(0.62, 0.7, 2, 3),
    video: false,
    // Slow golden light through a window.
    light:
      "radial-gradient(100% 70% at 20% 10%, #f3d9a8 0%, #b98a4a 32%, transparent 72%), linear-gradient(to bottom, #5a4326 0%, #2a1f12 60%, #0c0906 100%)",
  },
] as const;

/**
 * The payoff scene: one full-screen act per day, crossfading as you scroll,
 * with a 48-hour bar filling across the top. Where an act has a clip, only
 * the one on screen plays, and nothing downloads until the scene is near.
 */
export function WeekendActs() {
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const state = useRef({ step: 0, near: false });

  const sync = useCallback(() => {
    videos.current.forEach((video, i) => {
      if (!video) return;
      if (state.current.near && i === state.current.step) {
        // Autoplay can be refused (low power mode). The poster stays up, which is fine.
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, []);

  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        state.current.near = Boolean(entry?.isIntersecting);
        sync();
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sync]);

  return (
    <div ref={rootRef}>
      <ScrollScene
        steps={3}
        className="h-[330svh]"
        aria-labelledby="weekend-acts"
        onStep={(step) => {
          state.current.step = step;
          sync();
        }}
      >
        <h2 id="weekend-acts" className="sr-only">
          What a planned weekend feels like
        </h2>

        {ACTS.map((act, i) => (
          <div key={act.id} style={{ opacity: act.show }} className="absolute inset-0">
            <div
              aria-hidden
              style={{ background: act.light, scale: "calc(1.02 + var(--p) * 0.1)" }}
              className="absolute inset-0"
            />
            {act.video && (
              <video
                ref={(el) => {
                  videos.current[i] = el;
                }}
                muted
                loop
                playsInline
                preload="none"
                poster={`/footage/${act.id}.jpg`}
                aria-hidden
                tabIndex={-1}
                style={{ scale: "calc(1.02 + var(--p) * 0.1)" }}
                className="absolute inset-0 size-full object-cover"
              >
                <source src={`/footage/${act.id}.mp4`} type="video/mp4" />
              </video>
            )}
            {/* Darken the bottom so the type always reads. */}
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-background/30" />
            <div className="absolute inset-x-0 bottom-[11svh] mx-auto w-full max-w-5xl px-gutter">
              <p className="text-sm font-semibold text-foreground/80 tabular-nums">
                {act.day} · {act.time}
              </p>
              <p className="mt-2 max-w-xl text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-7xl">
                {act.line}
              </p>
            </div>
          </div>
        ))}

        {/* The 48 hours, filling as you scroll. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-16 mx-auto w-full max-w-5xl px-gutter sm:top-20"
        >
          <div className="h-1 overflow-hidden rounded-full bg-foreground/20">
            <div
              style={{ scale: `${ramp(0, 1)} 1` }}
              className="h-full origin-left rounded-full bg-foreground"
            />
          </div>
          <div className="mt-2 grid grid-cols-3 text-xs font-semibold">
            {ACTS.map((act, i) => (
              <span
                key={act.id}
                className={cn(
                  "text-foreground/50 transition-colors duration-300",
                  i === 0 && "group-data-[step=0]/scene:text-foreground",
                  i === 1 && "text-center group-data-[step=1]/scene:text-foreground",
                  i === 2 && "text-right group-data-[step=2]/scene:text-foreground",
                )}
              >
                {act.day}
              </span>
            ))}
          </div>
        </div>
      </ScrollScene>
    </div>
  );
}

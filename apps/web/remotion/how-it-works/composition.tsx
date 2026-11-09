import { AbsoluteFill, Sequence } from "remotion";
import { SCENE_FRAMES } from "./constants";
import { CrewScene } from "./crew-scene";
import { PicksScene } from "./picks-scene";
import { color } from "./shared";
import { WeekendScene } from "./weekend-scene";

/**
 * "How it works" in three scenes. On the landing page, scroll position
 * picks the frame, so scrolling down plays it and scrolling up rewinds it.
 */
export function HowItWorksComposition() {
  return (
    <AbsoluteFill style={{ backgroundColor: color.bg, color: color.fg, fontFamily: "inherit" }}>
      <Sequence name="Your crew" from={0} durationInFrames={SCENE_FRAMES} layout="absolute-fill">
        <CrewScene />
      </Sequence>
      <Sequence
        name="Your weekend"
        from={SCENE_FRAMES}
        durationInFrames={SCENE_FRAMES}
        layout="absolute-fill"
      >
        <WeekendScene />
      </Sequence>
      <Sequence name="Your picks" from={2 * SCENE_FRAMES} layout="absolute-fill">
        <PicksScene />
      </Sequence>
    </AbsoluteFill>
  );
}

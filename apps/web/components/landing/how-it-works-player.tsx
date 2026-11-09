"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useRef } from "react";
import { HowItWorksComposition } from "@/remotion/how-it-works/composition";
import { DURATION_IN_FRAMES, FPS, SIZE } from "@/remotion/how-it-works/constants";

/**
 * The Remotion Player, with no controls. The parent passes the frame to show
 * (from scroll position) and we seek to it. Loaded lazily so Remotion is not
 * in the landing page's first download.
 */
export default function HowItWorksPlayer({ frame }: { frame: number }) {
  const ref = useRef<PlayerRef>(null);

  useEffect(() => {
    ref.current?.seekTo(frame);
  }, [frame]);

  return (
    <Player
      ref={ref}
      component={HowItWorksComposition}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      compositionWidth={SIZE}
      compositionHeight={SIZE}
      initialFrame={frame}
      controls={false}
      clickToPlay={false}
      doubleClickToFullscreen={false}
      spaceKeyToPlayOrPause={false}
      acknowledgeRemotionLicense
      style={{ width: "100%", aspectRatio: "1 / 1" }}
    />
  );
}

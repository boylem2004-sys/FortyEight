import { BubbleWords } from "@/components/bubble-words";
import { HeroStart } from "@/components/landing/hero-start";
import { HowItWorksStatic } from "@/components/landing/how-it-works-static";
import { MapScene } from "@/components/landing/map-scene";
import { WeekendActs } from "@/components/landing/weekend-acts";
import { WeekendCompare } from "@/components/landing/weekend-compare";
import { WeekendCountdown } from "@/components/landing/weekend-countdown";

/**
 * The page tells one story on the way down: the hook and the first question,
 * the problem, how it works (map scene), what it feels like (footage scene),
 * then the first question again.
 */
export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <section className="grid animate-rise-in items-center gap-6 pb-16 text-center sm:pt-10 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-[1.25fr_1fr] lg:gap-12 lg:text-left">
        <WeekendCountdown className="lg:order-2" />
        <div className="flex flex-col items-center lg:items-start">
          <h1 className="text-5xl leading-[1.05] font-semibold tracking-[-0.015em] text-balance sm:text-7xl lg:text-[80px]">
            <BubbleWords text="48 hours. Make them count." />
          </h1>
          <p className="mt-4 max-w-xl text-[17px] leading-normal text-pretty text-muted-foreground sm:text-[21px]">
            Things to do near you that fit your group and your budget. A short list, not an endless
            feed.
          </p>
          <HeroStart className="mt-6" />
          <p className="mt-3 text-xs text-muted-foreground">
            No account needed. Takes about a minute.
          </p>
        </div>
      </section>

      <WeekendCompare />

      <div id="how" className="scroll-mt-11">
        <MapScene />
        <HowItWorksStatic />
      </div>

      <WeekendActs />

      <section
        aria-labelledby="cta"
        className="flex flex-col items-center py-24 text-center sm:py-32"
      >
        <h2
          id="cta"
          className="text-4xl font-semibold tracking-tight text-balance sm:text-[56px] sm:leading-[1.07]"
        >
          This weekend is still open.
        </h2>
        <p className="mt-4 max-w-md text-[17px] text-muted-foreground">
          Three questions now. A real plan before Friday.
        </p>
        <HeroStart className="mt-8" />
      </section>
    </div>
  );
}

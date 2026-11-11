import { BubbleWords } from "@/components/bubble-words";
import { HeroActions } from "@/components/hero-actions";
import { HowItWorksScroll, HowItWorksStatic } from "@/components/landing/how-it-works-scroll";
import { WeekendCompare } from "@/components/landing/weekend-compare";
import { Logo } from "@/components/logo";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex animate-rise-in flex-col items-center py-16 text-center sm:py-28">
        <Logo variant="hero" className="mb-10" />
        <h1 className="text-5xl leading-[1.05] font-semibold tracking-[-0.015em] text-balance sm:text-7xl md:text-[80px]">
          <BubbleWords text="48 hours. Make them count." />
        </h1>
        <p className="mt-6 max-w-xl text-[19px] leading-normal text-pretty text-muted-foreground sm:text-[21px]">
          FortyEight finds things to do near you that fit your group and your budget. A short list,
          not an endless feed.
        </p>
        <HeroActions secondary className="mt-10 w-full justify-center" />
        <p className="mt-5 text-xs text-muted-foreground">
          No account needed. Takes about a minute.
        </p>
      </section>

      <WeekendCompare />

      <div id="how" className="scroll-mt-16">
        <HowItWorksScroll />
        <HowItWorksStatic />
      </div>

      <section
        aria-labelledby="cta"
        className="rounded-card bg-card px-6 py-16 text-center sm:py-24"
      >
        <h2
          id="cta"
          className="text-4xl font-semibold tracking-tight text-balance sm:text-[56px] sm:leading-[1.07]"
        >
          Ready for this weekend?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[17px] text-muted-foreground">
          Three questions now. A real plan before Friday.
        </p>
        <HeroActions className="mt-8 justify-center" />
      </section>
    </div>
  );
}

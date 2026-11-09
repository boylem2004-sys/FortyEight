import { BubbleWords } from "@/components/bubble-words";
import { HeroActions } from "@/components/hero-actions";
import { HowItWorksScroll, HowItWorksStatic } from "@/components/landing/how-it-works-scroll";
import { Logo } from "@/components/logo";

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <section className="py-section text-center sm:py-20">
        <Logo variant="hero" className="mb-6" />
        <p className="mb-3 text-sm font-semibold tracking-wide text-accent-foreground uppercase">
          Your next 48 hours, sorted
        </p>
        <h1 className="text-4xl font-black tracking-tight text-balance sm:text-5xl">
          <BubbleWords text="What should we do this weekend?" />
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-muted-foreground">
          FortyEight finds things to do near you that fit your group and your budget. A short list,
          not an endless feed.
        </p>
        <HeroActions />
      </section>

      <HowItWorksScroll />
      <HowItWorksStatic />

      <section aria-labelledby="cta" className="py-section text-center">
        <h2 id="cta" className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          Ready for this weekend?
        </h2>
        <HeroActions />
      </section>
    </div>
  );
}

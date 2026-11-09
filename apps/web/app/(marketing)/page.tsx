import { CalendarDays, Sparkles, Users } from "lucide-react";
import { BubbleWords } from "@/components/bubble-words";
import { HeroActions } from "@/components/hero-actions";

const STEPS = [
  {
    icon: Users,
    title: "Tell us about your crew",
    body: "Where you are, what you're into, how many of you, and what you want to spend.",
  },
  {
    icon: CalendarDays,
    title: "Pick your weekend",
    body: "This Friday to Sunday by default, or any dates in the next two weeks.",
  },
  {
    icon: Sparkles,
    title: "Get 5 to 10 real picks",
    body: "Concerts, food, outdoors, and more, ranked for your group with a reason for each.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <section className="py-section text-center sm:py-20">
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

      <section aria-labelledby="how-it-works" className="pb-section">
        <h2 id="how-it-works" className="sr-only">
          How it works
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground">Step {i + 1}</span>
              </div>
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

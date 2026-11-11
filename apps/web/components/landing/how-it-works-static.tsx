import { CalendarDays, Sparkles, Users } from "lucide-react";

const STEPS = [
  {
    icon: Users,
    title: "Tell us about your crew",
    body: "Three quick questions: where you are, what sounds good, and who's in.",
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

/** "How it works" without motion, for people who turn on "reduce motion". */
export function HowItWorksStatic() {
  return (
    <section
      aria-labelledby="how-it-works-static"
      className="hidden py-section motion-reduce:block"
    >
      <h2
        id="how-it-works-static"
        className="mb-6 text-4xl font-semibold tracking-tight sm:text-5xl"
      >
        How it works
      </h2>
      <ol className="grid gap-4 sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="rounded-card bg-card p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground">
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
  );
}

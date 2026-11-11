import { Badge } from "@/components/ui/badge";
import { Reveal, RevealItem } from "./reveal";
import { SAMPLE_WEEKEND as COULD } from "./sample-weekend";

const NOW = [
  { when: "Fri 6:30 PM", what: "“What do you want to do?” “I don’t know, you pick.”" },
  { when: "Fri 9:00 PM", what: "Still scrolling. Nobody picked." },
  { when: "Sat 2:00 PM", what: "Same bar as last week." },
  { when: "Sun 7:00 PM", what: "“We should have done something.”" },
] as const;

function Stat({ value, label, className }: { value: string; label: string; className?: string }) {
  return (
    <div>
      <dd className={`text-5xl leading-none font-semibold tracking-tight ${className ?? ""}`}>
        {value}
      </dd>
      <dt className="mt-2 text-sm text-muted-foreground">{label}</dt>
    </div>
  );
}

/**
 * The before and after: a gray, stuck weekend next to a planned one.
 * The planned side is an example, and says so.
 */
export function WeekendCompare() {
  return (
    <section aria-labelledby="compare" className="rounded-card bg-card p-4 sm:p-6">
      <h2
        id="compare"
        className="px-2 pt-6 pb-8 text-4xl font-semibold tracking-tight text-balance sm:px-4 sm:text-[56px] sm:leading-[1.07]"
      >
        Same 48 hours. <span className="text-muted-foreground">Very different weekend.</span>
      </h2>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Now: flat and gray on purpose. */}
        <article
          aria-labelledby="compare-now"
          className="flex flex-col rounded-card bg-background p-6 text-muted-foreground sm:p-8"
        >
          <h3 id="compare-now" className="text-[28px] leading-tight font-semibold">
            What your weekends look like now
          </h3>
          <ol className="mt-8 flex flex-1 flex-col gap-5">
            {NOW.map((row) => (
              <li key={row.when} className="grid grid-cols-[6.5rem_1fr] gap-3 text-[17px]">
                <span className="text-sm leading-[1.6] text-input tabular-nums">{row.when}</span>
                <span>{row.what}</span>
              </li>
            ))}
          </ol>
          <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-border pt-6">
            <Stat value="0" label="plans made" />
            <Stat value="2 hrs" label="spent deciding" />
          </dl>
        </article>

        {/* Could be: bright type, staggered entrance, color only on the numbers. */}
        <article
          aria-labelledby="compare-could"
          className="relative isolate flex flex-col overflow-hidden rounded-card bg-background p-6 sm:p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[30rem] -translate-x-1/2 rounded-full bg-foreground/[0.09] blur-3xl"
          />
          <div className="flex items-start justify-between gap-3">
            <h3 id="compare-could" className="text-[28px] leading-tight font-semibold">
              What they could look like
            </h3>
            <Badge variant="warning" className="mt-1.5">
              Example
            </Badge>
          </div>
          <Reveal className="mt-8 flex flex-1 flex-col">
            <ol className="flex flex-1 flex-col gap-2">
              {COULD.map((row, i) => (
                <li key={row.when}>
                  <RevealItem
                    index={i}
                    className="flex items-center justify-between gap-3 rounded-3xl bg-card p-4"
                  >
                    <span className="min-w-0">
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {row.when} · {row.kind}
                      </span>
                      <span className="mt-1 block text-[17px] font-semibold">{row.what}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">{row.price}</span>
                  </RevealItem>
                </li>
              ))}
            </ol>
            <RevealItem index={COULD.length}>
              <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6">
                <Stat value="4" label="plans made" className="text-success" />
                <Stat value="$47" label="per person, all weekend" className="text-success" />
              </dl>
            </RevealItem>
          </Reveal>
        </article>
      </div>

      <ul className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { value: "5 to 10", label: "picks per plan, ranked for your group" },
          { value: "3", label: "quick questions to get started" },
          { value: "0", label: "endless feeds to scroll" },
        ].map((tile) => (
          <li key={tile.label} className="rounded-card bg-background p-6">
            <p className="text-5xl leading-none font-semibold tracking-tight">{tile.value}</p>
            <p className="mt-3 text-sm text-muted-foreground">{tile.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

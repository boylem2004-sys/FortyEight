import { cn } from "@/lib/utils";

/**
 * Splits text into words that pop up on hover, with a soft "bubble" behind
 * each one. Pure CSS, no JavaScript.
 *
 * - Hover only applies on devices that can hover (Tailwind's `hover:` does
 *   this), so phones see plain text.
 * - People who turn on "reduce motion" get the bubble color without the movement.
 * - Screen readers read the full sentence once, not word by word.
 */
export function BubbleWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <span
              className={cn(
                "group/word relative isolate inline-block cursor-default",
                "transition-[transform,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                "hover:-translate-y-1 hover:scale-[1.06] hover:text-accent-foreground",
                "motion-reduce:transition-colors motion-reduce:hover:transform-none",
              )}
            >
              <span
                className={cn(
                  "absolute -inset-x-1.5 -inset-y-0.5 -z-10 rounded-full bg-accent",
                  "scale-50 opacity-0 transition duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                  "group-hover/word:scale-100 group-hover/word:opacity-100",
                  "motion-reduce:scale-100",
                )}
              />
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </span>
  );
}

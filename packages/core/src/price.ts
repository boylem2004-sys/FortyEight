import { formatCents, formatPriceRange, groupPriceRange } from "./budget";
import type { Suggestion } from "./schemas/suggestion";

type Priced = Pick<Suggestion, "priceKnown" | "priceEstimated" | "priceMinCents" | "priceMaxCents">;

const hasPrice = (item: Priced) =>
  item.priceKnown && (item.priceMinCents !== null || item.priceMaxCents !== null);

/** True only when the item is free for certain, not just "from $0". */
export function isFree(item: Priced): boolean {
  return hasPrice(item) && (item.priceMinCents ?? 0) === 0 && (item.priceMaxCents ?? 0) === 0;
}

export interface PriceDescription {
  /** "Free", "$20-$45 per person", "About $15-$30 per person", "Price not listed". */
  perPerson: string;
  /** "$80-$180 for your group of 4", or null when it adds nothing. */
  group: string | null;
}

/** Card copy for an item's price, per person and for the whole group. */
export function describePrice(item: Priced, groupSize: number): PriceDescription {
  if (!hasPrice(item)) return { perPerson: "Price not listed", group: null };
  if (isFree(item)) return { perPerson: "Free", group: null };

  const min = item.priceMinCents ?? 0;
  const max = item.priceMaxCents ?? min;
  const groupOf = `for your group of ${groupSize}`;
  const total = groupSize > 1 ? groupPriceRange({ minCents: min, maxCents: max }, groupSize) : null;

  // Starts at $0 (cheap places, "free to $15" events): lead with the ceiling.
  if (min === 0) {
    const upTo = item.priceEstimated ? "Up to about" : "Up to";
    return {
      perPerson: `${upTo} ${formatCents(max)} per person`,
      group: total ? `${upTo} ${formatCents(total.maxCents ?? 0)} ${groupOf}` : null,
    };
  }

  const about = item.priceEstimated ? "About " : "";
  const perRange = formatPriceRange({ minCents: min, maxCents: max });
  const groupRange = total ? formatPriceRange(total) : null;
  return {
    perPerson: `${about}${perRange} per person`,
    group: groupRange ? `${about}${groupRange} ${groupOf}` : null,
  };
}

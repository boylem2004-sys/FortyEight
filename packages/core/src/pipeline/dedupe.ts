import { localDateOf } from "../dates";
import type { Source } from "../schemas/enums";
import type { Suggestion } from "../schemas/suggestion";

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "at",
  "of",
  "with",
  "live",
  "presents",
  "featuring",
  "feat",
]);

/** Lowercase word tokens without punctuation, stopwords, or 4-digit years. */
export function titleTokens(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t && !STOPWORDS.has(t) && !/^(19|20)\d\d$/.test(t)),
  );
}

/**
 * Overlap of title tokens, 0 to 1: shared words divided by the shorter title's
 * word count. Sources often pad titles ("Night Owls live at Union Hall" vs
 * "The Night Owls"), so containment works better than plain Jaccard here.
 */
export function titleSimilarity(a: string, b: string): number {
  const ta = titleTokens(a);
  const tb = titleTokens(b);
  if (ta.size === 0 || tb.size === 0) return ta.size === tb.size ? 1 : 0;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;
  return shared / Math.min(ta.size, tb.size);
}

const normalizeVenue = (venue: string | null) =>
  (venue ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

const SOURCE_PRIORITY: Record<Source, number> = { ticketmaster: 3, google_places: 2, ai_web: 1 };

/** Higher is better when two items are the same thing. */
function quality(item: Suggestion): number {
  return (item.verified ? 100 : 0) + (item.priceKnown ? 10 : 0) + SOURCE_PRIORITY[item.source];
}

export const DUPLICATE_TITLE_THRESHOLD = 0.6;

export function isDuplicate(a: Suggestion, b: Suggestion, timezone: string): boolean {
  if (normalizeVenue(a.venueName) !== normalizeVenue(b.venueName)) return false;
  const dayA = a.startsAt ? localDateOf(a.startsAt, timezone) : null;
  const dayB = b.startsAt ? localDateOf(b.startsAt, timezone) : null;
  if (dayA !== dayB) return false;
  return titleSimilarity(a.title, b.title) >= DUPLICATE_TITLE_THRESHOLD;
}

/**
 * Removes the same event listed by more than one source (same venue, same
 * local day, similar title). Keeps the best copy: verified, priced, then by
 * source priority. Order of first appearance is kept.
 */
export function dedupeSuggestions(items: Suggestion[], timezone: string): Suggestion[] {
  const kept: Suggestion[] = [];
  const seenIds = new Set<string>();
  for (const item of items) {
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    const dupIndex = kept.findIndex((k) => isDuplicate(k, item, timezone));
    if (dupIndex === -1) kept.push(item);
    else if (quality(item) > quality(kept[dupIndex]!)) kept[dupIndex] = item;
  }
  return kept;
}

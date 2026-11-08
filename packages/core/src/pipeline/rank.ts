import { budgetLabel, formatCents, type Budget } from "../budget";
import { eventTypesMatchingCategory, interestsMatchingCategory } from "../categories";
import { isFree } from "../price";
import { INTEREST_LABELS, type Category, type EventType, type Interest } from "../schemas/enums";
import type { Suggestion } from "../schemas/suggestion";

/** What the ranker knows about the group. */
export interface RankingProfile {
  interests: Interest[];
  interestsFreeform: string;
  eventTypes: EventType[];
  groupSize: number;
  budget: Budget;
  radiusMiles: number;
}

export interface Ranking {
  /** Must be the id of one of the candidates passed in. */
  id: string;
  fitScore: number;
  fitReason: string;
}

export interface RankerInput {
  candidates: Suggestion[];
  profile: RankingProfile;
  limit: number;
}

/**
 * Picks and explains the best candidates. Phase 1 adds a Claude ranker that
 * implements this same interface.
 */
export interface Ranker {
  rank(input: RankerInput): Promise<Ranking[]>;
}

/** How many candidates we hand to the ranker (keeps AI prompts small). */
export const MAX_RANKING_CANDIDATES = 40;
export const MIN_PLAN_ITEMS = 5;
export const MAX_PLAN_ITEMS = 10;

/* ------------------------------------------------------------------ */
/* Guardrail: the ranker may only return ids it was given.            */
/* ------------------------------------------------------------------ */

/**
 * Joins rankings back to candidates. Unknown ids (a model inventing an item)
 * and repeat ids are dropped. Result is sorted by fit score, best first.
 */
export function applyRanking(
  candidates: Suggestion[],
  rankings: Ranking[],
  limit = MAX_PLAN_ITEMS,
): Suggestion[] {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const used = new Set<string>();
  const out: Suggestion[] = [];
  for (const r of rankings) {
    const candidate = byId.get(r.id);
    if (!candidate || used.has(r.id)) continue;
    used.add(r.id);
    out.push({
      ...candidate,
      fitScore: clampScore(r.fitScore),
      fitReason: r.fitReason.trim() || null,
    });
  }
  return out.sort((a, b) => (b.fitScore ?? 0) - (a.fitScore ?? 0)).slice(0, limit);
}

const clampScore = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/* ------------------------------------------------------------------ */
/* Heuristic ranker (Phase 0, and the fallback if the AI call fails). */
/* ------------------------------------------------------------------ */

const GROUP_FRIENDLY: readonly Category[] = [
  "bar",
  "festival",
  "market",
  "outdoors",
  "sports",
  "attraction",
];

export function heuristicScore(item: Suggestion, profile: RankingProfile): number {
  let score = 35;
  if (eventTypesMatchingCategory(profile.eventTypes, item.category).length > 0) score += 25;
  score += Math.min(2, interestsMatchingCategory(profile.interests, item.category).length) * 10;
  if (item.distanceMiles !== null && profile.radiusMiles > 0) {
    score += 10 * Math.max(0, 1 - item.distanceMiles / profile.radiusMiles);
  }
  if (!item.priceKnown) score -= 5;
  else if (isFree(item)) score += 5;
  if (profile.groupSize >= 5 && GROUP_FRIENDLY.includes(item.category)) score += 5;
  if (!item.verified) score -= 5;
  return clampScore(score);
}

const joinWords = (words: string[]) =>
  words.length <= 1 ? (words[0] ?? "") : `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;

/** One or two plain sentences on why an item fits. */
export function heuristicReason(item: Suggestion, profile: RankingProfile): string {
  const interests = interestsMatchingCategory(profile.interests, item.category).map((i) =>
    INTEREST_LABELS[i].toLowerCase(),
  );
  const first =
    interests.length > 0
      ? `Lines up with your group's interest in ${joinWords(interests.slice(0, 2))}.`
      : eventTypesMatchingCategory(profile.eventTypes, item.category).length > 0
        ? "It's one of the event types your group likes."
        : "A wildcard pick that could mix up your weekend.";

  return `${first} ${priceSentence(item, profile)}`;
}

function priceSentence(item: Suggestion, profile: RankingProfile): string {
  if (!item.priceKnown || (item.priceMinCents === null && item.priceMaxCents === null)) {
    return "No price listed, so check before you go.";
  }
  if (isFree(item)) return profile.groupSize > 1 ? "Free for the whole group." : "It's free.";
  const min = item.priceMinCents ?? 0;
  const max = item.priceMaxCents ?? min;
  const amount =
    min > 0
      ? `${item.priceEstimated ? "About" : "From"} ${formatCents(min)}`
      : `${item.priceEstimated ? "Up to about" : "Up to"} ${formatCents(max)}`;
  return profile.budget.maxCents !== null
    ? `${amount} per person, inside your ${budgetLabel(profile.budget).toLowerCase()} budget.`
    : `${amount} per person.`;
}

export const heuristicRanker: Ranker = {
  async rank({ candidates, profile, limit }) {
    return candidates
      .map((c) => ({
        id: c.id,
        fitScore: heuristicScore(c, profile),
        fitReason: heuristicReason(c, profile),
      }))
      .sort((a, b) => b.fitScore - a.fitScore)
      .slice(0, limit);
  },
};

/**
 * Trims a long candidate list down before ranking. Prefers items in a liked
 * category, then closer items, so the ranker sees the most promising ones.
 */
export function selectCandidatesForRanking(
  candidates: Suggestion[],
  profile: RankingProfile,
  max = MAX_RANKING_CANDIDATES,
): Suggestion[] {
  if (candidates.length <= max) return candidates;
  const liked = (s: Suggestion) =>
    eventTypesMatchingCategory(profile.eventTypes, s.category).length > 0 ||
    interestsMatchingCategory(profile.interests, s.category).length > 0;
  return [...candidates]
    .sort((a, b) => {
      const likeDiff = Number(liked(b)) - Number(liked(a));
      if (likeDiff !== 0) return likeDiff;
      return (a.distanceMiles ?? Infinity) - (b.distanceMiles ?? Infinity);
    })
    .slice(0, max);
}

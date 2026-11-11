import { formatDateRange, formatEventTime } from "./dates";
import type { Plan } from "./schemas/plan";

/** How many picks go into a shared message. More than this reads like spam in a group chat. */
export const SHARE_MAX_ITEMS = 5;

/**
 * Plain text for the share sheet or clipboard: the top picks, numbered, with
 * when each one is. Plain text so it works in any chat app.
 */
export function planShareText(plan: Plan): string {
  const { dateRange, timezone } = plan.input;
  const lines = plan.items.slice(0, SHARE_MAX_ITEMS).map((item, i) => {
    const when = item.startsAt ? formatEventTime(item.startsAt, timezone) : "any time";
    return `${i + 1}. ${item.title} (${when})`;
  });
  const more = plan.items.length - lines.length;
  if (more > 0) lines.push(`...and ${more} more`);
  return [
    `Weekend plan near ${plan.location.label}, ${formatDateRange(dateRange)}:`,
    ...lines,
    "",
    "Which ones are you in for?",
  ].join("\n");
}

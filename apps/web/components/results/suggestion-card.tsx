import {
  CATEGORY_LABELS,
  describePrice,
  formatDistance,
  formatEventTime,
  type Suggestion,
} from "@fortyeight/core";
import { CalendarClock, ExternalLink, MapPin, Sparkles, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  item: Suggestion;
  rank: number;
  groupSize: number;
  timezone: string;
}

export function SuggestionCard({ item, rank, groupSize, timezone }: Props) {
  const when = item.startsAt ? formatEventTime(item.startsAt, timezone) : "Open all weekend";
  const distance = formatDistance(item.distanceMiles);
  const where = [item.venueName, distance].filter(Boolean).join(" · ");
  const price = describePrice(item, groupSize);
  const titleId = `item-${item.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  return (
    <Card className="flex h-full flex-col" aria-labelledby={titleId} role="article">
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-muted-foreground">
            <span className="sr-only">Pick </span>
            <span aria-hidden>#</span>
            {rank}
          </span>
          <Badge variant="accent">{CATEGORY_LABELS[item.category]}</Badge>
          {!item.verified && (
            <Badge variant="warning" title="Found by AI web research. Double check the details.">
              Unverified
            </Badge>
          )}
        </div>

        <h2 id={titleId} className="text-lg leading-snug font-semibold">
          {item.title}
        </h2>

        <ul className="flex flex-col gap-2 text-sm">
          <li className="flex gap-2">
            <CalendarClock aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span>{when}</span>
          </li>
          {where && (
            <li className="flex gap-2">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>{where}</span>
            </li>
          )}
          <li className="flex gap-2">
            <Ticket aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span>
              {price.perPerson}
              {price.group && <span className="block text-muted-foreground">{price.group}</span>}
            </span>
          </li>
        </ul>

        {item.fitReason && (
          <div className="rounded-lg bg-secondary/70 p-3 text-sm text-secondary-foreground">
            <p className="flex gap-2">
              <Sparkles aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>
                <span className="font-semibold">Why this fits: </span>
                {item.fitReason}
              </span>
            </p>
          </div>
        )}
      </div>

      {item.url && (
        <div className="p-5 pt-0">
          <Button asChild variant="outline" className="w-full">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              View details
              <ExternalLink aria-hidden />
              <span className="sr-only">for {item.title} (opens in a new tab)</span>
            </a>
          </Button>
        </div>
      )}
    </Card>
  );
}

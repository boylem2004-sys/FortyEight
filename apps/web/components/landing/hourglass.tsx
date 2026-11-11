import { cn } from "@/lib/utils";

const GLASS =
  "M44 34H156C156 96 109 118 109 150C109 182 156 204 156 266H44C44 204 91 182 91 150C91 118 44 96 44 34Z";

/**
 * The 48 hours as an object: sand in the top is weekend still left.
 * `elapsed` is 0 (full top) to 1 (all run out). `running` shows the falling stream.
 */
export function Hourglass({
  elapsed,
  running,
  className,
}: {
  elapsed: number;
  running: boolean;
  className?: string;
}) {
  const e = Math.min(1, Math.max(0, elapsed));
  // Sand surface in each bulb. Not true volume, but it reads right.
  const topSurface = 56 + e * 88;
  const pileTop = 266 - Math.max(0.06, e) * 92;

  return (
    <svg
      viewBox="0 0 200 300"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("overflow-visible", className)}
    >
      <defs>
        <clipPath id="hg-glass">
          <path d={GLASS} />
        </clipPath>
        <linearGradient id="hg-sand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0c896" />
          <stop offset="1" stopColor="var(--sand)" />
        </linearGradient>
        <radialGradient id="hg-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--sand)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--sand)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="150" rx="170" ry="170" fill="url(#hg-glow)" />

      <g clipPath="url(#hg-glass)">
        <rect x="0" y="0" width="200" height="300" fill="#ffffff" fillOpacity="0.04" />
        {/* Sand left in the top bulb. */}
        <rect
          x="0"
          y={topSurface}
          width="200"
          height={150 - topSurface}
          fill="url(#hg-sand)"
          className="transition-[y,height] duration-1000"
        />
        {/* The pile at the bottom, with a rounded top. */}
        <ellipse cx="100" cy={pileTop + 8} rx="70" ry="14" fill="url(#hg-sand)" />
        <rect x="0" y={pileTop + 8} width="200" height={266 - pileTop} fill="url(#hg-sand)" />
        {running && (
          <line
            x1="100"
            y1="146"
            x2="100"
            y2="262"
            stroke="var(--sand)"
            strokeWidth="2.5"
            strokeDasharray="5 7"
            className="animate-sand"
          />
        )}
      </g>

      <path d={GLASS} stroke="#f5f5f7" strokeOpacity="0.55" strokeWidth="2" />
      {/* A highlight down the left edge, so it reads as glass. */}
      <path
        d="M56 46C58 92 96 114 97 150"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="32" y="20" width="136" height="14" rx="7" fill="#f5f5f7" />
      <rect x="32" y="266" width="136" height="14" rx="7" fill="#f5f5f7" />
    </svg>
  );
}

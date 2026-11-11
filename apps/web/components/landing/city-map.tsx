/**
 * A stylized night map of a made-up city, drawn in code. Monochrome on
 * purpose: the only bright things on it are the dots the scene adds.
 */

const SIZE = 1000;

/** Small repeatable random, so the map is the same on server and client. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

const rand = seeded(48);
const BLOCKS = Array.from({ length: 90 }, () => {
  const col = Math.floor(rand() * 20);
  const row = Math.floor(rand() * 20);
  return {
    x: col * 50 + 6,
    y: row * 50 + 6,
    w: 38 - Math.floor(rand() * 14),
    h: 38 - Math.floor(rand() * 14),
    o: 0.25 + rand() * 0.5,
  };
});

/** Everything that is "on" this weekend. Dim until some are picked. */
export const CANDIDATES = Array.from({ length: 26 }, () => ({
  x: 140 + rand() * 720,
  y: 140 + rand() * 720,
}));

/** The four that make the plan, in the order you would do them. */
export const PICKS = [
  { x: 560, y: 410 },
  { x: 300, y: 300 },
  { x: 640, y: 640 },
  { x: 380, y: 600 },
] as const;

export const ROUTE = `M${PICKS.map((p) => `${p.x} ${p.y}`).join("L")}`;

export function CityStreets() {
  const lines = [];
  for (let i = 0; i <= 20; i++) {
    const major = i % 4 === 0;
    const pos = i * 50;
    lines.push(
      <path
        key={i}
        d={`M${pos} 0V${SIZE}M0 ${pos}H${SIZE}`}
        stroke={major ? "#48484d" : "#2a2a2d"}
        strokeWidth={major ? 3 : 1.25}
      />,
    );
  }
  return (
    <>
      {BLOCKS.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx="3"
          fill="#1d1d1f"
          opacity={b.o}
        />
      ))}
      {lines}
      {/* Park. */}
      <rect x="205" y="455" width="140" height="90" rx="14" fill="#101411" stroke="#26302a" />
      {/* River, with a bridge-wide gap in the grid under it. */}
      <path
        d="M-20 760C180 700 300 880 520 820S860 700 1020 800"
        stroke="#000000"
        strokeWidth="70"
        strokeLinecap="round"
      />
      <path
        d="M-20 760C180 700 300 880 520 820S860 700 1020 800"
        stroke="#0d1218"
        strokeWidth="56"
        strokeLinecap="round"
      />
      {/* One diagonal avenue, like every real city has. */}
      <path d="M60 940L940 60" stroke="#48484d" strokeWidth="4" />
    </>
  );
}

export const MAP_SIZE = SIZE;

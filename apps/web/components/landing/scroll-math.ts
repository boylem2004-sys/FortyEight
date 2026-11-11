/**
 * CSS value helpers for things inside a `ScrollScene`. They read the scene's
 * `--p` variable (0 to 1). Plain strings, so server components can use them.
 */

/**
 * CSS for "0 before `start`, rising to 1 at `end`" along the scene's scroll.
 * Use it as a value: `style={{ opacity: ramp(0.2, 0.3) }}`.
 */
export function ramp(start: number, end: number): string {
  return `clamp(0, calc((var(--p) - ${start}) / ${end - start}), 1)`;
}

/** Fades in over `[inStart, inEnd]`, then out over `[outStart, outEnd]`. */
export function window4(inStart: number, inEnd: number, outStart: number, outEnd: number): string {
  return `calc(${ramp(inStart, inEnd)} * (1 - ${ramp(outStart, outEnd)}))`;
}

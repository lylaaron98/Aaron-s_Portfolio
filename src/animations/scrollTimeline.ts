/**
 * Scroll timeline utilities.
 * Maps scroll progress (0–1) to animation values for use with useScrollProgress.
 */

/* ── Core interpolation ── */

/**
 * Linearly interpolates between two values based on scroll progress.
 * @param progress - scroll progress between 0 and 1
 * @param from     - start value
 * @param to       - end value
 */
export function lerp(progress: number, from: number, to: number): number {
  return from + (to - from) * clamp01(progress)
}

/**
 * Maps a scroll progress value within a specific scroll window to 0–1.
 * @param progress  - global scroll progress (0–1)
 * @param entryAt   - progress at which the animation starts
 * @param exitAt    - progress at which the animation ends
 */
export function windowProgress(
  progress: number,
  entryAt: number,
  exitAt: number
): number {
  if (progress <= entryAt) return 0
  if (progress >= exitAt) return 1
  return (progress - entryAt) / (exitAt - entryAt)
}

/* ── Easing ── */

/** Clamp a value to the 0–1 range. */
export function clamp01(v: number): number {
  return Math.min(Math.max(v, 0), 1)
}

/** Quadratic ease-out: fast start → slow finish. */
export function easeOutQuad(t: number): number {
  const c = clamp01(t)
  return c * (2 - c)
}

/** Cubic ease-in-out: smooth start & finish. */
export function easeInOutCubic(t: number): number {
  const c = clamp01(t)
  return c < 0.5 ? 4 * c * c * c : 1 - (-2 * c + 2) ** 3 / 2
}

/* ── Composite helpers ── */

/**
 * Computes a parallax offset for a given scroll progress.
 * Returns a value in the range [−speed … +speed] (pixels or any unit).
 *
 * @param progress - global scroll progress (0–1)
 * @param speed    - max parallax displacement (default 50)
 */
export function parallaxOffset(
  progress: number,
  speed = 50
): number {
  return lerp(progress, speed, -speed)
}

/**
 * Computes opacity for a fade-in-on-scroll effect bounded by a scroll window.
 */
export function scrollFadeIn(
  progress: number,
  entryAt: number,
  exitAt: number
): number {
  return easeOutQuad(windowProgress(progress, entryAt, exitAt))
}

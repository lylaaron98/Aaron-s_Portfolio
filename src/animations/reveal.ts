/**
 * Reveal animation configuration.
 * Applied via data-visible attribute toggled by useScrollReveal.
 *
 * Usage in CSS modules:
 *   .el { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
 *   .el[data-visible="true"] { opacity: 1; transform: translateY(0); }
 */

/* ── Shared constants ── */

export const REVEAL_THRESHOLD = 0.15

export const REVEAL_OFFSET_Y = 30 // px

export const REVEAL_TRANSITION = {
  duration: 0.7,
  ease: 'ease',
} as const

/* ── CSS string helpers ── */

/** Returns the standard reveal transition shorthand used across modules. */
export function revealTransitionCSS(): string {
  const { duration, ease } = REVEAL_TRANSITION
  return `opacity ${duration}s ${ease}, transform ${duration}s ${ease}`
}

/**
 * Generates a CSS transition-delay string for staggered reveals.
 * @param index - zero-based card index
 * @param step  - seconds between each item (default 0.1s)
 */
export function revealDelay(index: number, step = 0.1): string {
  return `${index * step}s`
}

/* ── Observer factory ── */

export interface RevealObserverOptions {
  /** Intersection threshold (0–1). Default: REVEAL_THRESHOLD */
  threshold?: number
  /** Once revealed, stop observing. Default: true */
  once?: boolean
}

/**
 * Creates an IntersectionObserver that sets `data-visible="true"` on
 * intersecting elements.  Use directly when `useScrollReveal` isn't suitable
 * (e.g. observing multiple elements from a single ref-less parent).
 */
export function createRevealObserver(
  opts: RevealObserverOptions = {}
): IntersectionObserver {
  const { threshold = REVEAL_THRESHOLD, once = true } = opts

  return new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          ;(entry.target as HTMLElement).dataset.visible = 'true'
          if (once) observer.unobserve(entry.target)
        }
      })
    },
    { threshold }
  )
}

/**
 * Imperatively reveals a single element by attaching an observer.
 * Returns a cleanup function.
 */
export function observeReveal(
  el: HTMLElement,
  opts?: RevealObserverOptions
): () => void {
  const observer = createRevealObserver(opts)
  observer.observe(el)
  return () => observer.unobserve(el)
}

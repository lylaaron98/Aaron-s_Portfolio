/**
 * Stagger animation utilities.
 * Produces inline style objects so elements within a grid animate in sequence,
 * and provides an imperative helper for non-React contexts.
 */

import type { CSSProperties } from 'react'

/* ── React helpers ── */

/**
 * Returns an inline style with transition-delay for the given index.
 * @param index - zero-based item index
 * @param step  - delay per item in seconds (default 0.1s)
 */
export function staggerStyle(
  index: number,
  step = 0.1
): CSSProperties {
  return { transitionDelay: `${index * step}s` }
}

/**
 * Generates an array of stagger styles for a list of items.
 */
export function staggerStyles(
  count: number,
  step = 0.1
): CSSProperties[] {
  return Array.from({ length: count }, (_, i) => staggerStyle(i, step))
}

/* ── Imperative DOM helper ── */

export interface StaggerOptions {
  /** Delay between each child in seconds. Default: 0.1 */
  step?: number
  /** CSS selector to filter children. Default: selects all direct children */
  selector?: string
}

/**
 * Imperatively applies staggered transition-delay to a list of DOM elements.
 *
 * @example
 *   // Inside a useEffect or vanilla JS:
 *   const cleanup = applyStaggerAnimation(gridRef.current!.children)
 *
 * @param elements - An iterable of HTMLElements (NodeList, HTMLCollection, or array)
 * @param opts     - Stagger configuration
 * @returns A cleanup function that removes the inline delays
 */
export function applyStaggerAnimation(
  elements: ArrayLike<Element> | Iterable<Element>,
  opts: StaggerOptions = {}
): () => void {
  const { step = 0.1 } = opts
  const els = Array.from(elements) as HTMLElement[]

  els.forEach((el, i) => {
    el.style.transitionDelay = `${i * step}s`
  })

  return () => {
    els.forEach((el) => {
      el.style.transitionDelay = ''
    })
  }
}

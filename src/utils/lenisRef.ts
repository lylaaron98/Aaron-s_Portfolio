import type Lenis from 'lenis'

/**
 * The page's Lenis instance, when smooth scrolling is on. Kept here so scroll
 * helpers can go through Lenis instead of fighting it with native scrolling.
 */
let instance: Lenis | null = null

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis
}

export const getLenis = () => instance

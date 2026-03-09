/**
 * Smoothly scrolls to a target element by id or CSS selector.
 * Falls back to native scrollIntoView if the element is found.
 * @param target - element id (without #) or a valid CSS selector
 */
export function smoothScrollTo(target: string): void {
  const selector = target.startsWith('#') ? target : `#${target}`
  const el = document.querySelector(selector)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

/**
 * Convenience alias — scrolls to a section by its id (without the # prefix).
 * @param id - the section element's id attribute
 */
export function scrollToSection(id: string): void {
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth' })
}

/**
 * Smoothly scrolls back to the top of the page.
 */
export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

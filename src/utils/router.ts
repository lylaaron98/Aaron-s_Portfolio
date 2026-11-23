import { useSyncExternalStore } from 'react'

/**
 * A minimal History API router. The site has two kinds of page, the home page
 * and /projects[/slug], so a routing library would be dead weight.
 */

const NAVIGATE_EVENT = 'app:navigate'

export function navigate(href: string, { replace = false } = {}) {
  if (replace) window.history.replaceState(null, '', href)
  else window.history.pushState(null, '', href)
  window.dispatchEvent(new Event(NAVIGATE_EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener('hashchange', onChange)
  window.addEventListener(NAVIGATE_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener('hashchange', onChange)
    window.removeEventListener(NAVIGATE_EVENT, onChange)
  }
}

const getSnapshot = () => window.location.pathname + window.location.hash

/** Re-renders on any navigation; returns the current pathname and hash. */
export function useLocation() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)
  const hashIndex = snapshot.indexOf('#')
  return {
    pathname: hashIndex === -1 ? snapshot : snapshot.slice(0, hashIndex),
    hash: hashIndex === -1 ? '' : snapshot.slice(hashIndex),
  }
}

/**
 * Turns same-origin link clicks that change the page into client-side
 * navigations. Plain in-page anchors (#about on the home page) are left to
 * the browser.
 */
export function interceptLinkClicks() {
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const anchor = (event.target as Element | null)?.closest?.('a')
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return

    const url = new URL(anchor.href, window.location.href)
    if (url.origin !== window.location.origin) return
    if (url.pathname === window.location.pathname) return

    event.preventDefault()
    navigate(url.pathname + url.search + url.hash)
  }

  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}

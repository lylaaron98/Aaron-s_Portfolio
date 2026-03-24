import { useEffect, useState } from 'react'

function getMatch(query: string) {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia(query).matches
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => getMatch(query))

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const updateMatch = () => setMatches(mediaQuery.matches)

    updateMatch()
    mediaQuery.addEventListener('change', updateMatch)

    return () => mediaQuery.removeEventListener('change', updateMatch)
  }, [query])

  return matches
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

function getLowPerformanceMatch() {
  if (typeof window === 'undefined') {
    return false
  }

  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: {
      saveData?: boolean
      addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void
      removeEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void
    }
  }

  const hasLowCpu = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4
  const hasLowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory > 0 && nav.deviceMemory <= 4
  const saveDataEnabled = nav.connection?.saveData === true

  return hasLowCpu || hasLowMemory || saveDataEnabled
}

export function useLowPerformanceMode() {
  const [isLowPerformance, setIsLowPerformance] = useState(() => getLowPerformanceMatch())

  useEffect(() => {
    const nav = navigator as Navigator & {
      connection?: {
        addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void
        removeEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void
      }
    }

    const update = () => setIsLowPerformance(getLowPerformanceMatch())

    update()
    nav.connection?.addEventListener?.('change', update)

    return () => nav.connection?.removeEventListener?.('change', update)
  }, [])

  return isLowPerformance
}

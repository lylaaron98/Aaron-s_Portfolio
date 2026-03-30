import { useSyncExternalStore } from 'react'

interface MediaQueryStore {
  getSnapshot: () => boolean
  subscribe: (listener: () => void) => () => void
}

const mediaQueryStores = new Map<string, MediaQueryStore>()

function createMediaQueryStore(query: string): MediaQueryStore {
  let mediaQueryList: MediaQueryList | null = null
  const listeners = new Set<() => void>()

  const getMql = () => {
    if (typeof window === 'undefined') {
      return null
    }

    mediaQueryList ??= window.matchMedia(query)
    return mediaQueryList
  }

  const notify = () => {
    listeners.forEach((listener) => listener())
  }

  const subscribe = (listener: () => void) => {
    const mql = getMql()
    listeners.add(listener)

    if (!mql) {
      return () => listeners.delete(listener)
    }

    const handler = () => notify()
    mql.addEventListener('change', handler)

    return () => {
      listeners.delete(listener)
      mql.removeEventListener('change', handler)
    }
  }

  return {
    getSnapshot: () => getMql()?.matches ?? false,
    subscribe,
  }
}

function getMediaQueryStore(query: string) {
  const cached = mediaQueryStores.get(query)
  if (cached) return cached

  const store = createMediaQueryStore(query)
  mediaQueryStores.set(query, store)
  return store
}

export function useMediaQuery(query: string) {
  const store = getMediaQueryStore(query)

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => false,
  )
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

interface PerformanceStore {
  getSnapshot: () => boolean
  subscribe: (listener: () => void) => () => void
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

const performanceStore: PerformanceStore = (() => {
  const listeners = new Set<() => void>()
  let subscribed = false
  let cleanup: (() => void) | null = null

  const notify = () => {
    listeners.forEach((listener) => listener())
  }

  const ensureSubscription = () => {
    if (subscribed || typeof window === 'undefined') return

    const nav = navigator as Navigator & {
      connection?: {
        addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void
        removeEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void
      }
    }

    const handler = () => notify()
    nav.connection?.addEventListener?.('change', handler)
    cleanup = () => nav.connection?.removeEventListener?.('change', handler)
    subscribed = true
  }

  return {
    getSnapshot: () => getLowPerformanceMatch(),
    subscribe: (listener: () => void) => {
      ensureSubscription()
      listeners.add(listener)

      return () => {
        listeners.delete(listener)

        if (!listeners.size && cleanup) {
          cleanup()
          cleanup = null
          subscribed = false
        }
      }
    },
  }
})()

export function useLowPerformanceMode() {
  return useSyncExternalStore(
    performanceStore.subscribe,
    performanceStore.getSnapshot,
    () => false,
  )
}

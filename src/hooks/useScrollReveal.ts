import { useEffect, useRef } from 'react'
import { REVEAL_THRESHOLD } from '../animations/reveal'

export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = 'true'
          observer.unobserve(el)
        }
      },
      { threshold: REVEAL_THRESHOLD }
    )

    observer.observe(el)
    return () => observer.unobserve(el)
  }, [])

  return ref
}

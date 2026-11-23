import { useEffect, useRef } from 'react'

/**
 * Slides an element up into place when it enters the viewport.
 *
 * Opacity is deliberately left alone: content stays visible before it is
 * revealed, so crawlers, print, full-page captures and anyone who never
 * scrolls still see it. Only the offset animates.
 */
export function useGsapReveal<T extends HTMLElement>(
  options: { y?: number; duration?: number; delay?: number; scale?: number } = {}
) {
  const ref = useRef<T>(null)
  const { y = 28, duration = 0.9, delay = 0, scale = 0.985 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }

        observer.disconnect()
        const { default: gsap } = await import('gsap')

        if (!ref.current) {
          return
        }

        gsap.to(ref.current, {
          y: 0,
          scale: 1,
          duration,
          delay,
          ease: 'power3.out',
          clearProps: 'transform',
        })
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0,
      },
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [y, duration, delay, scale])

  return ref
}

/**
 * Reveals child elements with staggered smooth animation when the container enters the viewport.
 */
export function useGsapStaggerReveal<T extends HTMLElement>(
  childSelector: string,
  options: { y?: number; duration?: number; stagger?: number; scale?: number } = {}
) {
  const ref = useRef<T>(null)
  const { y = 24, duration = 0.7, stagger = 0.08, scale = 0.98 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const children = el.querySelectorAll(childSelector)
    if (!children.length) return

    children.forEach((child) => {
      const node = child as HTMLElement
      node.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`
    })

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }

        observer.disconnect()
        const { default: gsap } = await import('gsap')

        gsap.to(children, {
          y: 0,
          scale: 1,
          duration,
          stagger,
          ease: 'power3.out',
          clearProps: 'transform',
        })
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0,
      },
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [childSelector, y, duration, stagger, scale])

  return ref
}

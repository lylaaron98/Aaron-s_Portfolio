import { useEffect, useRef } from 'react'

/**
 * Reveals an element with a smooth fade-up + scale animation when it enters the viewport.
 */
export function useGsapReveal<T extends HTMLElement>(
  options: { y?: number; duration?: number; delay?: number; scale?: number } = {}
) {
  const ref = useRef<T>(null)
  const { y = 60, duration = 1, delay = 0, scale = 0.97 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.style.opacity = '0'
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
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          delay,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
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
  const { y = 50, duration = 0.8, stagger = 0.12, scale = 0.95 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const children = el.querySelectorAll(childSelector)
    if (!children.length) return

    children.forEach((child) => {
      const node = child as HTMLElement
      node.style.opacity = '0'
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
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          stagger,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
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

/**
 * Animates the section title when it scrolls into view.
 * Attach to the <h2> element rendered by SectionContainer.
 */
export function useGsapTitleReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Find the section title inside this section
    const title = el.querySelector('h2')
    if (!title) return

    const titleElement = title as HTMLElement
    titleElement.style.opacity = '0'
    titleElement.style.transform = 'translate3d(0, 30px, 0)'
    titleElement.style.clipPath = 'inset(0 100% 0 0)'

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }

        observer.disconnect()
        const { default: gsap } = await import('gsap')

        gsap.to(titleElement, {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0 0% 0 0)',
          duration: 1,
          ease: 'power3.out',
          clearProps: 'transform,opacity,clipPath',
        })
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0,
      },
    )

    observer.observe(titleElement)

    return () => observer.disconnect()
  }, [])

  return ref
}

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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

    gsap.set(el, { opacity: 0, y, scale })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          delay,
          ease: 'power3.out',
        })
      },
    })

    return () => trigger.kill()
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

    gsap.set(children, { opacity: 0, y, scale })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(children, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          stagger,
          ease: 'power3.out',
        })
      },
    })

    return () => trigger.kill()
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

    gsap.set(title, { opacity: 0, y: 30, clipPath: 'inset(0 100% 0 0)' })

    const trigger = ScrollTrigger.create({
      trigger: title,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(title, {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0 0% 0 0)',
          duration: 1,
          ease: 'power3.out',
        })
      },
    })

    return () => trigger.kill()
  }, [])

  return ref
}

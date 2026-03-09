import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Reveals an element with a fade-up animation when it enters the viewport.
 * Replaces the old IntersectionObserver-based useScrollReveal.
 */
export function useGsapReveal<T extends HTMLElement>(
  options: { y?: number; duration?: number; delay?: number } = {}
) {
  const ref = useRef<T>(null)
  const { y = 40, duration = 0.8, delay = 0 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    gsap.set(el, { opacity: 0, y })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: 'power2.out',
        })
      },
    })

    return () => trigger.kill()
  }, [y, duration, delay])

  return ref
}

/**
 * Reveals child elements with staggered animation when the container enters the viewport.
 * Pass a CSS selector to target specific children.
 */
export function useGsapStaggerReveal<T extends HTMLElement>(
  childSelector: string,
  options: { y?: number; duration?: number; stagger?: number } = {}
) {
  const ref = useRef<T>(null)
  const { y = 40, duration = 0.6, stagger = 0.1 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const children = el.querySelectorAll(childSelector)
    if (!children.length) return

    gsap.set(children, { opacity: 0, y })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(children, {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: 'power2.out',
        })
      },
    })

    return () => trigger.kill()
  }, [childSelector, y, duration, stagger])

  return ref
}

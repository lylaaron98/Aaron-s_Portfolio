import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import './lenis.css'
import { useLowPerformanceMode, usePrefersReducedMotion } from '../../hooks/useMediaQuery'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

/** Media query that every scroll animation is registered under. */
export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

/**
 * The single gate for heavy effects. Reduced motion turns off every scripted
 * animation; a low-power device keeps the scroll animation but loses WebGL.
 */
export function useMotionBudget() {
  const reduced = usePrefersReducedMotion()
  const lowPower = useLowPerformanceMode()
  return { reduced, allow3d: !reduced && !lowPower && hasWebGL() }
}

let webglSupport: boolean | null = null
function hasWebGL() {
  if (webglSupport !== null) return webglSupport
  try {
    const canvas = document.createElement('canvas')
    webglSupport = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    webglSupport = false
  }
  return webglSupport
}

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * read the same frame. Skipped entirely under reduced motion.
 */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [enabled])
}

/** Loads a Google font family once, for a concept's display face. */
export function useDisplayFont(href: string) {
  const [, setReady] = useState(false)
  useEffect(() => {
    if (document.querySelector(`link[href="${href}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => {
      setReady(true)
      ScrollTrigger.refresh()
    }
    document.head.appendChild(link)
  }, [href])
}

/**
 * Runs a render loop only while the element is on screen and the tab is
 * visible, so a WebGL scene costs nothing once scrolled past.
 */
export function runWhileVisible(el: Element, frame: (time: number) => void) {
  let raf = 0
  let onScreen = true
  const loop = (time: number) => {
    frame(time / 1000)
    raf = requestAnimationFrame(loop)
  }
  const sync = () => {
    cancelAnimationFrame(raf)
    if (onScreen && document.visibilityState === 'visible') raf = requestAnimationFrame(loop)
  }
  const observer = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting
    sync()
  })
  observer.observe(el)
  document.addEventListener('visibilitychange', sync)
  sync()
  return () => {
    cancelAnimationFrame(raf)
    observer.disconnect()
    document.removeEventListener('visibilitychange', sync)
  }
}

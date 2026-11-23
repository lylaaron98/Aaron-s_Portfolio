import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import './lenis.css'
import { useLowPerformanceMode, usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { setLenis } from '../utils/lenisRef'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

/** Media query every scroll animation is registered under. */
export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

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
 * The single gate for heavy effects. Reduced motion turns off every scripted
 * animation; a low-power device keeps scroll animation but loses WebGL.
 */
export function useMotionBudget() {
  const reduced = usePrefersReducedMotion()
  const lowPower = useLowPerformanceMode()
  return { reduced, allow3d: !reduced && !lowPower && hasWebGL() }
}

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * read the same frame. Off under reduced motion.
 */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, anchors: true })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    setLenis(lenis)
    return () => {
      setLenis(null)
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [enabled])
}

/** Renders only while the element is on screen and the tab is visible. */
function runWhileVisible(el: Element, frame: (time: number) => void) {
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

export interface SceneHandle {
  resize(): void
  render(time: number): void
  dispose(): void
}

/**
 * Lazily imports a WebGL scene, sizes it to its canvas and renders it only
 * while on screen. `onReady` fires after the first frame is drawn.
 */
export function useScene<T extends SceneHandle>(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  enabled: boolean,
  load: () => Promise<(canvas: HTMLCanvasElement) => T>,
  onReady?: (scene: T) => void | (() => void),
) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!enabled || !canvas) return
    let cancelled = false
    let cleanup: (() => void) | undefined

    load().then((create) => {
      if (cancelled) return
      const scene = create(canvas)
      scene.resize()
      scene.render(0)
      const observer = new ResizeObserver(() => scene.resize())
      observer.observe(canvas)
      const stop = runWhileVisible(canvas, (t) => scene.render(t))
      const detach = onReady?.(scene)
      canvas.dataset.ready = 'true'
      cleanup = () => {
        detach?.()
        stop()
        observer.disconnect()
        scene.dispose()
      }
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
    // load/onReady are static for the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, canvasRef])
}

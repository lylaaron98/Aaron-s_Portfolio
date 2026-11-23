import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from './motion'
import { subscribe } from './loadProgress'
import styles from './Loader.module.css'

const MIN_VISIBLE_MS = 1300
const GIVE_UP_MS = 8000

/**
 * Full-screen intro: a 0–100 counter and bar driven by real load progress,
 * then a curtain lift into the hero. `onReveal` fires as the curtain starts
 * to lift, so the hero entrance overlaps it instead of waiting.
 */
export default function Loader({ reduced, onReveal, onDone }: { reduced: boolean; onReveal: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLDivElement>(null)

  // Hold the page still while the intro plays.
  useLayoutEffect(() => {
    const html = document.documentElement
    const previous = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    const started = performance.now()
    const shown = { value: 0 }
    let target = 0
    let exiting = false
    let tween: gsap.core.Tween | null = null

    const paint = () => {
      const value = Math.round(shown.value)
      if (count.current) count.current.textContent = String(value).padStart(3, '0')
      if (bar.current) bar.current.style.transform = `scaleX(${shown.value / 100})`
      root.current?.setAttribute('aria-valuenow', String(value))
    }

    const exit = () => {
      if (exiting) return
      exiting = true
      if (reduced) {
        onReveal()
        gsap.to(root.current, { opacity: 0, duration: 0.3, onComplete: onDone })
        return
      }
      gsap
        .timeline({ onComplete: onDone })
        .to(`.${styles.meta} > *, .${styles.countWrap}`, { yPercent: -110, opacity: 0, duration: 0.6, ease: 'power3.in', stagger: 0.04 })
        .to(bar.current, { scaleY: 0, transformOrigin: 'bottom', duration: 0.3 }, '<0.2')
        .add(onReveal, '-=0.1')
        .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut' }, '-=0.25')
    }

    const advance = () => {
      tween?.kill()
      const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - started))
      tween = gsap.to(shown, {
        value: target * 100,
        // The last stretch waits out the minimum time so the count reads.
        duration: reduced ? 0 : target >= 1 ? Math.max(0.5, remaining / 1000) : 0.8,
        ease: target >= 1 ? 'power2.inOut' : 'power2.out',
        onUpdate: paint,
        onComplete: () => {
          paint()
          if (target >= 1) exit()
        },
      })
    }

    const unsubscribe = subscribe((progress) => {
      // A tracker can report done before every task has registered; keep the
      // first frames from jumping straight to 100.
      target = Math.max(target, progress)
      advance()
    })

    const giveUp = window.setTimeout(() => {
      target = 1
      advance()
    }, GIVE_UP_MS)

    return () => {
      unsubscribe()
      window.clearTimeout(giveUp)
      tween?.kill()
    }
    // Runs once for the life of the intro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={root}
      className={styles.loader}
      role="progressbar"
      aria-label="Loading portfolio"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <div className={styles.meta} aria-hidden="true">
        <span>Aaron Lee</span>
        <span>Software Engineer — Portfolio ’26</span>
      </div>
      <div className={styles.ring} aria-hidden="true">
        <span />
        <span />
      </div>
      <div className={styles.bottom} aria-hidden="true">
        <div className={styles.countWrap}>
          <span ref={count} className={styles.count}>
            000
          </span>
          <span className={styles.percent}>%</span>
        </div>
        <p className={styles.hint}>Loading the experience</p>
      </div>
      <div className={styles.track} aria-hidden="true">
        <div ref={bar} className={styles.bar} />
      </div>
    </div>
  )
}

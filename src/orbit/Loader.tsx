import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from './motion'
import { subscribe } from './loadProgress'
import styles from './Loader.module.css'

const MIN_VISIBLE_MS = 1300
const GIVE_UP_MS = 8000
const RADIUS = 46
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Full-screen intro, centred: a ring that fills 0–100 with the count inside,
 * driven by real load progress, then a circular reveal into the hero. `onReveal` fires as the curtain starts
 * to lift, so the hero entrance overlaps it instead of waiting.
 */
export default function Loader({ reduced, onReveal, onDone }: { reduced: boolean; onReveal: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const arc = useRef<SVGCircleElement>(null)

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
      if (count.current) count.current.textContent = String(value)
      if (arc.current) arc.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - shown.value / 100))
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
      // The dial gathers in, then the screen opens as a circle from the centre.
      gsap
        .timeline({ onComplete: onDone })
        .to(`.${styles.center}`, { scale: 0.86, opacity: 0, duration: 0.55, ease: 'power3.in' })
        .add(onReveal, '-=0.15')
        .fromTo(
          root.current,
          { clipPath: 'circle(150% at 50% 50%)' },
          { clipPath: 'circle(0% at 50% 50%)', duration: 0.9, ease: 'expo.inOut' },
          '-=0.2',
        )
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
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.center} aria-hidden="true">
        <div className={styles.dial}>
          <svg className={styles.ring} viewBox="0 0 100 100">
            <defs>
              <linearGradient id="loader-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--brand-2)" />
                <stop offset="50%" stopColor="var(--brand)" />
                <stop offset="100%" stopColor="var(--brand-3)" />
              </linearGradient>
            </defs>
            <circle className={styles.ringTrack} cx="50" cy="50" r={RADIUS} />
            <circle
              ref={arc}
              className={styles.ringFill}
              cx="50"
              cy="50"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE}
            />
          </svg>
          <span className={styles.spin} />
          <div className={styles.countWrap}>
            <span ref={count} className={styles.count}>
              0
            </span>
            <span className={styles.percent}>%</span>
          </div>
        </div>
        <div className={styles.meta}>
          <span className={styles.name}>Aaron Lee</span>
          <span className={styles.hint}>Loading portfolio</span>
        </div>
      </div>
    </div>
  )
}

import { useLayoutEffect, useRef } from 'react'
import { gsap, MOTION_OK } from '../../../orbit/motion'
import styles from './Statement.module.css'

const STATEMENT =
  'I build interfaces people rely on: treasury systems for a bank, live bidding for a government agency, and citizen-facing services at GovTech. React and TypeScript up front, Python and AWS behind them, and applied AI where it earns its place.'

/** Orbit's statement band: the words light up one by one as you scroll. */
export default function Statement() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_OK, () => {
      gsap.fromTo(
        `.${styles.word}`,
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 75%', end: 'bottom 55%', scrub: true },
        },
      )
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={root} className={styles.statement} aria-label="In short">
      <p className={styles.text}>
        {STATEMENT.split(' ').map((word, i) => (
          <span key={i} className={styles.word}>
            {word}{' '}
          </span>
        ))}
      </p>
    </section>
  )
}

import { useLayoutEffect, useRef } from 'react'
import { gsap, MOTION_OK } from '../../../orbit/motion'
import styles from './Statement.module.css'

const STATEMENT =
  'I build software people rely on, from bank treasury systems to government services. React up front, Python and AWS behind, and AI where it helps.'

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

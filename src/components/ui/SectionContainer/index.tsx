import { useEffect, useRef, useState, type HTMLAttributes } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './SectionContainer.module.css'
import { cx } from '../../../utils/classNames'
import ShinyText from '../ShinyText'
import { BackgroundRippleEffect } from '../background-ripple-effect'
import { useMediaQuery, usePrefersReducedMotion } from '../../../hooks/useMediaQuery'

gsap.registerPlugin(ScrollTrigger)

interface SectionContainerProps extends HTMLAttributes<HTMLElement> {
  id?: string
  background?: 'navy' | 'navy-light'
  /** Section number shown before the title (e.g. "01") */
  number?: string
  /** Section heading text rendered beside the number */
  title?: string
}

export default function SectionContainer({
  id,
  background = 'navy',
  number,
  title,
  className,
  children,
  ...props
}: SectionContainerProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const titleWords = title?.split(/\s+/).filter(Boolean) ?? []
  const prefersReducedMotion = usePrefersReducedMotion()
  const isCompactViewport = useMediaQuery('(max-width: 900px)')
  const [backgroundActive, setBackgroundActive] = useState(false)
  const showRipple = !prefersReducedMotion && !isCompactViewport

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !showRipple) return

    const observer = new IntersectionObserver(
      ([entry]) => setBackgroundActive(entry.isIntersecting),
      {
        rootMargin: '20% 0px 20% 0px',
        threshold: 0,
      },
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [showRipple])

  useEffect(() => {
    const el = titleRef.current
    if (!el) return

    gsap.set(el, { opacity: 0, y: 30 })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
        })
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cx(
        styles.section,
        background === 'navy-light' ? styles.bgLight : styles.bgNavy,
        className
      )}
      {...props}
    >
      {showRipple && (
        <div className={styles.backgroundLayer} aria-hidden="true">
          <BackgroundRippleEffect
            className={styles.rippleBackground}
            rows={12}
            cols={20}
            cellSize={64}
            interactive={false}
            animate={backgroundActive}
            style={{
              ['--cell-border-color' as string]: 'var(--navy-lighter)',
              ['--cell-fill-color' as string]: 'var(--cyan-dim)',
              ['--cell-shadow-color' as string]: 'var(--cyan-glow)',
            }}
          />
        </div>
      )}
      <div className={cx('container', styles.content)}>
        {title && (
          <h2 ref={titleRef} className={styles.sectionTitle}>
            {number && <span className={styles.num}>{number}.</span>}
            <span className={styles.titleWords}>
              {titleWords.map((word, index) => (
                <ShinyText
                  key={`${word}-${index}`}
                  text={word}
                  className={styles.titleWord}
                />
              ))}
            </span>
            <span className={styles.line} />
          </h2>
        )}
        {children}
      </div>
    </section>
  )
}

import { useEffect, useRef, useState, type HTMLAttributes } from 'react'
import styles from './SectionContainer.module.css'
import { cx } from '../../../utils/classNames'
import ShinyText from '../ShinyText'
import { BackgroundRippleEffect } from '../background-ripple-effect'
import { useLowPerformanceMode, useMediaQuery, usePrefersReducedMotion } from '../../../hooks/useMediaQuery'

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
  const lowPerformanceMode = useLowPerformanceMode()
  const isCompactViewport = useMediaQuery('(max-width: 900px)')
  const [backgroundActive, setBackgroundActive] = useState(false)
  const showRipple = !prefersReducedMotion && !lowPerformanceMode && !isCompactViewport

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !showRipple) return


    const observer = new IntersectionObserver(
      ([entry]) => {
        setBackgroundActive(prev => {
          if (prev !== entry.isIntersecting) return entry.isIntersecting;
          return prev;
        });
      },
      {
        rootMargin: '20% 0px 20% 0px',
        threshold: 0,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [showRipple]);

  useEffect(() => {
    const el = titleRef.current
    if (!el) return

    el.style.opacity = '0'
    el.style.transform = 'translate3d(0, 30px, 0)'

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }

        observer.disconnect()
        const { default: gsap } = await import('gsap')

        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        })
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0,
      },
    )

    observer.observe(el)

    return () => observer.disconnect()
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
                  disabled={prefersReducedMotion || lowPerformanceMode}
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

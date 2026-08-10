import { lazy, Suspense, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import styles from './SectionContainer.module.css'
import { cx } from '../../../utils/classNames'
import { useLowPerformanceMode, useMediaQuery, usePrefersReducedMotion } from '../../../hooks/useMediaQuery'

// Only pulled in by sections that opt into the DOM ripple.
const BackgroundRippleEffect = lazy(() =>
  import('../background-ripple-effect').then((m) => ({ default: m.BackgroundRippleEffect })),
)

interface SectionContainerProps extends HTMLAttributes<HTMLElement> {
  id?: string
  background?: 'navy' | 'navy-light'
  /** Section index shown before the title, e.g. "02". */
  number?: string
  /** Section heading text. Rendered as a mono rule, not a display heading. */
  title?: string
  /** Right-aligned metadata in the header rule, e.g. "06 entries". */
  meta?: ReactNode
  /** Large display line under the header rule. */
  lede?: ReactNode
  /**
   * Mount the animated DOM ripple grid behind this section. Off by default:
   * every section used to mount one, which is 240 cells each and 1,200 in
   * total. The CSS lattice gives the same visual language for free.
   */
  ripple?: boolean
}

export default function SectionContainer({
  id,
  background = 'navy',
  number,
  title,
  meta,
  lede,
  ripple = false,
  className,
  children,
  ...props
}: SectionContainerProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const lowPerformanceMode = useLowPerformanceMode()
  const isCompactViewport = useMediaQuery('(max-width: 900px)')
  const [rippleActive, setRippleActive] = useState(false)
  const showRipple = ripple && !prefersReducedMotion && !lowPerformanceMode && !isCompactViewport

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !showRipple) return

    const observer = new IntersectionObserver(
      ([entry]) => setRippleActive((prev) => (prev === entry.isIntersecting ? prev : entry.isIntersecting)),
      { rootMargin: '20% 0px', threshold: 0 },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [showRipple])

  // Header reveal. Uses the Web Animations API rather than importing GSAP —
  // this is a single opacity/transform tween and did not justify a 70 kB
  // dependency being fetched on scroll.
  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    if (prefersReducedMotion) return

    el.style.opacity = '0'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        el.animate(
          [
            { opacity: 0, transform: 'translate3d(0, 18px, 0)' },
            { opacity: 1, transform: 'translate3d(0, 0, 0)' },
          ],
          { duration: 620, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'none' },
        )
        el.style.opacity = ''
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [prefersReducedMotion])

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cx(
        styles.section,
        background === 'navy-light' ? styles.bgLight : styles.bgNavy,
        className,
      )}
      {...props}
    >
      <div className={styles.lattice} aria-hidden="true" />

      {showRipple && (
        <div className={styles.backgroundLayer} aria-hidden="true">
          <Suspense fallback={null}>
            <BackgroundRippleEffect
              className={styles.rippleBackground}
              rows={12}
              cols={20}
              cellSize={64}
              interactive={false}
              animate={rippleActive}
              style={{
                ['--cell-border-color' as string]: 'var(--line)',
                ['--cell-fill-color' as string]: 'var(--brand-dim)',
                ['--cell-shadow-color' as string]: 'var(--brand-glow)',
              }}
            />
          </Suspense>
        </div>
      )}

      <div className={cx('container', styles.content)}>
        {title && (
          <div ref={headerRef} className={styles.header}>
            {number && <span className={styles.index}>[{number}]</span>}
            <h2 className={styles.title}>{title}</h2>
            <span className={styles.rule} aria-hidden="true" />
            {meta && <span className={styles.meta}>{meta}</span>}
          </div>
        )}
        {lede && <p className={styles.lede}>{lede}</p>}
        {children}
      </div>
    </section>
  )
}

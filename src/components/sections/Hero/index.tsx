import { lazy, Suspense, useEffect, useMemo, useState, type CSSProperties } from 'react'
import styles from './Hero.module.css'
import Button from '../../ui/Button'
import { scrollToSection } from '../../../utils/smoothScroll'
import { useTheme } from '../../../context/ThemeContext'
import {
  useLowPerformanceMode,
  useMediaQuery,
  usePrefersReducedMotion,
} from '../../../hooks/useMediaQuery'

const Silk = lazy(() => import('../../ui/Silk/Silk'))

const ROLES = ['Full Stack Developer', 'AI Engineer', 'Frontend Engineer'] as const

const STATS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '2+', label: 'Years shipping' },
  { value: '6', label: 'Production systems' },
  { value: '3', label: 'Industries' },
]

/** Stagger helper — feeds the CSS entrance its per-element delay. */
const delay = (ms: number) => ({ ['--d' as string]: `${ms}ms` }) as CSSProperties

/**
 * The typewriter ticks state every 40–80ms. Keeping that state in its own leaf
 * component stops each tick from re-rendering the whole Hero subtree (and with
 * it the WebGL background and every social icon).
 */
function RoleTypewriter({ disableMotion }: { disableMotion: boolean }) {
  const [roleIndex, setRoleIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const current = ROLES[roleIndex]

  useEffect(() => {
    if (disableMotion) return

    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex((c) => c + 1), 78)
    } else if (!isDeleting && charIndex === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1900)
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((c) => c - 1), 42)
    } else {
      timeout = setTimeout(() => {
        setIsDeleting(false)
        setRoleIndex((i) => (i + 1) % ROLES.length)
      }, 260)
    }

    return () => clearTimeout(timeout)
  }, [charIndex, current.length, disableMotion, isDeleting])

  return (
    <>
      {/* The animated text is decorative; screen readers get the stable label. */}
      <span className={styles.typewriter} aria-hidden="true">
        {disableMotion ? ROLES[0] : current.slice(0, charIndex)}
      </span>
      <span className={styles.cursor} aria-hidden="true">
        |
      </span>
      <span className="sr-only">{ROLES.join(', ')}</span>
    </>
  )
}

/**
 * Reads a colour token off the document so the shader participates in theming
 * instead of being a hardcoded dark rectangle. One getComputedStyle per theme
 * flip is free; the alternative is duplicating the palette in JS.
 */
function readToken(name: string, fallback: string) {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback
}

export default function Hero() {
  const { theme } = useTheme()
  const prefersReducedMotion = usePrefersReducedMotion()
  const lowPerformanceMode = useLowPerformanceMode()
  const isCompactViewport = useMediaQuery('(max-width: 900px)')
  const disableMotion = prefersReducedMotion || lowPerformanceMode
  const showSilk = !disableMotion && !isCompactViewport

  // Re-read on theme change. This is what finally makes light mode reach the
  // hero — previously the shader stayed dark and the hero read dark-on-light.
  const shader = useMemo(() => {
    void theme
    return {
      base: readToken('--shader-base', '#3a2fd6'),
      tint: readToken('--shader-tint', '#12b3a3'),
    }
  }, [theme])

  return (
    <section id="hero" className={styles.hero}>
      {showSilk ? (
        <div className={styles.shaderLayer} aria-hidden="true">
          <Suspense fallback={<div className={styles.staticBackdrop} />}>
            <Silk
              speed={3.2}
              scale={0.9}
              color={shader.base}
              colorB={shader.tint}
              noiseIntensity={0.08}
              rotation={1.25}
            />
          </Suspense>
        </div>
      ) : (
        <div className={styles.staticBackdrop} aria-hidden="true" />
      )}
      <div className={styles.blooms} aria-hidden="true" />
      <div className={styles.dots} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      <div className={styles.inner}>
        <p className={`${styles.pill} ${styles.reveal}`} style={delay(0)}>
          Singapore · Available for work
          <i className={styles.live} aria-hidden="true" />
        </p>

        <h1 className={`${styles.name} ${styles.reveal}`} style={delay(70)}>
          Aaron Lee
        </h1>

        <p className={`${styles.role} ${styles.reveal}`} style={delay(140)}>
          <RoleTypewriter disableMotion={disableMotion} />
        </p>

        <p className={`${styles.lede} ${styles.reveal}`} style={delay(210)}>
          Production experience across banking, government, sustainability and Japanese
          enterprise clients. I modernised mission-critical treasury systems at a{' '}
          <strong>Corporate Bank</strong> and built <strong>Stakeholders'&rsquo;s</strong> real-time land
          bidding platform. Now working independently on applied AI — computer vision and OCR
          pipelines, AR/VR prototypes, and full-stack products shipped end to end.
        </p>

        <div className={`${styles.actions} ${styles.reveal}`} style={delay(280)}>
          <Button variant="primary" size="lg" onClick={() => scrollToSection('contact')}>
            Get in touch
          </Button>
          <Button variant="secondary" size="lg" onClick={() => scrollToSection('projects')}>
            View my work
          </Button>
        </div>

        <div className={`${styles.stats} ${styles.reveal}`} style={delay(340)}>
          {STATS.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className={`${styles.socials} ${styles.reveal}`} style={delay(400)}>
          <a
            href="https://github.com/lylaaron98"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="19" height="19" aria-hidden="true">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
          <a
            href="https://linkedin.com/in/aaron-lee-b832431b3"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="19" height="19" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a href="mailto:lyl.aaron.98@gmail.com" aria-label="Email">
            <svg viewBox="0 0 24 24" fill="currentColor" width="19" height="19" aria-hidden="true">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
            </svg>
          </a>
        </div>
      </div>

      <div className={styles.scrollCue} aria-hidden="true">
        <span className={styles.scrollLine} />
        <span>scroll</span>
      </div>
    </section>
  )
}

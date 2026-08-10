import { useId } from 'react'
import styles from './Logo.module.css'
import { cx } from '../../../utils/classNames'

export type LogoVariant = 'glass' | 'solid' | 'bare' | 'ring'

interface LogoProps {
  /**
   * How the monogram is housed:
   *   'glass'  translucent tile, gradient A          (quiet, matches the nav pill)
   *   'solid'  gradient tile, A knocked out          (most presence at small size)
   *   'bare'   gradient A alone, no housing          (most minimal)
   *   'ring'   gradient A inside a hairline circle   (classic monogram)
   */
  variant?: LogoVariant
  className?: string
}

/* ── Geometry ──
   One A, shared by every variant and by public/favicon.svg, so the tab icon
   and the nav can never drift apart.

   The stance is wider than a typographic A and the bar sits below geometric
   centre — both are optical corrections for the fact that this is read at
   28px, where a faithfully-proportioned A collapses into a triangle. */
const LEGS = 'M8.2 24.4 L16 7.6 L23.8 24.4'
const BAR = 'M12 19.2 H20'
const STROKE = 2.6

export default function Logo({ variant = 'glass', className }: LogoProps) {
  // Two marks on one page would otherwise share gradient ids, and the second
  // would silently paint with the first one's stops.
  const uid = useId()
  const sweep = `${uid}-sweep`
  const edge = `${uid}-edge`
  const bloom = `${uid}-bloom`

  const tile = { x: 0.6, y: 0.6, width: 30.8, height: 30.8, rx: 9.2 }

  // On the gradient tile the letter is reversed out in the page colour, which
  // holds its contrast constant. Knocking it through to true transparency was
  // the first attempt and it failed: the navbar is translucent, so the A took
  // whatever the hero shader was doing behind it and went teal-on-teal.
  const ink = variant === 'solid' ? 'var(--bg)' : `url(#${sweep})`

  return (
    <svg
      className={cx(styles.mark, styles[variant], className)}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Aaron Lee"
    >
      <defs>
        <linearGradient id={sweep} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand-2)" />
          <stop offset="55%" stopColor="var(--brand)" />
          <stop offset="100%" stopColor="var(--brand-3)" />
        </linearGradient>

        {/* Catches light along the top-left edge only, the way the glass
            panels elsewhere on the page do. */}
        <linearGradient id={edge} x1="0" y1="0" x2="0.65" y2="1">
          <stop offset="0%" stopColor="var(--line-strong)" />
          <stop offset="100%" stopColor="var(--line)" />
        </linearGradient>

        <radialGradient id={bloom} cx="0.24" cy="0.14" r="0.92">
          <stop offset="0%" stopColor="var(--brand-2)" stopOpacity="0.34" />
          <stop offset="100%" stopColor="var(--brand-2)" stopOpacity="0" />
        </radialGradient>

      </defs>

      {variant === 'glass' && (
        <>
          <rect
            {...tile}
            fill="var(--surface-2)"
            stroke={`url(#${edge})`}
            strokeWidth="1.2"
          />
          <rect {...tile} className={styles.bloom} fill={`url(#${bloom})`} />
        </>
      )}

      {variant === 'ring' && (
        <circle
          cx="16"
          cy="16"
          r="14.6"
          fill="none"
          stroke={`url(#${sweep})`}
          strokeWidth="1.4"
          opacity="0.55"
        />
      )}

      {variant === 'solid' && <rect {...tile} fill={`url(#${sweep})`} />}

      {/* The ring needs the letter pulled in off the circle's edge; every other
          variant uses it at full size. */}
      <g transform={variant === 'ring' ? 'translate(16 16) scale(0.68) translate(-16 -16)' : undefined}>
        <path
          d={LEGS}
          fill="none"
          stroke={ink}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* On the gradient tile the bar matches the legs — it is already
            reversed out. Elsewhere it drops to flat --brand, because at 28px a
            three-stop gradient across a 2.6px bar turns to mud and the letter
            stops reading as an A. */}
        <path
          d={BAR}
          fill="none"
          stroke={variant === 'solid' ? ink : 'var(--brand)'}
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

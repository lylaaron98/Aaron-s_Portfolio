import { useCallback, useRef, type HTMLAttributes } from 'react'
import styles from './Card.module.css'
import { cx } from '../../../utils/classNames'
import { useMediaQuery, usePrefersReducedMotion } from '../../../hooks/useMediaQuery'
import { useTilt, type TiltFrame } from '../../../hooks/useTilt'

type CardVariant = 'default' | 'navy'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Enable hover lift + glow effect (default: true) */
  hoverable?: boolean
  /** Background variant: 'default' = surface, 'navy' = recessed */
  variant?: CardVariant
  /** Show a gradient overlay on hover */
  gradientOverlay?: boolean
  /** Show a top-edge gradient line on hover */
  topAccent?: boolean
  /** Enable 3D tilt on hover (default: false) */
  tilt?: boolean
}

export default function Card({
  hoverable = true,
  variant = 'default',
  gradientOverlay = false,
  topAccent = false,
  tilt = false,
  className,
  children,
  ...props
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLSpanElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasFinePointer = useMediaQuery('(pointer: fine)')
  const isDesktop = useMediaQuery('(min-width: 901px)')
  const enableTilt = tilt && hasFinePointer && isDesktop && !prefersReducedMotion

  // Rounded to whole percent so the gradient string only changes when the
  // rendered result actually would.
  const lastGlare = useRef({ x: -1, y: -1 })

  const handleFrame = useCallback(({ ratioX, ratioY, hovering }: TiltFrame) => {
    const glare = glareRef.current
    if (!glare || !hovering) return

    const x = Math.round(ratioX * 100)
    const y = Math.round(ratioY * 100)
    if (x === lastGlare.current.x && y === lastGlare.current.y) return
    lastGlare.current = { x, y }

    glare.style.background = `radial-gradient(circle at ${x}% ${y}%, color-mix(in srgb, var(--brand) 24%, transparent) 0%, transparent 62%)`
  }, [])

  const handleHoverChange = useCallback((hovering: boolean) => {
    glareRef.current?.classList.toggle(styles.glareVisible, hovering)
  }, [])

  useTilt(ref, {
    enabled: enableTilt,
    maxDeg: 8,
    onFrame: handleFrame,
    onHoverChange: handleHoverChange,
  })

  return (
    <div
      ref={ref}
      className={cx(
        styles.card,
        hoverable && styles.hoverable,
        variant === 'navy' && styles.navy,
        gradientOverlay && styles.gradientOverlay,
        topAccent && styles.topAccent,
        className,
      )}
      // Deliberately kept on the tilted cards only, and only while tilt is
      // actually enabled. Removing it un-promotes the layer and flips text from
      // grayscale to subpixel antialiasing — a visible rendering change, not a
      // free win. See claude/performance-notes.md.
      style={enableTilt ? { willChange: 'transform' } : undefined}
      {...props}
    >
      {enableTilt && <span ref={glareRef} className={styles.glare} aria-hidden="true" />}
      {children}
    </div>
  )
}

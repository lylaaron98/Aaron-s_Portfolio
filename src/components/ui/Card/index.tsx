import { useRef, useEffect, type HTMLAttributes } from 'react'
import styles from './Card.module.css'
import { cx } from '../../../utils/classNames'
import { useMediaQuery, usePrefersReducedMotion } from '../../../hooks/useMediaQuery'

type CardVariant = 'default' | 'navy'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Enable hover lift + glow effect (default: true) */
  hoverable?: boolean
  /** Background variant: 'default' = navy-light, 'navy' = navy */
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
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasFinePointer = useMediaQuery('(pointer: fine)')
  const isDesktop = useMediaQuery('(min-width: 901px)')
  const enableTilt = tilt && hasFinePointer && isDesktop && !prefersReducedMotion

  useEffect(() => {
    const el = ref.current
    if (!el || !enableTilt) return

    el.style.transformStyle = 'preserve-3d'
    el.style.willChange = 'transform'

    const glareEl = document.createElement('div')
    glareEl.style.cssText = `
      position: absolute; inset: 0; pointer-events: none;
      border-radius: inherit; z-index: 10;
      opacity: 0; transition: opacity 0.3s ease;
    `
    el.appendChild(glareEl)
    let frameId: number | null = null
    let isHovering = false
    let currentRotateX = 0
    let currentRotateY = 0
    let targetRotateX = 0
    let targetRotateY = 0

    const stopAnimation = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
        frameId = null
      }
    }

    const render = () => {
      currentRotateX += (targetRotateX - currentRotateX) * 0.18
      currentRotateY += (targetRotateY - currentRotateY) * 0.18

      el.style.transform = `perspective(1000px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`

      const stillAnimating =
        Math.abs(targetRotateX - currentRotateX) > 0.05 ||
        Math.abs(targetRotateY - currentRotateY) > 0.05

      if (isHovering || stillAnimating) {
        frameId = window.requestAnimationFrame(render)
        return
      }

      frameId = null
    }

    const startAnimation = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(render)
      }
    }

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      isHovering = true
      targetRotateX = (0.5 - y) * 8
      targetRotateY = (x - 0.5) * 8

      glareEl.style.opacity = '1'
      glareEl.style.background = `radial-gradient(
        circle at ${x * 100}% ${y * 100}%,
        rgba(100, 255, 218, 0.1) 0%,
        transparent 60%
      )`
      startAnimation()
    }

    const handleLeave = () => {
      isHovering = false
      targetRotateX = 0
      targetRotateY = 0
      glareEl.style.opacity = '0'
      startAnimation()
    }

    el.addEventListener('mousemove', handleMove, { passive: true })
    el.addEventListener('mouseleave', handleLeave)

    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
      stopAnimation()
      el.style.transform = ''
      el.style.willChange = ''
      if (el.contains(glareEl)) el.removeChild(glareEl)
    }
  }, [enableTilt])

  return (
    <div
      ref={ref}
      className={cx(
        styles.card,
        hoverable && styles.hoverable,
        variant === 'navy' && styles.navy,
        gradientOverlay && styles.gradientOverlay,
        topAccent && styles.topAccent,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
